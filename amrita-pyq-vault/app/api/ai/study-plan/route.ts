import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JEE_PYQS } from "@/lib/jeeData";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  let userEmail = session?.user?.email;
  if (!userEmail) {
    userEmail = "student@cb.amrita.edu";
  }

  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    user = await prisma.user.findFirst();
  }

  const body = await req.json().catch(() => null);
  const subjectCode = body?.subjectCode || "JEE_PHYSICS";
  const daysRemaining = Number(body?.daysRemaining || 5);
  const hoursPerDay = Number(body?.hoursPerDay || 3);
  const prepLevel = body?.prepLevel || "INTERMEDIATE";

  try {
    let subjectName = "JEE Main & Advanced Preparation";
    let sortedTopics: { topic: string; count: number }[] = [];

    let dbSubject: any = null;
    if (subjectCode.startsWith("JEE_") || ["Physics", "Chemistry", "Mathematics"].includes(subjectCode)) {
      const jeeSub = subjectCode.replace("JEE_", "");
      const matchedName = jeeSub === "MATHEMATICS" ? "Mathematics" : jeeSub === "CHEMISTRY" ? "Chemistry" : "Physics";
      subjectName = `JEE ${matchedName}`;

      const filteredQuestions = JEE_PYQS.filter(
        (q) => q.subject.toLowerCase() === matchedName.toLowerCase()
      );

      const topicCounts: Record<string, number> = {};
      for (const q of filteredQuestions) {
        topicCounts[q.chapter] = (topicCounts[q.chapter] || 0) + 1;
      }

      sortedTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([topic, count]) => ({ topic, count }));
    } else {
      dbSubject = await prisma.subject.findFirst({
        where: { code: subjectCode },
        include: {
          papers: {
            include: {
              questions: true,
            },
          },
        },
      });

      if (dbSubject) {
        subjectName = dbSubject.name;
        const allQuestions = dbSubject.papers.flatMap((p: any) => p.questions);
        const topicCounts: Record<string, number> = {};
        for (const q of allQuestions) {
          const topic = q.topic || "General";
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }

        sortedTopics = Object.entries(topicCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([topic, count]) => ({ topic, count }));
      }
    }

    let daysPlan: { day: number; title: string; focusTopics: string[]; tasks: string[]; targetHours: number }[] = [];

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const prompt = `
You are an expert academic study planner for university engineering exams.
Subject: ${subjectName} (${subjectCode})
Days remaining until exam: ${daysRemaining} days
Study time available: ${hoursPerDay} hours per day
Current preparation level: ${prepLevel}

Most frequently tested PYQ topics from actual past papers:
${sortedTopics.map((t) => `- ${t.topic} (Appeared ${t.count} times)`).join("\n")}

Generate a realistic, structured, day-by-day revision timetable for all ${daysRemaining} days.
Prioritize the highest-frequency PYQ topics first.

Output strict JSON with this exact array structure:
[
  {
    "day": 1,
    "title": "Core High-Priority Topics",
    "focusTopics": ["AVL Trees", "Graph Traversals"],
    "tasks": ["Revise AVL rotations with 3 past paper examples", "Practice BFS/DFS graph algorithm code"],
    "targetHours": ${hoursPerDay}
  }
]
Return ONLY JSON.
`.trim();

      try {
        const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json();
          const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            daysPlan = JSON.parse(rawText);
          }
        }
      } catch (e) {
        console.error("Gemini study plan error:", e);
      }
    }

    // Fallback study plan generator with real chapter subtopics & concepts
    if (!daysPlan || daysPlan.length === 0) {
      // Extract real subtopics from JEE_PYQS or subject/chapter name
      const chapterName = (subjectName || subjectCode).replace(/^[A-Z0-9_]+\s*-\s*/, "").replace(/^JEE_/, "").trim();
      const matchingQs = JEE_PYQS.filter((q) => 
        q.chapter.toLowerCase().includes(chapterName.toLowerCase()) || 
        chapterName.toLowerCase().includes(q.chapter.toLowerCase()) ||
        q.subject.toLowerCase() === chapterName.toLowerCase()
      );

      const realSubtopics = Array.from(new Set(matchingQs.map((q) => q.subtopic).filter(Boolean)));

      let topicsList: string[] = [];
      if (sortedTopics.length > 0 && !sortedTopics[0].topic.startsWith("Module")) {
        topicsList = sortedTopics.map((t) => t.topic);
      } else if (realSubtopics.length > 0) {
        topicsList = realSubtopics;
      } else {
        topicsList = [
          `${chapterName} Core Principles & Definitions`,
          `${chapterName} Formulas & Key Equations`,
          `${chapterName} Important Problem Types`,
          `${chapterName} Advanced Applications & PYQs`,
          `${chapterName} Speed Revision & Practice Set`,
        ];
      }

      for (let d = 1; d <= daysRemaining; d++) {
        const primaryTopic = topicsList[(d - 1) % topicsList.length];
        const secondaryTopic = topicsList[d % topicsList.length] || primaryTopic;
        daysPlan.push({
          day: d,
          title: d === daysRemaining ? `Final ${chapterName} PYQ Mock & Rapid Revision` : `Mastering ${primaryTopic}`,
          focusTopics: [primaryTopic, secondaryTopic],
          tasks: [
            `Solve 3 past paper questions on ${primaryTopic}`,
            `Review formulas, reaction mechanisms, and key derivations for ${secondaryTopic}`,
            `Self-test with timed chapter PYQ practice set`,
          ],
          targetHours: hoursPerDay,
        });
      }
    }

    // Save study plan to database if user and subject exist
    let planId = `plan-${Date.now()}`;
    if (user && dbSubject) {
      const savedPlan = await prisma.studyPlan.create({
        data: {
          userId: user.id,
          subjectId: dbSubject.id,
          daysRemaining: daysRemaining,
          hoursPerDay: hoursPerDay,
          prepLevel: prepLevel,
          planJson: daysPlan,
        },
      });
      planId = savedPlan.id;
    }

    return NextResponse.json({
      id: planId,
      subjectCode: subjectCode,
      subjectName: subjectName,
      daysRemaining,
      hoursPerDay,
      prepLevel,
      plan: daysPlan,
    });
  } catch (error) {
    console.error("Error creating study plan:", error);
    return NextResponse.json({ error: "Failed to generate study plan." }, { status: 500 });
  }
}
