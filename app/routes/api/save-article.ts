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
  const { data: approved } = await adminClient
    .from("issues")
    .select("issue_number")
    .eq("approved_for_display", true)
    .order("issue_number", { ascending: false })
    .limit(1);

  const lastApproved = approved && approved.length > 0 ? (approved[0].issue_number as number) : 0;
  const newNumber = lastApproved + 1;

  const { error } = await adminClient.from("issues").insert({
    issue_number: newNumber,
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
    const { password, formData, selectedImages } = await request.json();
    const correctPassword = process.env.EDITOR_PASSWORD;
    if (!correctPassword || password !== correctPassword) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!formData || !formData.title?.trim()) {
      return Response.json({ error: "חובה להזין כותרת" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const issueNumber = await getOrCreateDraftIssue(adminClient);

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
