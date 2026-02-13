import { NextRequest, NextResponse } from "next/server";
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
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request, "GET, OPTIONS") });
}

export async function GET(request: NextRequest) {
  const headers = getCorsHeaders(request, "GET, OPTIONS");
  const token = readToken(request);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { token } }).catch(() => {});
    return NextResponse.json({ error: "Session expired" }, { status: 401, headers });
  }

  return NextResponse.json(
    {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
    },
    { status: 200, headers }
  );
}

