import { createAdminClient } from "~/lib/supabase";

async function getOrCreateDraftIssue(adminClient: any): Promise<number> {
  // Find unapproved issue
  const { data: drafts } = await adminClient
    .from("issues")
    .select("*")
    .eq("approved_for_display", false)
    .order("issue_number", { ascending: false })
    .limit(1);

  if (drafts && drafts.length > 0) {
    return drafts[0].issue_number as number;
  }

  // Create new issue: issue_number = last approved + 1
  const { data: latestIssue } = await adminClient
    .from("issues")
    .select("issue_number, order_number, issue_date")
    .order("issue_date", { ascending: false })
    .order("issue_number", { ascending: false })
    .limit(1);

  const lastApproved = latestIssue && latestIssue.length > 0 ? (latestIssue[0].issue_number as number) : 0;
  const nextOrderNumber = latestIssue && latestIssue.length > 0 ? (latestIssue[0].order_number as number) + 1 : 1;
  const newNumber = lastApproved + 1;

  const { error } = await adminClient.from("issues").insert({
    issue_number: newNumber,
    order_number: nextOrderNumber,
    issue_date: new Date().toISOString().slice(0, 10),
    approved_for_display: false,
  });

  if (error) throw new Error(error.message);
  return newNumber;
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { password, articleId, issueNumber: requestedIssueNumber, formData, selectedImages } = await request.json();
    const correctPassword = process.env.EDITOR_PASSWORD;
    if (!correctPassword || password !== correctPassword) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!formData || !formData.title?.trim()) {
      return Response.json({ error: "חובה להזין כותרת" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    if (articleId) {
      const { data: article, error: articleError } = await adminClient
        .from("articles")
        .select("issue_number")
        .eq("id", articleId)
        .single();

      if (articleError || !article) {
        return Response.json({ error: articleError?.message || "הכתבה לא נמצאה" }, { status: 404 });
      }

      const { error } = await adminClient
        .from("articles")
        .update({
          title: formData.title,
          content: formData.content,
          issue_number: article.issue_number,
          order_in_issue: formData.orderInIssue || 1,
          keywords: formData.keywords || "",
          related_images: selectedImages || [],
        })
        .eq("id", articleId);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ success: true, issueNumber: article.issue_number });
    }

    let issueNumber: number | null = null;
    if (requestedIssueNumber) {
      const { data: issue } = await adminClient
        .from("issues")
        .select("issue_number")
        .eq("issue_number", requestedIssueNumber)
        .single();
      issueNumber = issue?.issue_number ?? null;
    }
    if (!issueNumber) {
      issueNumber = await getOrCreateDraftIssue(adminClient);
    }

    const { error } = await adminClient.from("articles").insert({
      title: formData.title,
      content: formData.content,
      issue_number: issueNumber,
      order_in_issue: formData.orderInIssue || 1,
      keywords: formData.keywords || "",
      related_images: selectedImages || [],
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, issueNumber });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
