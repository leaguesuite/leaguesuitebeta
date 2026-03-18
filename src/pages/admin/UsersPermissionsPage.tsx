import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Shield, Edit, Trash2, ChevronDown, ChevronRight, UserCheck, Lock, Eye } from "lucide-react";

const users = [
  { id: 1, name: "John Doe", email: "john@metroflag.com", role: "Full Admin", status: "active" as const, lastLogin: "2 hours ago", avatar: "JD" },
  { id: 2, name: "Sarah Chen", email: "sarah@metroflag.com", role: "CMS Manager", status: "active" as const, lastLogin: "1 day ago", avatar: "SC" },
  { id: 3, name: "Mike Torres", email: "mike@metroflag.com", role: "Scorekeeper", status: "active" as const, lastLogin: "3 hours ago", avatar: "MT" },
  { id: 4, name: "Emily Watson", email: "emily@metroflag.com", role: "Registrar", status: "active" as const, lastLogin: "5 hours ago", avatar: "EW" },
  { id: 5, name: "David Kim", email: "david@metroflag.com", role: "Stats Manager", status: "active" as const, lastLogin: "1 day ago", avatar: "DK" },
  { id: 6, name: "Rachel Adams", email: "rachel@metroflag.com", role: "Finance", status: "pending" as const, lastLogin: "Never", avatar: "RA" },
  { id: 7, name: "Carlos Rivera", email: "carlos@metroflag.com", role: "Scorekeeper", status: "active" as const, lastLogin: "6 hours ago", avatar: "CR" },
];

const roles = [
  { name: "Full Admin", description: "Complete access to all features", users: 1, permissions: "All", color: "bg-destructive/10 text-destructive" },
  { name: "CMS Manager", description: "Manage pages, articles, and media", users: 1, permissions: "CMS, Media", color: "bg-info/10 text-info" },
  { name: "Scorekeeper", description: "Enter and manage game scores", users: 2, permissions: "Games, Scores", color: "bg-success/10 text-success" },
  { name: "Registrar", description: "Manage members and registrations", users: 1, permissions: "Members, Forms", color: "bg-warning/10 text-warning" },
  { name: "Stats Manager", description: "Manage player and team statistics", users: 1, permissions: "Stats, Reports", color: "bg-primary/10 text-primary" },
  { name: "Finance", description: "Limited access to financial data", users: 1, permissions: "Payments, Reports", color: "bg-accent/10 text-accent" },
];

type Tab = "users" | "roles";

export default function UsersPermissionsPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Permissions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage admin users and configure granular access controls.</p>
        </div>
        <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> Invite User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["users", "roles"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "users" ? `Users (${users.length})` : `Roles (${roles.length})`}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/20">
              <option>All Roles</option>
              {roles.map(r => <option key={r.name}>{r.name}</option>)}
            </select>
          </div>

          <div className="section-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="table-header text-left px-5 py-3">User</th>
                  <th className="table-header text-left px-5 py-3">Role</th>
                  <th className="table-header text-left px-5 py-3">Status</th>
                  <th className="table-header text-left px-5 py-3">Last Login</th>
                  <th className="table-header text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{user.lastLogin}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
                        <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <div key={role.name} className="section-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${role.color}`}>
                  <Shield className="h-4 w-4" />
                </div>
                <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><Edit className="h-3.5 w-3.5" /></button>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{role.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{role.users} user{role.users !== 1 ? "s" : ""}</span>
                <Badge variant="secondary" className="text-[11px]">{role.permissions}</Badge>
              </div>
            </div>
          ))}
          <button className="section-card p-5 border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-secondary/30 transition-colors">
            <Plus className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Create New Role</span>
          </button>
        </div>
      )}
    </div>
  );
}
