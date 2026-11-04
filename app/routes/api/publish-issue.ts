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

    const adminClient = createAdminClient();
    let draftsQuery = adminClient
      .from("issues")
      .select("*")
      .eq("approved_for_display", false);

    if (Number.isInteger(issueNumber)) {
      draftsQuery = draftsQuery.eq("issue_number", issueNumber);
    } else {
      draftsQuery = draftsQuery.order("issue_number", { ascending: false }).limit(1);
    }

    const { data: drafts, error: fetchError } = await draftsQuery;

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    if (!drafts || drafts.length === 0) {
      return Response.json({ error: "אין גיליון טיוטה לפרסום" }, { status: 400 });
    }

    const draft = drafts[0];
    // The issue's date is the day it is published, in Israel time (YYYY-MM-DD).
    const publishDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
    const { error: updateError } = await adminClient
      .from("issues")
      .update({ approved_for_display: true, issue_date: publishDate })
      .eq("id", draft.id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    // A new issue starts its statistics from zero. The issue is already
    // published at this point, so a failed reset is logged, not reported as a failed publish.
    const { error: resetError } = await adminClient
      .from("button_clicks")
      .update({ count: 0 })
      .neq("name", "");
    if (resetError) {
      console.error("Failed to reset click counters:", resetError.message);
    }

    return Response.json({ success: true, issueNumber: draft.issue_number });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
