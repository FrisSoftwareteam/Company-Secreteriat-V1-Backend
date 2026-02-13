import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export type ApiSessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  token: string;
};

function readToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return request.cookies.get("session_token")?.value || null;
}

export async function getApiSessionUser(request: NextRequest): Promise<ApiSessionUser | null> {
  const token = readToken(request);
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    token,
  };
}

