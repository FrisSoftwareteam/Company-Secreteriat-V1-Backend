import { NextRequest } from "next/server";

export function getCorsHeaders(request: NextRequest, methods: string) {
  const defaults = ["https://company-secreteriat-v1-frontend.vercel.app"];
  const raw = process.env.FRONTEND_ORIGIN?.trim() || "";
  const envOrigins = raw
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const allowedOrigins = new Set([...defaults, ...envOrigins]);

  const requestOrigin = request.headers.get("origin")?.replace(/\/$/, "");
  const origin = requestOrigin && allowedOrigins.has(requestOrigin) ? requestOrigin : null;

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  return headers;
}

