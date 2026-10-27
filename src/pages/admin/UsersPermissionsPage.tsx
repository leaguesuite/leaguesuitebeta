import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Shield, Edit, Trash2, Smartphone, Lock, Send, X, AlertTriangle, Copy } from "lucide-react";

type Access = "full" | "view" | "none";
type PortalType = "admin" | "mobile" | "captain";

interface PermissionModule { key: string; label: string; }
interface PermissionGroup { key: string; label: string; modules: PermissionModule[]; }

const PERMISSION_GROUPS: PermissionGroup[] = [
  { key: "structure", label: "Competition Structure", modules: [
    { key: "leagues", label: "Leagues & Events" },
    { key: "phases", label: "Phases & Tags" },
    { key: "divisions", label: "Categories & Divisions" },
    { key: "locations", label: "Locations & Fields" },
  ]},
  { key: "games", label: "Games & Scoring", modules: [
    { key: "schedule", label: "Schedule" },
    { key: "scores", label: "Scores & Stats" },
    { key: "standings", label: "Standings & Overrides" },
    { key: "brackets", label: "Playoffs & Brackets" },
  ]},
  { key: "teams", label: "Teams & Members", modules: [
    { key: "rosters", label: "Teams & Rosters" },
    { key: "members", label: "Members" },
    { key: "registration", label: "Registration" },
    { key: "payments", label: "Payments" },
  ]},
  { key: "content", label: "Site & Content", modules: [
    { key: "pages", label: "Pages & Articles" },
    { key: "news", label: "News & Bulletins" },
    { key: "menus", label: "Navigation Menus" },
    { key: "documents", label: "Media & Documents" },
  ]},
  { key: "admin", label: "Administration", modules: [
    { key: "users", label: "Users & Roles" },
    { key: "settings", label: "General Settings" },
    { key: "domains", label: "Domains & Email" },
    { key: "billing", label: "Billing" },
  ]},
];

const ALL_MODULES = PERMISSION_GROUPS.flatMap(g => g.modules.map(m => m.key));
const fill = (a: Access, overrides: Record<string, Access> = {}) =>
  Object.fromEntries(ALL_MODULES.map(k => [k, overrides[k] ?? a])) as Record<string, Access>;

interface Role {
  id: string;
  name: string;
  description: string;
  portal: PortalType;
  system: boolean;
  color: string;
  permissions: Record<string, Access>;
}

const SYSTEM_ROLES: Role[] = [
  { id: "owner", name: "Owner", description: "Full access to everything, including billing and removing users.", portal: "admin", system: true, color: "bg-destructive/10 text-destructive", permissions: fill("full") },
  { id: "manager", name: "Manager", description: "Runs all league setup and operations. Cannot remove owners, change billing or delete the organization.", portal: "admin", system: true, color: "bg-primary/10 text-primary",
    permissions: fill("full", { billing: "none", domains: "view" }) },
  { id: "statistician", name: "Statistician", description: "Edits rosters, scores and player stats.", portal: "admin", system: true, color: "bg-success/10 text-success",
    permissions: fill("none", { schedule: "view", scores: "full", standings: "view", brackets: "view", rosters: "full", members: "view" }) },
  { id: "cms", name: "CMS", description: "Edits pages, articles, news, menus and documents.", portal: "admin", system: true, color: "bg-info/10 text-info",
    permissions: fill("none", { pages: "full", news: "full", menus: "full", documents: "full" }) },
  { id: "scorekeeper", name: "Scorekeeper", description: "Scorekeeper app only (iOS & Android). No access to the admin site.", portal: "mobile", system: true, color: "bg-warning/10 text-warning", permissions: fill("none") },
  { id: "captain", name: "Captain", description: "Captain's portal only. Manages their own registered team's roster.", portal: "captain", system: true, color: "bg-accent/10 text-accent", permissions: fill("none") },
];

const TEAMS = [
  { id: "t1", name: "Eagles", division: "Division A", captainEmail: "john.smith@example.com" },
  { id: "t2", name: "Tigers", division: "Division A", captainEmail: "emily.brown@example.com" },
  { id: "t3", name: "Hawks", division: "Division B", captainEmail: "jessica.thomas@example.com" },
  { id: "t4", name: "Lions", division: "Division B", captainEmail: "kevin.garcia@example.com" },
];

const FIELDS = ["All fields", "Riverside Park – Field 1", "Riverside Park – Field 2", "Central Complex – Field 3"];

interface User {
  id: number; name: string; email: string; roleId: string;
  status: "active" | "pending"; lastLogin: string; teamId?: string; fieldScope?: string;
}

const INITIAL_USERS: User[] = [
  { id: 1, name: "John Doe", email: "john@metroflag.com", roleId: "owner", status: "active", lastLogin: "2 hours ago" },
  { id: 2, name: "Sarah Chen", email: "sarah@metroflag.com", roleId: "cms", status: "active", lastLogin: "1 day ago" },
  { id: 3, name: "Mike Torres", email: "mike@metroflag.com", roleId: "scorekeeper", status: "active", lastLogin: "3 hours ago", fieldScope: "All fields" },
  { id: 4, name: "Emily Watson", email: "emily@metroflag.com", roleId: "manager", status: "active", lastLogin: "5 hours ago" },
  { id: 5, name: "David Kim", email: "david@metroflag.com", roleId: "statistician", status: "active", lastLogin: "1 day ago" },
  { id: 6, name: "Kevin Garcia", email: "kevin.garcia@example.com", roleId: "captain", status: "pending", lastLogin: "Never", teamId: "t4" },
];

const PORTAL_LABEL: Record<PortalType, string> = {
  admin: "Admin site",
  mobile: "Scorekeeper app only",
  captain: "Captain's portal only",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const initials = (n: string) => n.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
type Tab = "users" | "roles";

export default function UsersPermissionsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [roles, setRoles] = useState<Role[]>(SYSTEM_ROLES);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; role: Role | null }>({ open: false, role: null });
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const roleById = (id: string) => roles.find(r => r.id === id);
  const ownerCount = users.filter(u => u.roleId === "owner" && u.status === "active").length;

  const filteredUsers = users.filter(u =>
    (roleFilter === "all" || u.roleId === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const saveUser = (u: Omit<User, "id" | "status" | "lastLogin">, existing?: User) => {
    if (existing) {
      setUsers(prev => prev.map(x => x.id === existing.id ? { ...x, ...u } : x));
      toast({ title: "User updated", description: `${u.name} is now ${roleById(u.roleId)?.name}.` });
    } else {
      setUsers(prev => [...prev, { ...u, id: Date.now(), status: "pending", lastLogin: "Never" }]);
      toast({ title: "Invitation sent", description: `An invite was emailed to ${u.email}.` });
    }
  };

  const saveRole = (r: Role) => {
    setRoles(prev => prev.some(x => x.id === r.id) ? prev.map(x => x.id === r.id ? r : x) : [...prev, r]);
    toast({ title: "Role saved", description: r.name });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Permissions</h1>
          <p className="text-sm text-muted-foreground mt-1">Invite people and control what each role can see and do.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRoleDialog({ open: true, role: null })}><Shield className="h-4 w-4" /> New Role</Button>
          <Button onClick={() => setInviteOpen(true)}><Plus className="h-4 w-4" /> Invite User</Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["users", "roles"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "users" ? `Users (${users.length})` : `Roles (${roles.length})`}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="h-9 w-64 pl-9" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-card text-sm">
              <option value="all">All Roles</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div className="section-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="table-header text-left px-5 py-3">User</th>
                  <th className="table-header text-left px-5 py-3">Role</th>
                  <th className="table-header text-left px-5 py-3">Access</th>
                  <th className="table-header text-left px-5 py-3">Status</th>
                  <th className="table-header text-left px-5 py-3">Last Login</th>
                  <th className="table-header text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map(user => {
                  const role = roleById(user.roleId);
                  const team = TEAMS.find(t => t.id === user.teamId);
                  const isLastOwner = user.roleId === "owner" && ownerCount <= 1;
                  return (
                    <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{initials(user.name)}</div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><Badge variant="secondary" className="text-xs">{role?.name ?? "—"}</Badge></td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {role?.portal === "mobile" && <span className="inline-flex items-center gap-1"><Smartphone className="h-3 w-3" /> App · {user.fieldScope ?? "All fields"}</span>}
                        {role?.portal === "captain" && <span>Captain · {team ? `${team.name} (${team.division})` : "—"}</span>}
                        {role?.portal === "admin" && <span>Admin site</span>}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={user.status} /></td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{user.lastLogin}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {user.status === "pending" && (
                            <button title="Resend invite" onClick={() => toast({ title: "Invite resent", description: user.email })}
                              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Send className="h-3.5 w-3.5" /></button>
                          )}
                          <button title="Edit" onClick={() => setEditingUser(user)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
                          <button title={isLastOwner ? "The only owner can't be removed" : user.status === "pending" ? "Revoke invite" : "Remove user"}
                            disabled={isLastOwner} onClick={() => setDeleteUser(user)}
                            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:pointer-events-none">
                            {isLastOwner ? <Lock className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">No users match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => {
            const count = users.filter(u => u.roleId === role.id).length;
            const fullCount = Object.values(role.permissions).filter(v => v === "full").length;
            return (
              <div key={role.id} className="section-card p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${role.color}`}>{role.portal === "mobile" ? <Smartphone className="h-4 w-4" /> : <Shield className="h-4 w-4" />}</div>
                  <div className="flex gap-1">
                    <button title="Duplicate" onClick={() => setRoleDialog({ open: true, role: { ...role, id: "", name: `${role.name} copy`, system: false } })}
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><Copy className="h-3.5 w-3.5" /></button>
                    <button title="Edit" onClick={() => setRoleDialog({ open: true, role })} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><Edit className="h-3.5 w-3.5" /></button>
                    {!role.system && (
                      <button title={count ? "Reassign users first" : "Delete role"} disabled={count > 0}
                        onClick={() => setRoles(prev => prev.filter(r => r.id !== role.id))}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{role.name}</h3>
                  {role.system && <Badge variant="outline" className="text-[10px]">Built-in</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex-1">{role.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{count} user{count !== 1 ? "s" : ""}</span>
                  <Badge variant={role.portal === "admin" ? "soft" : "warning"} className="text-[11px]">
                    {role.portal === "admin" ? (fullCount === ALL_MODULES.length ? "All access" : `${fullCount} full · admin site`) : PORTAL_LABEL[role.portal]}
                  </Badge>
                </div>
              </div>
            );
          })}
          <button onClick={() => setRoleDialog({ open: true, role: null })}
            className="section-card p-5 border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-secondary/30 transition-colors min-h-[160px]">
            <Plus className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Create New Role</span>
          </button>
        </div>
      )}

      <UserDialog
        open={inviteOpen || !!editingUser}
        user={editingUser}
        roles={roles}
        users={users}
        onClose={() => { setInviteOpen(false); setEditingUser(null); }}
        onSave={(u) => { saveUser(u, editingUser ?? undefined); setInviteOpen(false); setEditingUser(null); }}
        ownerCount={ownerCount}
      />

      <RoleDialog
        open={roleDialog.open}
        role={roleDialog.role}
        existingNames={roles.filter(r => r.id !== roleDialog.role?.id).map(r => r.name.toLowerCase())}
        onClose={() => setRoleDialog({ open: false, role: null })}
        onSave={(r) => { saveRole(r); setRoleDialog({ open: false, role: null }); }}
      />

      <Dialog open={!!deleteUser} onOpenChange={o => !o && setDeleteUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{deleteUser?.status === "pending" ? "Revoke invitation?" : "Remove user?"}</DialogTitle>
            <DialogDescription>{deleteUser?.name} ({deleteUser?.email}) will lose all access.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setUsers(prev => prev.filter(u => u.id !== deleteUser!.id)); setDeleteUser(null); }}>
              {deleteUser?.status === "pending" ? "Revoke" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Invite / Edit user ---------------- */

function UserDialog({ open, user, roles, users, onClose, onSave, ownerCount }: {
  open: boolean; user: User | null; roles: Role[]; users: User[]; ownerCount: number;
  onClose: () => void; onSave: (u: Omit<User, "id" | "status" | "lastLogin">) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("manager");
  const [teamId, setTeamId] = useState("");
  const [fieldScope, setFieldScope] = useState(FIELDS[0]);
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const [lastOpen, setLastOpen] = useState(false);

  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setName(user?.name ?? ""); setEmail(user?.email ?? ""); setRoleId(user?.roleId ?? "manager");
      setTeamId(user?.teamId ?? ""); setFieldScope(user?.fieldScope ?? FIELDS[0]); setMessage(""); setTouched(false);
    }
  }

  const role = roles.find(r => r.id === roleId);
  const team = TEAMS.find(t => t.id === teamId);
  const demotingLastOwner = !!user && user.roleId === "owner" && roleId !== "owner" && ownerCount <= 1;
  const duplicate = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== user?.id);

  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "Name is required";
  if (!email.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email";
  else if (duplicate) errors.email = "This email already has access";
  if (role?.portal === "captain" && !teamId) errors.team = "Choose the captain's team";
  if (demotingLastOwner) errors.role = "There must always be at least one owner";
  const valid = Object.keys(errors).length === 0;

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSave({ name: name.trim(), email: email.trim(), roleId,
      teamId: role?.portal === "captain" ? teamId : undefined,
      fieldScope: role?.portal === "mobile" ? fieldScope : undefined });
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Invite User"}</DialogTitle>
          <DialogDescription>{user ? "Change this person's role or access." : "They'll get an email with a link to set up their account."}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
              {touched && errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" disabled={!!user} />
              {touched && errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => (
                <button key={r.id} type="button" onClick={() => setRoleId(r.id)}
                  className={`text-left rounded-lg border p-2.5 transition-colors ${roleId === r.id ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-secondary/40"}`}>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {r.portal === "mobile" && <Smartphone className="h-3.5 w-3.5 text-warning" />}
                    {r.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{r.description}</div>
                </button>
              ))}
            </div>
            {touched && errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
          </div>

          {role?.portal === "mobile" && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2">
              <p className="text-xs text-foreground flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5 text-warning" /> Scorekeeper app only (iOS & Android) — no access to the admin site.</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Games they can score</Label>
                <select value={fieldScope} onChange={e => setFieldScope(e.target.value)} className="h-9 w-full px-3 rounded-lg border border-border bg-card text-sm">
                  {FIELDS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          )}

          {role?.portal === "captain" && (
            <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
              <p className="text-xs text-muted-foreground">Captains only see the Captain's portal for their own team.</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Team</Label>
                <select value={teamId} onChange={e => {
                  setTeamId(e.target.value);
                  const t = TEAMS.find(x => x.id === e.target.value);
                  if (t && !user && !email) setEmail(t.captainEmail);
                }} className="h-9 w-full px-3 rounded-lg border border-border bg-card text-sm">
                  <option value="">Select a team…</option>
                  {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name} — {t.division}</option>)}
                </select>
                {touched && errors.team && <p className="text-xs text-destructive">{errors.team}</p>}
                {team && email && team.captainEmail.toLowerCase() !== email.trim().toLowerCase() && (
                  <p className="text-xs text-warning flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> This email doesn't match the team's registered captain ({team.captainEmail}).</p>
                )}
              </div>
            </div>
          )}

          {roleId === "owner" && !user && (
            <p className="text-xs text-warning flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Owners have full access, including billing and removing other users.</p>
          )}

          {!user && (
            <div className="space-y-1.5">
              <Label>Personal message <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder="Welcome to the league staff!" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={touched && !valid}>{user ? "Save changes" : <><Send className="h-4 w-4" /> Send Invite</>}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Create / Edit role ---------------- */

const COLORS = ["bg-primary/10 text-primary", "bg-success/10 text-success", "bg-info/10 text-info", "bg-warning/10 text-warning", "bg-accent/10 text-accent", "bg-destructive/10 text-destructive"];
const TEMPLATES = SYSTEM_ROLES.filter(r => r.portal === "admin");

function RoleDialog({ open, role, existingNames, onClose, onSave }: {
  open: boolean; role: Role | null; existingNames: string[]; onClose: () => void; onSave: (r: Role) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [portal, setPortal] = useState<PortalType>("admin");
  const [color, setColor] = useState(COLORS[0]);
  const [perms, setPerms] = useState<Record<string, Access>>(fill("none"));
  const [touched, setTouched] = useState(false);
  const [lastOpen, setLastOpen] = useState(false);

  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setName(role?.name ?? ""); setDescription(role?.description ?? ""); setPortal(role?.portal ?? "admin");
      setColor(role?.color ?? COLORS[0]); setPerms(role ? { ...role.permissions } : fill("none")); setTouched(false);
    }
  }

  const isOwner = role?.id === "owner";
  const locked = isOwner || (role?.system && role.portal !== "admin");
  const editingSystem = !!role?.system && !!role.id;

  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "Role name is required";
  else if (existingNames.includes(name.trim().toLowerCase())) errors.name = "A role with this name already exists";
  if (portal === "admin" && !Object.values(perms).some(v => v !== "none")) errors.perms = "Give this role access to at least one area";
  const valid = Object.keys(errors).length === 0;

  const warnings = useMemo(() => {
    if (portal !== "admin" || isOwner) return [];
    const w: string[] = [];
    if (perms.users === "full") w.push("This role can invite and remove users. Owners stay protected.");
    if (perms.billing === "full") w.push("This role can change billing and payment settings.");
    if (perms.domains === "full") w.push("This role can change domains and email DNS.");
    return w;
  }, [perms, portal, isOwner]);

  const setGroup = (g: PermissionGroup, a: Access) => setPerms(p => ({ ...p, ...Object.fromEntries(g.modules.map(m => [m.key, a])) }));

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSave({
      id: role?.id || `custom-${Date.now()}`,
      name: name.trim(), description: description.trim() || "Custom role",
      portal, color, system: role?.system ?? false,
      permissions: portal === "admin" ? perms : fill("none"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role?.id ? `Edit Role — ${role.name}` : "Create New Role"}</DialogTitle>
          <DialogDescription>Choose where this role signs in and what it can do.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Role name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Registrar" disabled={editingSystem} />
              {touched && errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2 h-10 items-center">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-md ${c} ${color === c ? "ring-2 ring-offset-2 ring-ring" : ""}`}><Shield className="h-3.5 w-3.5 mx-auto" /></button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this role for?" />
          </div>

          <div className="space-y-1.5">
            <Label>Where they sign in</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["admin", "mobile", "captain"] as PortalType[]).map(p => (
                <button key={p} type="button" disabled={editingSystem} onClick={() => setPortal(p)}
                  className={`rounded-lg border p-2.5 text-left text-sm transition-colors disabled:opacity-60 ${portal === p ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-secondary/40"}`}>
                  <div className="font-medium text-foreground flex items-center gap-1.5">{p === "mobile" && <Smartphone className="h-3.5 w-3.5" />}{PORTAL_LABEL[p]}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {p === "admin" ? "Pick areas below" : p === "mobile" ? "iOS & Android, no admin site" : "Own team roster only"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {portal === "admin" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Permissions</Label>
                {!locked && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Start from:</span>
                    <select onChange={e => { const t = TEMPLATES.find(x => x.id === e.target.value); if (t) setPerms({ ...t.permissions }); e.target.value = ""; }}
                      defaultValue="" className="h-8 px-2 rounded-lg border border-border bg-card text-xs">
                      <option value="" disabled>Template…</option>
                      {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {isOwner && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Lock className="h-3 w-3" /> Owner always has full access and can't be changed.</p>}

              <div className="rounded-lg border border-border divide-y divide-border">
                {PERMISSION_GROUPS.map(g => (
                  <div key={g.key}>
                    <div className="flex items-center justify-between px-3 py-2 bg-secondary/40">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</span>
                      {!locked && (
                        <div className="flex gap-1">
                          {(["full", "view", "none"] as Access[]).map(a => (
                            <button key={a} type="button" onClick={() => setGroup(g, a)} className="text-[11px] px-1.5 py-0.5 rounded text-muted-foreground hover:bg-secondary hover:text-foreground">
                              All {a === "full" ? "Full" : a === "view" ? "View" : "None"}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {g.modules.map(m => (
                      <div key={m.key} className="flex items-center justify-between px-3 py-2">
                        <span className="text-sm text-foreground">{m.label}</span>
                        <div className="inline-flex rounded-md border border-border p-0.5 bg-card">
                          {(["none", "view", "full"] as Access[]).map(a => (
                            <button key={a} type="button" disabled={locked} onClick={() => setPerms(p => ({ ...p, [m.key]: a }))}
                              className={`text-xs px-2.5 py-1 rounded transition-colors disabled:cursor-not-allowed ${perms[m.key] === a
                                ? a === "full" ? "bg-primary text-primary-foreground" : a === "view" ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
                                : "text-muted-foreground hover:text-foreground"}`}>
                              {a === "none" ? "None" : a === "view" ? "View" : "Edit"}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {touched && errors.perms && <p className="text-xs text-destructive">{errors.perms}</p>}
              {warnings.map(w => (
                <p key={w} className="text-xs text-warning flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {w}</p>
              ))}
              {!isOwner && <p className="text-[11px] text-muted-foreground">Only owners can remove other owners or delete the organization — no other role can be given that.</p>}
            </div>
          )}

          {portal === "mobile" && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-foreground">
              People with this role can only sign in to the Scorekeeper app on iOS and Android to score the games they're assigned. If they try the admin site, they'll see a "use the app" message.
            </div>
          )}
          {portal === "captain" && (
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-foreground">
              People with this role sign in to the Captain's portal and only see their own active team: add players, edit jersey numbers, and mark players inactive.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}><X className="h-4 w-4" /> Cancel</Button>
          <Button onClick={submit} disabled={isOwner || (touched && !valid)}>{role?.id ? "Save Role" : "Create Role"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
