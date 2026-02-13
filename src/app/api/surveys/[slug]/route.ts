import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/api-cors";
import { getApiSessionUser } from "@/lib/api-session";
import { getSurveyBySlug } from "@/lib/surveys";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request, "GET, OPTIONS") });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const headers = getCorsHeaders(request, "GET, OPTIONS");
  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { slug } = await params;
  const survey = getSurveyBySlug(slug);
  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404, headers });
  }

  return NextResponse.json({ survey }, { status: 200, headers });
}

