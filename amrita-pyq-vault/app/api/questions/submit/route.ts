import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required to submit questions." },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  const {
    subject,
    branch,
    chapter,
    subtopic,
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption,
    solution,
    exam,
    year,
    difficulty,
  } = body || {};

  if (
    !subject ||
    !chapter ||
    !questionText ||
    !optionA ||
    !optionB ||
    !optionC ||
    !optionD ||
    !correctOption ||
    !solution
  ) {
    return NextResponse.json(
      { error: "Please fill out all required question details, options, and solution." },
      { status: 400 }
    );
  }

  const submission = await prisma.questionSubmission.create({
    data: {
      subject: String(subject).trim(),
      branch: branch ? String(branch).trim() : "General",
      chapter: String(chapter).trim(),
      subtopic: subtopic ? String(subtopic).trim() : null,
      questionText: String(questionText).trim(),
      optionA: String(optionA).trim(),
      optionB: String(optionB).trim(),
      optionC: String(optionC).trim(),
      optionD: String(optionD).trim(),
      correctOption: String(correctOption).trim().toUpperCase(),
      solution: String(solution).trim(),
      exam: exam ? String(exam).trim() : "JEE Main",
      year: year ? parseInt(String(year), 10) : new Date().getFullYear(),
      difficulty: difficulty ? String(difficulty).trim() : "Medium",
      status: "PENDING",
      submittedById: user.id,
    },
  });

  return NextResponse.json(
    {
      message: "Question submitted successfully and sent for admin approval!",
      submission,
    },
    { status: 201 }
  );
}
