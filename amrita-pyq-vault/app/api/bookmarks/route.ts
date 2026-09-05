import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        paper: {
          include: {
            subject: {
              include: {
                branch: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = bookmarks.map((b) => ({
      id: b.paper.id,
      bookmarkId: b.id,
      subjectCode: b.paper.subject.code,
      subjectName: b.paper.subject.name,
      branch: b.paper.subject.branch.code,
      semester: b.paper.subject.semester,
      regulation: b.paper.regulation,
      examType: b.paper.examType,
      year: b.paper.year,
      fileUrl: b.paper.fileUrl,
      bookmarkedAt: b.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const paperId = body?.paperId;

  if (!paperId) {
    return NextResponse.json({ error: "paperId is required." }, { status: 400 });
  }

  try {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_paperId: {
          userId: user.id,
          paperId: paperId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ bookmarked: false, message: "Bookmark removed." });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          paperId: paperId,
        },
      });
      return NextResponse.json({ bookmarked: true, message: "Bookmark added." });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json({ error: "Failed to update bookmark." }, { status: 500 });
  }
}
