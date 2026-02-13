import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/api-cors";
import { getApiSessionUser } from "@/lib/api-session";
import { surveys } from "@/lib/surveys";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request, "GET, OPTIONS") });
}

export async function GET(request: NextRequest) {
  const headers = getCorsHeaders(request, "GET, OPTIONS");
  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const filteredSurveys = q
    ? surveys.filter(
        (survey) =>
          survey.title.toLowerCase().includes(q) || survey.description.toLowerCase().includes(q)
      )
    : surveys;

  return NextResponse.json({ surveys: filteredSurveys }, { status: 200, headers });
}

