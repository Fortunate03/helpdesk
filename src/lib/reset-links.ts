/**
 * Demo aid: makes the password-reset link readable in the browser instead of only in
 * the server log, so a reset can be demonstrated without terminal access.
 *
 * On everywhere, production included, because this build exists to be demonstrated and
 * has no mail provider behind it. Showing the link to whoever types an email address is
 * account takeover: anyone can request a reset for an administrator and use it straight
 * away. Before this serves anyone for real, put it back behind:
 *
 *   process.env.NODE_ENV !== "production" || process.env.DEMO_SHOW_RESET_LINK === "true"
 */
export const SHOW_RESET_LINK = true;

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
