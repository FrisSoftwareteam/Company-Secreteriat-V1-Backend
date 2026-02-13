import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";

function resolveAllowedOrigin() {
  const raw = process.env.FRONTEND_ORIGIN?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

function corsHeaders(request: NextRequest) {
  const allowedOrigin = resolveAllowedOrigin();
  const requestOrigin = request.headers.get("origin")?.replace(/\/$/, "");
  const origin = allowedOrigin && requestOrigin === allowedOrigin ? requestOrigin : null;

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  const headers = corsHeaders(request);

  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400, headers });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400, headers });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409, headers });
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, role: true },
    });

    const session = await createSession(user.id);
    await setSessionCookie(session.token, session.expiresAt);

    return NextResponse.json(
      {
        token: session.token,
        user,
      },
      { status: 201, headers }
    );
  } catch {
    return NextResponse.json({ error: "Signup failed." }, { status: 500, headers });
  }
}
