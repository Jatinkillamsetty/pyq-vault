import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JEE_PYQS } from "@/lib/jeeData";

export const dynamic = 'force-dynamic';

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  let userEmail = session?.user?.email;

  // Fallback to default student if no session is active
  if (!userEmail) {
    userEmail = "student@cb.amrita.edu";
  }

  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    // If student user missing, grab first user in DB
    user = await prisma.user.findFirst();
  }

  if (!user) {
    return NextResponse.json({ error: "User context not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const userMessage = (body?.message || "").trim();

  if (!userMessage) {
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  }

  try {
    // 1. Fetch user's previous 10 chat messages for context
    const previousMessages = await prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    previousMessages.reverse();

    // 2. Retrieve live RAG context from PostgreSQL database
    const subjects = await prisma.subject.findMany({
      include: {
        branch: true,
        papers: {
          include: {
            questions: true,
          },
        },
      },
    });

    let dbContextSummary = "Official Amrita & JEE PYQ Database Context:\n";
    let matchingQuestions: any[] = [];

    // Tokenize search query for smart matching
    const stopWords = new Set(["what", "how", "why", "can", "you", "give", "tell", "show", "find", "list", "with", "the", "for", "explain", "concept", "concepts", "solved", "question", "questions", "solve", "about", "me", "some", "in", "few", "lines"]);
    const queryTokens = userMessage
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((t: string) => t.length > 2 && !stopWords.has(t));

    // Rank JEE_PYQS matches by relevance (chapter match > subtopic match > question text match)
    const jeeScoredMatches = JEE_PYQS.map((q) => {
      let score = 0;
      const chLower = q.chapter.toLowerCase();
      const subLower = (q.subtopic || "").toLowerCase();
      const qLower = q.question.toLowerCase();
      for (const token of queryTokens) {
        if (chLower.includes(token)) score += 10;
        if (subLower.includes(token)) score += 5;
        if (qLower.includes(token)) score += 2;
      }
      return { q, score };
    })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);

    const jeeMatches = jeeScoredMatches.map((m) => m.q);

    if (jeeMatches.length > 0) {
      dbContextSummary += `\nJEE Chapter Question Matches (${jeeMatches.length} found):\n`;
      for (const jq of jeeMatches.slice(0, 10)) {
        dbContextSummary += `- [${jq.subject} - ${jq.chapter} (${jq.year})] Q: "${jq.question}" | Correct Option: ${jq.correctOption} | Solution: ${jq.solution.slice(0, 180)}...\n`;
      }
    }

    for (const sub of subjects) {
      if (sub.papers.length === 0) continue;
      dbContextSummary += `\nSubject: ${sub.name} (${sub.code}), Branch: ${sub.branch.code}, Total Papers: ${sub.papers.length}\n`;

      const allQuestions = sub.papers.flatMap((p) =>
        p.questions.map((q) => ({ ...q, year: p.year, examType: p.examType, fileUrl: p.fileUrl }))
      );
      const topicFreq: Record<string, number> = {};

      for (const q of allQuestions) {
        const topic = q.topic || "General";
        topicFreq[topic] = (topicFreq[topic] || 0) + 1;

        if (queryTokens.some((t: string) => q.text.toLowerCase().includes(t) || topic.toLowerCase().includes(t))) {
          matchingQuestions.push({
            subjectCode: sub.code,
            subjectName: sub.name,
            questionNo: q.questionNo,
            year: q.year,
            text: q.text,
            marks: q.marks,
            topic: q.topic,
          });
        }
      }

      const topTopics = Object.entries(topicFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([t, f]) => `${t} (${f}x)`)
        .join(", ");

      dbContextSummary += `Key Tested Topics: ${topTopics || "None extracted"}\n`;
    }

    if (matchingQuestions.length > 0) {
      dbContextSummary += `\nDirect Database Question Matches (${matchingQuestions.length} found):\n`;
      for (const mq of matchingQuestions.slice(0, 10)) {
        dbContextSummary += `- [${mq.subjectCode} ${mq.year}] ${mq.questionNo}: "${mq.text}" (${mq.marks ? mq.marks + " marks" : "N/A"})\n`;
      }
    }

    let assistantResponse = "";

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const systemInstruction = `
You are the official AI Study Assistant powered directly by Gemini for students.
You can answer ANY general academic or conceptual question (e.g. definitions, explanations, formulas, derivations, study tips) as well as past year paper (PYQ) questions directly, accurately, and concisely.

GUIDELINES:
- Directly and thoroughly answer the user's prompt (e.g., if asked "explain p block in few lines", immediately provide a clear, 3-4 bullet explanation of p-block elements).
- Use clean Markdown formatting with headers, bold points, bullet lists, and LaTeX equations ($ns^2 np^{1-6}$, etc.) where applicable.
- If relevant past paper questions exist in the database context, seamlessly append 1-2 sample questions with options and step-by-step solutions.

DATABASE CONTEXT:
${dbContextSummary}
`.trim();

      const contentsParts: any[] = [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${userMessage}` }],
        },
      ];

      try {
        const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: contentsParts,
            generationConfig: {
              temperature: 0.7,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json();
          assistantResponse = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          const errText = await geminiRes.text();
          console.error("Gemini API Error:", errText);
        }
      } catch (e) {
        console.error("Gemini chat error:", e);
      }
    }

    // Dynamic intelligent response generator if AI key is missing or offline
    if (!assistantResponse) {
      if (jeeMatches.length > 0) {
        const primaryMatch = jeeMatches[0];
        const chapter = primaryMatch.chapter;
        const subject = primaryMatch.subject;
        const matchedChapterQs = jeeMatches.filter((q) => q.chapter === chapter);

        assistantResponse = `### 📚 ${subject} — ${chapter} Concepts & PYQs\n\n`;

        const chLower = chapter.toLowerCase();
        const msgLower = userMessage.toLowerCase();

        assistantResponse += `#### 🔑 Key Formulas & Core Equations:\n`;
        if (chLower.includes("kinematics")) {
          assistantResponse += `- **1D Motion Equations**: $v = u + at$, $s = ut + \\frac{1}{2}at^2$, $v^2 = u^2 + 2as$\n`;
          assistantResponse += `- **Nth Second Distance**: $s_n = u + \\frac{a}{2}(2n - 1)$\n`;
          assistantResponse += `- **Projectile Motion**: $T = \\frac{2u \\sin\\theta}{g}$, $H_{max} = \\frac{u^2 \\sin^2\\theta}{2g}$, $R = \\frac{u^2 \\sin 2\\theta}{g}$\n`;
          assistantResponse += `- **Relative Velocity in 2D**: $\\vec{v}_{AB} = \\vec{v}_A - \\vec{v}_B$\n\n`;
        } else if (chLower.includes("mole concept") || chLower.includes("basic concepts")) {
          assistantResponse += `- **Moles ($n$)**: $n = \\frac{\\text{Mass}}{\\text{Molar Mass}} = \\frac{\\text{Number of Particles}}{N_A} = \\frac{V_{\\text{gas (STP)}}}{22.4\\text{ L}}$\n`;
          assistantResponse += `- **Molarity ($M$)**: $M = \\frac{\\text{Moles of Solute}}{\\text{Volume of Solution (L)}}$\n`;
          assistantResponse += `- **Molality ($m$)**: $m = \\frac{\\text{Moles of Solute}}{\\text{Mass of Solvent (kg)}}$\n`;
          assistantResponse += `- **Empirical Formula Ratio**: $\\text{Moles} = \\frac{\\%\\text{ Element}}{\\text{Atomic Mass}} \\implies \\text{Simplest Whole Number Ratio}$\n`;
          assistantResponse += `- **Equivalent Weight**: $E = \\frac{\\text{Molar Mass}}{n\\text{-factor}}$\n\n`;
        } else if (chLower.includes("atomic structure")) {
          assistantResponse += `- **Bohr Radius**: $r_n = 0.529 \\frac{n^2}{Z} \\text{ Å}$\n`;
          assistantResponse += `- **Bohr Energy**: $E_n = -13.6 \\frac{Z^2}{n^2} \\text{ eV}$\n`;
          assistantResponse += `- **Rydberg Formula**: $\\frac{1}{\\lambda} = R Z^2 \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)$\n`;
          assistantResponse += `- **de Broglie Wavelength**: $\\lambda = \\frac{h}{p} = \\frac{h}{mv} = \\frac{h}{\\sqrt{2m q V}}$\n`;
          assistantResponse += `- **Heisenberg Uncertainty**: $\\Delta x \\cdot \\Delta p \\ge \\frac{h}{4\\pi}$\n\n`;
        } else if (chLower.includes("bonding") || chLower.includes("molecular structure")) {
          assistantResponse += `- **Hybridization Domain**: $\\text{Steric Number} = \\text{Bond Pairs} + \\text{Lone Pairs}$\n`;
          assistantResponse += `- **Hybridization Types**: $2 \\to sp\\text{ (Linear)}, 3 \\to sp^2\\text{ (Trigonal Planar)}, 4 \\to sp^3\\text{ (Tetrahedral)}, 5 \\to sp^3d\\text{ (TBP)}, 6 \\to sp^3d^2\\text{ (Octahedral)}$\n`;
          assistantResponse += `- **MOT Bond Order**: $\\text{Bond Order} = \\frac{N_b - N_a}{2}$\n`;
          assistantResponse += `- **VSEPR Repulsion Order**: $\\text{Lone Pair-Lone Pair} > \\text{Lone Pair-Bond Pair} > \\text{Bond Pair-Bond Pair}$\n\n`;
        } else if (chLower.includes("quadratic")) {
          assistantResponse += `- **Roots Formula**: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n`;
          assistantResponse += `- **Sum & Product of Roots**: $\\alpha + \\beta = -\\frac{b}{a}$, $\\alpha \\beta = \\frac{c}{a}$\n`;
          assistantResponse += `- **Roots Difference**: $|\\alpha - \\beta| = \\frac{\\sqrt{D}}{|a|}$\n`;
          assistantResponse += `- **Discriminant $D$**: $D = b^2 - 4ac$ ($D > 0$: Real & Distinct, $D=0$: Real & Equal, $D < 0$: Complex)\n\n`;
        } else if (chLower.includes("limit") || chLower.includes("integral") || chLower.includes("derivative")) {
          assistantResponse += `- **L'Hopital's Rule**: $\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)} \\text{ (for } \\frac{0}{0} \\text{ or } \\frac{\\infty}{\\infty}\\text{)}$\n`;
          assistantResponse += `- **Standard Limit**: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$, $\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$\n`;
          assistantResponse += `- **Integration by Parts**: $\\int u \\, dv = uv - \\int v \\, du$\n\n`;
        } else {
          assistantResponse += `- **Core Principle**: Standard relations and equations for ${chapter}.\n`;
          assistantResponse += `- **Parameter Evaluation**: Apply parameters across boundary conditions and solve for target variables.\n\n`;
        }

        assistantResponse += `#### 📝 Key Practice Questions & Solutions (${matchedChapterQs.length} available):\n\n`;
        for (let i = 0; i < Math.min(3, matchedChapterQs.length); i++) {
          const q = matchedChapterQs[i];
          assistantResponse += `**Question ${i + 1} (${q.exam} ${q.year})**:\n${q.question}\n`;
          if (q.options && q.options.length > 0) {
            assistantResponse += `Options:\n` + q.options.map((o) => `  - **(${o.id})**: ${o.text}`).join("\n") + `\n`;
          }
          assistantResponse += `✅ **Correct Answer**: Option **(${q.correctOption})**\n💡 **Solution**: ${q.solution}\n\n---\n\n`;
        }

        assistantResponse += `💡 *Tip: You can practice all questions for **${chapter}** with the interactive scratchpad under [JEE PYQs & Scratchpad](/jee-practice?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}).*`;
      } else if (matchingQuestions.length > 0) {
        assistantResponse = `I found **${matchingQuestions.length} matching question(s)** in the PYQ database for your query:\n\n` +
          matchingQuestions
            .slice(0, 5)
            .map((q) => `• **[${q.subjectCode} ${q.year}] ${q.questionNo}**: "${q.text}" (${q.marks ? q.marks + " Marks" : ""})`)
            .join("\n\n");
      } else {
        assistantResponse = `### 📚 Core Concepts & PYQ Guide for "${userMessage}"\n\n` +
          `#### 🔑 Key Overview & Principles:\n` +
          `- **Database Search**: Grounded in 1,000+ chapter-wise past exam questions covering Physics, Chemistry, and Mathematics.\n` +
          `- **Step-by-Step Problem Solving**: Each topic features verified MCQs, correct options, and step-by-step solutions.\n\n` +
          `#### 💡 Recommended Next Steps:\n` +
          `1. **Practice PYQs**: Go to [/jee-practice](/jee-practice) to solve chapter questions interactively with the canvas.\n` +
          `2. **View Cheatsheets**: Open [/cheatsheets](/cheatsheets) to inspect frequency weightage and repeated question vector analysis.`;
      }
    }

    // Store user & assistant message in database
    await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: "user",
        content: userMessage,
      },
    });

    await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: "assistant",
        content: assistantResponse,
      },
    });

    return NextResponse.json({
      reply: assistantResponse,
      matchingQuestionsCount: jeeMatches.length + matchingQuestions.length,
    });
  } catch (error) {
    console.error("Error in AI Assistant chat:", error);
    return NextResponse.json({ error: "Failed to process AI chat query." }, { status: 500 });
  }
}
