import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCorsHeaders } from "@/lib/api-cors";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request, "POST, OPTIONS") });
}

export async function POST(request: NextRequest) {
  const headers = getCorsHeaders(request, "POST, OPTIONS");

  try {
    const body = await request.json();
    const loginAs = String(body?.loginAs || "").toUpperCase();
    const identifier = String(body?.identifier || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!loginAs || !identifier || !password) {
      return NextResponse.json(
        { error: "Login role, username/email and password are required." },
        { status: 400, headers }
      );
    }

    if (loginAs !== "ADMIN" && loginAs !== "USER") {
      return NextResponse.json({ error: "Invalid login role selected." }, { status: 400, headers });
    }

    const user = await db.user.findUnique({ where: { email: identifier } });
    if (!user) {
      return NextResponse.json({ error: "Invalid username/email or password." }, { status: 401, headers });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username/email or password." }, { status: 401, headers });
    }

    if (user.role !== loginAs) {
      return NextResponse.json(
        { error: `This account is registered as ${user.role}. Please choose ${user.role} login.` },
        { status: 403, headers }
      );
    }

    const session = await createSession(user.id);
    await setSessionCookie(session.token, session.expiresAt);

    return NextResponse.json(
      {
        token: session.token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200, headers }
    );
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500, headers });
  }
}

