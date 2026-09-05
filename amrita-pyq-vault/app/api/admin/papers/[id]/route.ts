import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaperStatus, Role } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as PaperStatus | undefined;
  const reviewNotes = body?.reviewNotes as string | undefined;

  try {
    const paper = await prisma.paper.findUnique({ where: { id: params.id } });
    if (!paper) {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }

    const updatedPaper = await prisma.paper.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
      },
    });

    await prisma.uploadQueue.upsert({
      where: { paperId: params.id },
      update: {
        ...(status ? { status } : {}),
        ...(reviewNotes ? { reviewNotes } : {}),
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
      create: {
        paperId: params.id,
        status: status || PaperStatus.PENDING,
        reviewNotes: reviewNotes,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Paper status updated successfully.", paper: updatedPaper });
  } catch (error) {
    console.error("Error updating paper:", error);
    return NextResponse.json({ error: "Failed to update paper status." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const paper = await prisma.paper.findUnique({ where: { id: params.id } });
    if (!paper) {
      return NextResponse.json({ error: "Paper not found." }, { status: 404 });
    }

    // Delete child records first
    const questions = await prisma.question.findMany({ where: { paperId: params.id }, select: { id: true } });
    const questionIds = questions.map((q) => q.id);

    if (questionIds.length > 0) {
      await prisma.questionEmbedding.deleteMany({ where: { questionId: { in: questionIds } } });
      await prisma.question.deleteMany({ where: { paperId: params.id } });
    }

    await prisma.uploadQueue.deleteMany({ where: { paperId: params.id } });
    await prisma.bookmark.deleteMany({ where: { paperId: params.id } });

    // Delete paper
    await prisma.paper.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Paper deleted successfully." });
  } catch (error) {
    console.error("Error deleting paper:", error);
    return NextResponse.json({ error: "Failed to delete paper." }, { status: 500 });
  }
}
