import { createAdminClient } from "~/lib/supabase";

/**
 * Public endpoint that increments a button-click counter in Supabase.
 * Uses the admin (service-role) client, so no RLS policy changes are needed.
 * No authentication — this tracks anonymous end-user clicks.
 */
export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { buttonName } = await request.json();

    if (!buttonName || typeof buttonName !== "string") {
      return Response.json({ error: "Missing button name" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.rpc("increment_button_click", {
      p_name: buttonName,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
