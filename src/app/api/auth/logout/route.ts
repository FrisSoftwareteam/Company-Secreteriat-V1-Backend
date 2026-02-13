import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCorsHeaders } from "@/lib/api-cors";

function readToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return request.cookies.get("session_token")?.value || null;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request, "POST, OPTIONS") });
}

export async function POST(request: NextRequest) {
  const headers = getCorsHeaders(request, "POST, OPTIONS");
  const token = readToken(request);

  if (token) {
    await db.session.deleteMany({ where: { token } });
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true }, { status: 200, headers });
}

