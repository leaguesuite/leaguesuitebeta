import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockMembers } from "@/data/mockMembers";
import { useRatings } from "@/data/ratingsStore";

export default function CurrentRatingsCard() {
  const records = useRatings();
  const grouped = new Map<string, { member_id: number; season: string; off?: number; def?: number; qb?: number }>();
  records.forEach(r => {
    const k = `${r.member_id}|${r.season}`;
    const g = grouped.get(k) ?? { member_id: r.member_id, season: r.season };
    g[r.type] = r.value;
    grouped.set(k, g);
  });
  const rows = [...grouped.values()].sort((a, b) => a.member_id - b.member_id || a.season.localeCompare(b.season));
  const name = (id: number) => { const m = mockMembers.find(x => x.member_id === id); return m ? `${m.first_name} ${m.last_name}` : `#${id}`; };
  const fmt = (v?: number) => (v == null ? "—" : v.toFixed(1));

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Current Ratings</CardTitle>
        <CardDescription>Ratings by player and season (0–100 scale).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="table-header">Player</TableHead>
                <TableHead className="table-header">Season</TableHead>
                <TableHead className="table-header text-right">OFF</TableHead>
                <TableHead className="table-header text-right">DEF</TableHead>
                <TableHead className="table-header text-right">QB</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={`${r.member_id}|${r.season}`}>
                  <TableCell className="text-sm">{name(r.member_id)} <span className="text-xs text-muted-foreground font-mono">#{r.member_id}</span></TableCell>
                  <TableCell className="text-sm">{r.season}</TableCell>
                  <TableCell className="text-sm font-mono text-right">{fmt(r.off)}</TableCell>
                  <TableCell className="text-sm font-mono text-right">{fmt(r.def)}</TableCell>
                  <TableCell className="text-sm font-mono text-right">{fmt(r.qb)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
