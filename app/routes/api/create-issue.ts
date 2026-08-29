import { createAdminClient } from "~/lib/supabase";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { password } = await request.json();
    const correctPassword = process.env.EDITOR_PASSWORD;
    if (!correctPassword || password !== correctPassword) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: latestIssue, error: latestIssueError } = await admin
      .from("issues")
      .select("issue_number")
      .order("issue_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestIssueError) {
      return Response.json({ error: latestIssueError.message }, { status: 500 });
    }

    const issueNumber = (latestIssue?.issue_number ?? 0) + 1;
    const { data: issue, error: createError } = await admin
      .from("issues")
      .insert({
        issue_number: issueNumber,
        issue_date: new Date().toISOString().slice(0, 10),
        approved_for_display: false,
      })
      .select("issue_number")
      .single();

    if (createError) {
      return Response.json({ error: createError.message }, { status: 500 });
    }

    return Response.json({ success: true, issueNumber: issue.issue_number });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : "שגיאה ביצירת הגיליון" }, { status: 500 });
  }
}