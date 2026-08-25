import type { Metadata } from "next";
import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROLE_LABELS } from "@/lib/permissions";
import { requireUser, roleOf } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Update the name on your account and change your password.",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your account details and password. Changes apply the next time a page loads."
        action={<Badge tone="brand">{ROLE_LABELS[roleOf(user)]}</Badge>}
      />

      <Container className="max-w-2xl space-y-6 py-8 lg:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Your details</CardTitle>
            <CardDescription>
              This is the name help desk staff see against the requests you submit.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ProfileForm name={user.name} email={user.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Changing your password signs you out everywhere else. You stay signed in here.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <PasswordForm />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
