import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/api-cors";
import { getApiSessionUser } from "@/lib/api-session";
import { db } from "@/lib/db";
import { getSurveyBySlug } from "@/lib/surveys";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request, "POST, OPTIONS") });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const headers = getCorsHeaders(request, "POST, OPTIONS");
  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }
  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Admins cannot submit assessments." }, { status: 403, headers });
  }

  const { slug } = await params;
  const survey = getSurveyBySlug(slug);
  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404, headers });
  }

  const body = await request.json().catch(() => null);
  const answers = body?.answers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid answers payload." }, { status: 400, headers });
  }

  await db.submission.create({
    data: {
      surveySlug: survey.slug,
      userId: user.id,
      data: answers,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201, headers });
}

