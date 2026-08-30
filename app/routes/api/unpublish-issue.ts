import { createAdminClient } from "~/lib/supabase";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { password, issueNumber } = await request.json();
    const correctPassword = process.env.EDITOR_PASSWORD;
    if (!correctPassword || password !== correctPassword) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Number.isInteger(issueNumber)) {
      return Response.json({ error: "גיליון לא תקין" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: issue, error: fetchError } = await admin
      .from("issues")
      .select("id, issue_number, approved_for_display")
      .eq("issue_number", issueNumber)
      .maybeSingle();

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
    }
    if (!issue) {
      return Response.json({ error: "הגיליון לא נמצא" }, { status: 404 });
    }
    if (!issue.approved_for_display) {
      return Response.json({ error: "הגיליון כבר במצב טיוטה" }, { status: 400 });
    }

    const { error: updateError } = await admin
      .from("issues")
      .update({ approved_for_display: false })
      .eq("id", issue.id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true, issueNumber: issue.issue_number });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : "שגיאה בביטול הפרסום" }, { status: 500 });
  }
}