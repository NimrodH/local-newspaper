import { createAdminClient } from "~/lib/supabase";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { password, articleId } = await request.json();
    const correctPassword = process.env.EDITOR_PASSWORD;
    if (!correctPassword || password !== correctPassword) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Number.isInteger(articleId)) {
      return Response.json({ error: "כתבה לא תקינה" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: article, error: articleError } = await admin
      .from("articles")
      .select("id, issue_number")
      .eq("id", articleId)
      .maybeSingle();

    if (articleError) {
      return Response.json({ error: articleError.message }, { status: 500 });
    }
    if (!article) {
      return Response.json({ error: "הכתבה לא נמצאה" }, { status: 404 });
    }

    const { error: deleteError } = await admin.from("articles").delete().eq("id", article.id);
    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    return Response.json({ success: true, issueNumber: article.issue_number });
  } catch (error: unknown) {
    return Response.json({ error: error instanceof Error ? error.message : "שגיאה במחיקת הכתבה" }, { status: 500 });
  }
}
