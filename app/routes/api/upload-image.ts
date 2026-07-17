import { createAdminClient } from "~/lib/supabase";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const password = request.headers.get("x-editor-password") ?? "";
  const correctPassword = process.env.EDITOR_PASSWORD;
  if (!correctPassword || password !== correctPassword) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `uploads/${Date.now()}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await adminClient.storage
      .from("images")
      .upload(path, Buffer.from(buffer), {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return Response.json({ error: uploadError.message }, { status: 500 });
    }

    return Response.json({ path });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
