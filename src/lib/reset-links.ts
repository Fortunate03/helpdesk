/**
 * Demo aid: makes the password-reset link readable in the browser instead of only in
 * the server log, so a reset can be demonstrated without terminal access.
 *
 * This is deliberately hard to switch on in production. Showing the link to whoever
 * types an email address is account takeover: anyone could request a reset for an
 * administrator and use the link immediately. It is on by default only in development.
 */
export const SHOW_RESET_LINK =
  process.env.NODE_ENV !== "production" || process.env.DEMO_SHOW_RESET_LINK === "true";

const TTL_MS = 60_000;

// Populated by sendResetPassword and read back by the server action in the same
// request, so this never needs to survive a restart or reach another instance.
const links = new Map<string, { url: string; expires: number }>();

function prune() {
  const now = Date.now();
  for (const [email, entry] of links) {
    if (entry.expires <= now) links.delete(email);
  }
}

export function rememberResetLink(email: string, url: string) {
  if (!SHOW_RESET_LINK) return;
  prune();
  links.set(email.toLowerCase(), { url, expires: Date.now() + TTL_MS });
}

export function takeResetLink(email: string) {
  if (!SHOW_RESET_LINK) return undefined;
  prune();
  const key = email.toLowerCase();
  const entry = links.get(key);
  links.delete(key);
  return entry?.url;
}
