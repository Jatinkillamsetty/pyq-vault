import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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
    const queueEntries = await prisma.uploadQueue.findMany({
      include: {
        paper: {
          include: {
            subject: {
              include: {
                branch: true,
              },
            },
            uploadedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    const totalPapers = await prisma.paper.count();
    const approvedCount = await prisma.paper.count({ where: { status: "APPROVED" } });
    const pendingCount = await prisma.paper.count({ where: { status: "PENDING" } });
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      stats: {
        totalPapers,
        approvedCount,
        pendingCount,
        totalUsers,
      },
      queue: queueEntries,
    });
  } catch (error) {
    console.error("Error fetching admin queue:", error);
    return NextResponse.json({ error: "Failed to fetch admin moderation queue." }, { status: 500 });
  }
}
