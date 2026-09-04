/**
 * Fire-and-forget click tracking. Reports a button click to the server,
 * which increments a counter in Supabase. Never throws — a failed tracking
 * call must not break the UI.
 */
export function trackClick(buttonName: string) {
  fetch("/api/track-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buttonName }),
  }).catch(() => {
    // Ignore tracking errors silently
  });
}
