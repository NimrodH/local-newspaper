import { createAdminClient } from "~/lib/supabase";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const password = url.searchParams.get("password") ?? "";
  const correctPassword = process.env.EDITOR_PASSWORD;
  if (!correctPassword || password !== correctPassword) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adminClient = createAdminClient();
    const { data, error: listError } = await adminClient.storage
      .from("images")
      .list("uploads", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      return Response.json({ error: listError.message }, { status: 500 });
    }

    const images = (data ?? []).map((f) => `uploads/${f.name}`);
    return Response.json({ images });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
