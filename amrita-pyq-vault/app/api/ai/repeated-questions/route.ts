import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JEE_PYQS } from "@/lib/jeeData";

const GEMINI_EMBEDDING_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";

// Cosine similarity between two float vectors
function calculateCosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length || v1.length === 0) return 0;
  let dot = 0;
  let mag1 = 0;
  let mag2 = 0;
  for (let i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    mag1 += v1[i] * v1[i];
    mag2 += v2[i] * v2[i];
  }
  if (mag1 === 0 || mag2 === 0) return 0;
  return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

// Generate fallback deterministic 768-dim embedding vector from text using TF-IDF & keyword hashing
function generateFallbackEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  const vector = new Array(768).fill(0);

  // Common stop words to ignore
  const stopWords = new Set(["explain", "describe", "discuss", "compare", "differentiate", "with", "and", "the", "for", "using"]);

  for (const word of words) {
    if (stopWords.has(word)) continue;
    // Hash key features to vector indices
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx1 = Math.abs(hash) % 768;
    const idx2 = Math.abs((hash * 31) | 0) % 768;
    vector[idx1] += 2.0;
    vector[idx2] += 1.0;
  }

  // Normalize
  let mag = 0;
  for (let i = 0; i < 768; i++) mag += vector[i] * vector[i];
  mag = Math.sqrt(mag);
  if (mag > 0) {
    for (let i = 0; i < 768; i++) vector[i] /= mag;
  }
  return vector;
}

async function getOrComputeEmbedding(questionId: string, text: string): Promise<number[]> {
  const existing = await prisma.questionEmbedding.findUnique({
    where: { questionId },
  });

  if (existing && existing.vector && existing.vector.length > 0) {
    return existing.vector;
  }

  let vector: number[] | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(`${GEMINI_EMBEDDING_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        vector = data?.embedding?.values || null;
      }
    } catch (e) {
      console.error("Gemini embedding error:", e);
    }
  }

  if (!vector || vector.length === 0) {
    vector = generateFallbackEmbedding(text);
  }

  await prisma.questionEmbedding.upsert({
    where: { questionId },
    update: { vector },
    create: { questionId, vector },
  });

  return vector;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectCode = searchParams.get("subjectCode") || "21CSE201";

  try {
    // 1. Query Prisma DB questions
    const dbQuestions = await prisma.question.findMany({
      where: {
        paper: {
          subject: {
            code: subjectCode,
          },
        },
      },
      include: {
        paper: {
          select: {
            year: true,
            examType: true,
          },
        },
      },
    });

    const unifiedQuestions: {
      id: string;
      text: string;
      questionNo: string;
      year: number;
      examType: string;
      topic: string;
      marks?: number;
    }[] = dbQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      questionNo: q.questionNo,
      year: q.paper.year,
      examType: q.paper.examType,
      topic: q.topic || "General",
      marks: q.marks || 5,
    }));

    // 2. Query JEE_PYQS database questions for matching subject or chapter
    const searchLower = subjectCode
      .toLowerCase()
      .replace(/^jee_/, "")
      .replace(/^[a-z0-9_]+\s*-\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .trim();

    let matchedJeeQuestions: typeof JEE_PYQS = [];

    if (searchLower === "physics" || subjectCode === "JEE_PHYSICS") {
      matchedJeeQuestions = JEE_PYQS.filter((q) => q.subject === "Physics");
    } else if (searchLower === "chemistry" || subjectCode === "JEE_CHEMISTRY" || subjectCode.startsWith("CHM")) {
      matchedJeeQuestions = JEE_PYQS.filter((q) => q.subject === "Chemistry");
    } else if (searchLower === "mathematics" || searchLower === "maths" || subjectCode === "JEE_MATHEMATICS" || subjectCode.startsWith("MTH")) {
      matchedJeeQuestions = JEE_PYQS.filter((q) => q.subject === "Mathematics");
    } else {
      // Specific Chapter search
      matchedJeeQuestions = JEE_PYQS.filter((q) => {
        const chLower = q.chapter.toLowerCase().replace(/^\d+\.\s*/, "");
        return chLower.includes(searchLower) || searchLower.includes(chLower);
      });
      if (matchedJeeQuestions.length === 0) {
        const isChem = searchLower.includes("chem");
        const isMath = searchLower.includes("math") || searchLower.includes("integ");
        const sub = isChem ? "Chemistry" : isMath ? "Mathematics" : "Physics";
        matchedJeeQuestions = JEE_PYQS.filter((q) => q.subject === sub);
      }
    }

    for (let idx = 0; idx < matchedJeeQuestions.length; idx++) {
      const jq = matchedJeeQuestions[idx];
      unifiedQuestions.push({
        id: jq.id,
        text: jq.question,
        questionNo: `Q${idx + 1}`,
        year: jq.year,
        examType: jq.exam,
        topic: jq.subtopic || jq.chapter,
        marks: 4,
      });
    }

    if (unifiedQuestions.length < 2) {
      return NextResponse.json({
        subjectCode,
        totalQuestionsAnalyzed: 0,
        repeatedClustersCount: 0,
        clusters: [],
      });
    }

    // Compute embeddings for all questions
    const embeddings: { question: typeof unifiedQuestions[0]; vector: number[] }[] = [];
    for (const q of unifiedQuestions) {
      const vec = generateFallbackEmbedding(q.text + " " + q.topic);
      embeddings.push({ question: q, vector: vec });
    }

    // Pairwise cosine similarity matrix
    const matches: any[] = [];
    const pairedPairs = new Set<string>();

    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const q1 = embeddings[i].question;
        const q2 = embeddings[j].question;

        if (q1.id === q2.id) continue;

        // Compare similarity
        const sim = calculateCosineSimilarity(embeddings[i].vector, embeddings[j].vector);
        const sameSubtopic = q1.topic.toLowerCase() === q2.topic.toLowerCase() && q1.topic !== "General";
        
        if (sim >= 0.22 || sameSubtopic) {
          let score = Math.round(sim * 100);
          if (sameSubtopic) {
            score = Math.min(96, Math.max(78, score + 35));
          }

          if (score >= 60) {
            const pairKey = [q1.id, q2.id].sort().join("-");
            if (!pairedPairs.has(pairKey)) {
              pairedPairs.add(pairKey);
              matches.push({
                similarity: score,
                topic: q1.topic || q2.topic,
                questionA: {
                  id: q1.id,
                  text: q1.text,
                  questionNo: q1.questionNo,
                  year: q1.year,
                  examType: q1.examType,
                  marks: q1.marks,
                },
                questionB: {
                  id: q2.id,
                  text: q2.text,
                  questionNo: q2.questionNo,
                  year: q2.year,
                  examType: q2.examType,
                  marks: q2.marks,
                },
              });
            }
          }
        }
      }
    }

    matches.sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({
      subjectCode,
      totalQuestionsAnalyzed: unifiedQuestions.length,
      repeatedClustersCount: matches.length,
      clusters: matches.slice(0, 15),
    });
  } catch (error) {
    console.error("Error computing repeated questions:", error);
    return NextResponse.json({ error: "Failed to calculate repeated questions." }, { status: 500 });
  }
}
