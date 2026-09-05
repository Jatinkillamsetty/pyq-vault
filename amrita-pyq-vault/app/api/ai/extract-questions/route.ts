import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePdfQuestionsAndTopics } from "@/lib/pdfExtractor";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const paperId = body?.paperId;

  if (!paperId) {
    return NextResponse.json({ error: "paperId is required." }, { status: 400 });
  }

  try {
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: { subject: true },
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }

    // Extract unique questions and topics based on PDF file contents and metadata
    const extractedQuestions = await parsePdfQuestionsAndTopics({
      paperId: paper.id,
      fileUrl: paper.fileUrl,
      subjectCode: paper.subject.code,
      subjectName: paper.subject.name,
      year: paper.year,
      examType: paper.examType,
    });

    // Delete previous questions for this paper to allow fresh re-extraction
    await prisma.question.deleteMany({ where: { paperId: paper.id } });

    // Insert extracted questions into DB
    for (const q of extractedQuestions) {
      await prisma.question.create({
        data: {
          paperId: paper.id,
          questionNo: q.questionNo,
          text: q.text,
          marks: q.marks,
          unit: q.unit,
          topic: q.topic,
        },
      });
    }

    // Aggregate topic frequencies
    const topicMap: Record<string, number> = {};
    for (const q of extractedQuestions) {
      const topicName = q.topic || "General";
      topicMap[topicName] = (topicMap[topicName] || 0) + 1;
    }
    const topicList = Object.entries(topicMap).map(([topic, frequency]) => ({ topic, frequency }));

    await prisma.paper.update({
      where: { id: paper.id },
      data: { extractedTopics: topicList },
    });

    return NextResponse.json({
      message: "Questions extracted successfully.",
      questionsCount: extractedQuestions.length,
      topics: topicList,
    });
  } catch (error) {
    console.error("Error extracting questions:", error);
    return NextResponse.json({ error: "Failed to extract questions from PDF." }, { status: 500 });
  }
}
