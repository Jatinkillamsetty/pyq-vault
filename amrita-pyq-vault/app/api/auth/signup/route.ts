import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isAllowedEmail, getAllowedDomains } from "@/lib/allowedEmail";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").trim();
  const email = (body?.email ?? "").trim().toLowerCase();
  const password = body?.password ?? "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are all required." },
      { status: 400 }
    );
  }

  if (!isAllowedEmail(email)) {
    return NextResponse.json(
      {
        error: "Please enter a valid email address.",
      },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists. Try logging in instead." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    },
  });

  return NextResponse.json(
    { id: user.id, email: user.email, name: user.name },
    { status: 201 }
  );
}
