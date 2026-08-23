/**
 * The origin this app is served from.
 *
 * On a first deploy the URL is not known until after the deploy, so requiring it as
 * an environment variable is a chicken-and-egg problem. Vercel sets
 * VERCEL_PROJECT_PRODUCTION_URL itself (host only, no scheme), which covers the
 * default *.vercel.app domain and any custom domain added later.
 *
 * BETTER_AUTH_URL still wins when set, for the cases Vercel cannot infer.
 */
function withProtocol(host: string | undefined) {
  if (!host) return undefined;
  return host.startsWith("http://") || host.startsWith("https://") ? host : `https://${host}`;
}

export const APP_URL =
  withProtocol(process.env.BETTER_AUTH_URL) ??
  withProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  "http://localhost:3000";
