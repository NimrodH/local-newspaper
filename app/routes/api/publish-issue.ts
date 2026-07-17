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

    const adminClient = createAdminClient();
    const { data: drafts, error: fetchError } = await adminClient
      .from("issues")
      .select("*")
      .eq("approved_for_display", false)
      .order("issue_number", { ascending: false })
      .limit(1);

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    if (!drafts || drafts.length === 0) {
      return Response.json({ error: "אין גיליון טיוטה לפרסום" }, { status: 400 });
    }

    const draft = drafts[0];
    const { error: updateError } = await adminClient
      .from("issues")
      .update({ approved_for_display: true })
      .eq("id", draft.id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true, issueNumber: draft.issue_number });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
