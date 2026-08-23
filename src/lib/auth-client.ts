"use client";

import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "@/lib/permissions";

// No baseURL: in the browser Better Auth calls its own origin, which is correct on
// localhost, on preview deployments and on production without configuring anything.
export const authClient = createAuthClient({
  plugins: [adminClient({ ac, roles })],
});

export const { signIn, signUp, signOut, useSession } = authClient;
