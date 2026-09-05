import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExamType, PaperStatus, Regulation } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() || "";
  const branch = searchParams.get("branch");
  const semester = searchParams.get("semester") ? Number(searchParams.get("semester")) : null;
  const regulation = searchParams.get("regulation") as Regulation | null;
  const examType = searchParams.get("examType") as ExamType | null;

  try {
    const whereClause: any = {
      status: PaperStatus.APPROVED,
    };

    if (branch) {
      whereClause.subject = { branch: { code: branch } };
    }

    if (semester) {
      whereClause.subject = {
        ...(whereClause.subject || {}),
        semester: semester,
      };
    }

    if (regulation) {
      whereClause.regulation = regulation;
    }

    if (examType) {
      whereClause.examType = examType;
    }

    if (query) {
      whereClause.OR = [
        { subject: { code: { contains: query, mode: "insensitive" } } },
        { subject: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    const papers = await prisma.paper.findMany({
      where: whereClause,
      include: {
        subject: {
          include: {
            branch: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = papers.map((p) => ({
      id: p.id,
      subjectCode: p.subject.code,
      subjectName: p.subject.name,
      branch: p.subject.branch.code,
      semester: p.subject.semester,
      regulation: p.regulation,
      examType: p.examType,
      year: p.year,
      topTopic: Array.isArray(p.extractedTopics) && p.extractedTopics.length > 0
        ? (p.extractedTopics[0] as any).topic
        : undefined,
      fileUrl: p.fileUrl,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching papers:", error);
    return NextResponse.json({ error: "Failed to fetch papers." }, { status: 500 });
  }
}
