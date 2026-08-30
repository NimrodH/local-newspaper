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
    const { data: issue, error: issueError } = await admin
      .from("issues")
      .select("id, issue_number, approved_for_display")
      .eq("issue_number", issueNumber)
      .maybeSingle();

    if (issueError) {
      return Response.json({ error: issueError.message }, { status: 500 });
    }
    if (!issue) {
      return Response.json({ error: "הגיליון לא נמצא" }, { status: 404 });
    }
    if (issue.approved_for_display) {
      return Response.json({ error: "לא ניתן למחוק גיליון שפורסם" }, { status: 400 });
    }

    const { error: articlesError } = await admin
      .from("articles")
      .delete()
      .eq("issue_number", issue.issue_number);

    if (articlesError) {
      return Response.json({ error: articlesError.message }, { status: 500 });
    }

    const { error: deleteError } = await admin.from("issues").delete().eq("id", issue.id);
    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    return Response.json({ success: true, issueNumber: issue.issue_number });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : "שגיאה במחיקת הגיליון" }, { status: 500 });
  }
}