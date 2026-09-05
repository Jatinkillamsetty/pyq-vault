import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExamType, PaperStatus, Regulation, Role } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { parsePdfQuestionsAndTopics } from "@/lib/pdfExtractor";

export const dynamic = 'force-dynamic';

async function autoExtractQuestionsAndTopics(
  paperId: string,
  fileUrl: string,
  subjectCode: string,
  subjectName: string,
  year: number,
  examType: string
) {
  try {
    const extractedQuestions = await parsePdfQuestionsAndTopics({
      paperId,
      fileUrl,
      subjectCode,
      subjectName,
      year,
      examType,
    });

    // Save questions to DB
    for (const q of extractedQuestions) {
      await prisma.question.create({
        data: {
          paperId: paperId,
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
      where: { id: paperId },
      data: { extractedTopics: topicList },
    });
  } catch (err) {
    console.error("Error in autoExtractQuestionsAndTopics:", err);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subjectCode = (formData.get("subjectCode") as string || "").trim().toUpperCase();
    const subjectName = (formData.get("subjectName") as string || "").trim();
    const branchCode = (formData.get("branchCode") as string || "").trim().toUpperCase();
    const semester = Number(formData.get("semester") || 1);
    const regulation = (formData.get("regulation") as Regulation) || Regulation.R2021;
    const examType = (formData.get("examType") as ExamType) || ExamType.END_SEM;
    const year = Number(formData.get("year") || new Date().getFullYear());

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 15MB limit." }, { status: 400 });
    }

    if (!subjectCode || !subjectName || !branchCode) {
      return NextResponse.json({ error: "Subject code, subject name, and branch code are required." }, { status: 400 });
    }

    // Ensure branch exists
    let branch = await prisma.branch.findUnique({ where: { code: branchCode } });
    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          code: branchCode,
          name: `${branchCode} Department`,
        },
      });
    }

    // Ensure subject exists
    let subject = await prisma.subject.findUnique({
      where: {
        code_regulation: {
          code: subjectCode,
          regulation: regulation,
        },
      },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          code: subjectCode,
          name: subjectName,
          semester: semester,
          regulation: regulation,
          branchId: branch.id,
        },
      });
    }

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueHash = crypto.randomBytes(8).toString("hex");
    const sanitizedFileName = `${subjectCode}_${examType}_${year}_${uniqueHash}.pdf`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, sanitizedFileName);

    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/${sanitizedFileName}`;

    // Admin uploads are auto-approved; student uploads require moderation
    const status = user.role === Role.ADMIN ? PaperStatus.APPROVED : PaperStatus.PENDING;

    const paper = await prisma.paper.create({
      data: {
        subjectId: subject.id,
        examType: examType,
        year: year,
        regulation: regulation,
        fileUrl: fileUrl,
        status: status,
        uploadedById: user.id,
      },
    });

    // Create UploadQueue entry
    await prisma.uploadQueue.create({
      data: {
        paperId: paper.id,
        status: status,
      },
    });

    // Auto extract unique topics and questions immediately upon upload
    await autoExtractQuestionsAndTopics(paper.id, fileUrl, subjectCode, subjectName, year, examType);

    return NextResponse.json({
      message: status === PaperStatus.APPROVED ? "Paper uploaded, published, and topics extracted successfully." : "Paper uploaded and submitted for moderation.",
      paper: paper,
      subjectCode: subjectCode,
    }, { status: 201 });
  } catch (error) {
    console.error("Error processing paper upload:", error);
    return NextResponse.json({ error: "Server error processing PDF upload." }, { status: 500 });
  }
}
