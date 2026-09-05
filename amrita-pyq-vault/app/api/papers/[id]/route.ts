import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id: params.id },
      include: {
        subject: {
          include: {
            branch: true,
          },
        },
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        questions: {
          orderBy: { questionNo: "asc" },
        },
      },
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }

    return NextResponse.json(paper);
  } catch (error) {
    console.error("Error fetching paper details:", error);
    return NextResponse.json({ error: "Failed to fetch paper details." }, { status: 500 });
  }
}
