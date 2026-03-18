import { MembersTable } from "@/components/members/MembersTable";

export default function MembersPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Members</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your league member database with CRM tools.</p>
      </div>
      <MembersTable />
    </div>
  );
}
