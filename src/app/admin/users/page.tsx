import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { AddStaffDialog } from "@/components/admin/add-staff-dialog";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { RoleControl } from "@/components/admin/role-control";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { requireRole, roleOf } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Manage Users",
};

export default async function AdminUsersPage() {
  const actor = await requireRole(["admin"]);

  const people = await db.query.user.findMany({
    orderBy: desc(userTable.createdAt),
    columns: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <>
      <PageHeader
        title="Manage Users"
        description="Everyone with an account, and the role that decides what they can do."
      />

      <Container className="space-y-5 py-8 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {people.length} {people.length === 1 ? "account" : "accounts"}
          </p>
          <AddStaffDialog />
        </div>

        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas">
                <tr className="text-xs tracking-wide text-muted uppercase">
                  <th scope="col" className="px-5 py-3.5 font-medium">Name</th>
                  <th scope="col" className="px-5 py-3.5 font-medium">Email</th>
                  <th scope="col" className="px-5 py-3.5 font-medium">Joined</th>
                  <th scope="col" className="px-5 py-3.5 font-medium">Role</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {people.map((person) => {
                  const isSelf = person.id === actor.id;

                  return (
                    <tr key={person.id} className="transition-colors hover:bg-canvas">
                      <td className="px-5 py-4 font-medium text-ink">{person.name}</td>
                      <td className="px-5 py-4 break-all text-muted">{person.email}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-muted">
                        {formatDate(person.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* An admin changing their own role could lock the last
                              administrator out, and deleting it would do the same, so
                              both controls are withheld on your own row. */}
                          <RoleControl
                            userId={person.id}
                            current={roleOf(person)}
                            disabled={isSelf}
                          />
                          {isSelf ? null : (
                            <DeleteUserButton userId={person.id} name={person.name} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </Container>
    </>
  );
}
