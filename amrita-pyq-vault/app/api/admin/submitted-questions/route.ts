import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  if (user?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin authorization required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") || "ALL";

  const whereClause: any = {};
  if (statusParam !== "ALL") {
    whereClause.status = statusParam;
  }

  const submissions = await prisma.questionSubmission.findMany({
    where: whereClause,
    include: {
      submittedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(submissions);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  if (user?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin authorization required." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const { id, action, reviewNotes } = body || {};

  if (!id || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid request payload. Must specify id and action ('APPROVE' or 'REJECT')." },
      { status: 400 }
    );
  }

  const updatedStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

  const updated = await prisma.questionSubmission.update({
    where: { id },
    data: {
      status: updatedStatus,
      reviewNotes: reviewNotes ? String(reviewNotes).trim() : null,
    },
  });

  return NextResponse.json({
    message: `Question status updated to ${updatedStatus}.`,
    submission: updated,
  });
}
