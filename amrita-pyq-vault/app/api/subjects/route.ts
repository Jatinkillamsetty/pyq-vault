import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        branch: true,
        _count: {
          select: { papers: true },
        },
      },
      orderBy: { code: "asc" },
    });

    const formatted = subjects.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      semester: s.semester,
      regulation: s.regulation,
      branch: s.branch.code,
      paperCount: s._count.papers,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Failed to fetch subjects." }, { status: 500 });
  }
}
