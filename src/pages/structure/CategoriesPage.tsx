import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Settings, ChevronRight, Users, Layers, Edit, Trash2, Eye } from "lucide-react";

const categories = [
  {
    id: 1, name: "Men's", description: "Adult men's flag football leagues", divisions: 3,
    rules: { fieldLength: "80 yards", downs: 4, rushCount: 7, playersPerSide: 7 },
    divisionsList: [
      { id: 1, name: "Division 1", teamCap: 8, qbCap: 2, teams: 8, status: "active" as const },
      { id: 2, name: "Division 2", teamCap: 10, qbCap: 2, teams: 7, status: "active" as const },
      { id: 3, name: "Division 3", teamCap: 12, qbCap: 3, teams: 5, status: "active" as const },
    ],
  },
  {
    id: 2, name: "Women's", description: "Adult women's flag football leagues", divisions: 2,
    rules: { fieldLength: "70 yards", downs: 4, rushCount: 7, playersPerSide: 7 },
    divisionsList: [
      { id: 4, name: "Division 1", teamCap: 8, qbCap: 2, teams: 6, status: "active" as const },
      { id: 5, name: "Division 2", teamCap: 10, qbCap: 2, teams: 4, status: "active" as const },
    ],
  },
  {
    id: 3, name: "Co-Ed", description: "Mixed gender flag football", divisions: 1,
    rules: { fieldLength: "80 yards", downs: 4, rushCount: 7, playersPerSide: 8 },
    divisionsList: [
      { id: 6, name: "Open", teamCap: 12, qbCap: 2, teams: 7, status: "active" as const },
    ],
  },
  {
    id: 4, name: "Youth", description: "Youth flag football under 18", divisions: 2,
    rules: { fieldLength: "60 yards", downs: 4, rushCount: 5, playersPerSide: 5 },
    divisionsList: [
      { id: 7, name: "U16", teamCap: 10, qbCap: 2, teams: 0, status: "draft" as const },
      { id: 8, name: "U12", teamCap: 12, qbCap: 2, teams: 0, status: "draft" as const },
    ],
  },
];

export default function CategoriesPage() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(1);
  const [search, setSearch] = useState("");

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories & Divisions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage reusable league structure templates with rules and division configurations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Division
          </button>
          <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Category
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(cat => (
          <div key={cat.id} className="section-card overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-base font-semibold text-foreground">{cat.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{cat.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <div className="text-sm font-semibold text-foreground">{cat.divisions} Division{cat.divisions !== 1 ? "s" : ""}</div>
                  <div className="text-xs text-muted-foreground">{cat.divisionsList.reduce((s, d) => s + d.teams, 0)} teams total</div>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCategory === cat.id ? "rotate-90" : ""}`} />
              </div>
            </button>

            {expandedCategory === cat.id && (
              <div className="border-t border-border">
                {/* Rule Settings */}
                <div className="px-5 py-4 bg-secondary/30">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rule Configuration</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(cat.rules).map(([key, val]) => (
                      <div key={key} className="bg-card rounded-lg border border-border px-3 py-2.5">
                        <div className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                        <div className="text-sm font-semibold text-foreground mt-0.5">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divisions Table */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="table-header text-left px-5 py-3">Division</th>
                      <th className="table-header text-left px-5 py-3">Team Cap</th>
                      <th className="table-header text-left px-5 py-3">QB Cap</th>
                      <th className="table-header text-left px-5 py-3">Teams</th>
                      <th className="table-header text-left px-5 py-3">Status</th>
                      <th className="table-header text-right px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cat.divisionsList.map(div => (
                      <tr key={div.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium text-foreground">{cat.name} {div.name}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{div.teamCap} teams max</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{div.qbCap} per team</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{div.teams}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={div.status === "active" ? "default" : "secondary"} className={`text-xs ${div.status === "active" ? "bg-success/10 text-success border border-success/20" : ""}`}>
                            {div.status === "active" ? "Active" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
                            <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit className="h-3.5 w-3.5" /></button>
                            <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
