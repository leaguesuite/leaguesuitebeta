import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { mockMembers } from "@/data/mockMembers";
import { RATING_MAX, RATING_MIN, RatingKind, RatingRecord, ratingKey, upsertRatings } from "@/data/ratingsStore";

interface Row {
  rowNumber: number; member_id: string; email: string; season: string; type: string; value: string;
  playerName?: string; resolvedId?: number; errors: string[];
}

const COLUMNS = [
  { name: "member_id", note: "or email" },
  { name: "email", note: "or member_id" },
  { name: "season", note: "required" },
  { name: "type", note: "off | def | qb" },
  { name: "value", note: `${RATING_MIN}–${RATING_MAX}` },
];

const SAMPLE = [
  ["11234", "", "Fall 2024", "off", "86.5"],
  ["11234", "", "Fall 2024", "def", "81"],
  ["", "sarah.j@email.com", "Fall 2024", "qb", "67.2"],
  ["3456", "", "Spring 2025", "off", "91"],
];

function parseLine(line: string) {
  const out: string[] = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === ",") { out.push(cur.trim()); cur = ""; } else cur += c;
  }
  out.push(cur.trim()); return out;
}

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

export default function RatingsImportDialog({ open, onOpenChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [rows, setRows] = useState<Row[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState({ imported: 0, updated: 0, skipped: 0 });

  const reset = () => { setStep("upload"); setRows([]); setFileErrors([]); setFileName(""); };
  const close = (v: boolean) => { if (!v) reset(); onOpenChange(v); };

  const parse = (text: string) => {
    const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim());
    if (lines.length < 2) { setFileErrors(["File must contain a header row and at least one data row."]); return; }
    const hdrs = parseLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, "_"));
    const errs: string[] = [];
    if (!hdrs.includes("member_id") && !hdrs.includes("email")) errs.push("Missing column: member_id or email");
    ["season", "type", "value"].forEach(c => { if (!hdrs.includes(c)) errs.push(`Missing column: ${c}`); });

    const seen = new Map<string, number>();
    const parsed: Row[] = lines.slice(1).map((line, i) => {
      const cells = parseLine(line);
      const get = (k: string) => { const ix = hdrs.indexOf(k); return ix >= 0 ? cells[ix] ?? "" : ""; };
      const r: Row = { rowNumber: i + 2, member_id: get("member_id"), email: get("email"), season: get("season"),
        type: get("type").toLowerCase(), value: get("value"), errors: [] };
      if (!r.member_id && !r.email) r.errors.push("Missing player identifier");
      else {
        const m = r.member_id
          ? mockMembers.find(x => String(x.member_id) === r.member_id)
          : mockMembers.find(x => x.email.toLowerCase() === r.email.toLowerCase());
        if (!m) r.errors.push("Unknown player");
        else { r.resolvedId = m.member_id; r.playerName = `${m.first_name} ${m.last_name}`; }
      }
      if (!r.season) r.errors.push("Missing season");
      if (!["off", "def", "qb"].includes(r.type)) r.errors.push("Bad type (use off, def or qb)");
      if (!r.value || isNaN(Number(r.value))) r.errors.push("Non-numeric value");
      else if (Number(r.value) < RATING_MIN || Number(r.value) > RATING_MAX) r.errors.push(`Out of range (${RATING_MIN}–${RATING_MAX})`);
      if (r.resolvedId != null && r.season && r.type) {
        const k = ratingKey({ member_id: r.resolvedId, season: r.season, type: r.type });
        if (seen.has(k)) r.errors.push(`Duplicate player+season+type (row ${seen.get(k)})`);
        else seen.set(k, r.rowNumber);
      }
      return r;
    });
    setRows(parsed); setFileErrors(errs); setStep("preview");
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) { setFileErrors(["Please upload a .csv file."]); return; }
    setFileName(f.name);
    const rd = new FileReader(); rd.onload = ev => parse(ev.target?.result as string); rd.readAsText(f);
  };

  const valid = rows.filter(r => r.errors.length === 0);
  const bad = rows.length - valid.length;

  const doImport = () => {
    const recs: RatingRecord[] = valid.map(r => ({ member_id: r.resolvedId!, season: r.season.trim(), type: r.type as RatingKind, value: Number(r.value) }));
    const res = upsertRatings(recs);
    setSummary({ ...res, skipped: bad }); setStep("done");
    toast({ title: "Ratings imported", description: `${res.imported} new, ${res.updated} updated, ${bad} skipped.` });
  };

  const template = () => {
    const csv = [COLUMNS.map(c => c.name).join(","), ...SAMPLE.map(r => r.join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "player-ratings-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const ErrorBox = ({ errs }: { errs: string[] }) => errs.length ? (
    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 space-y-1">
      {errs.map((e, i) => <p key={i} className="text-sm text-destructive flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {e}</p>)}
    </div>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Upload Ratings (CSV)</DialogTitle>
          <DialogDescription>One row per player, season and rating type. Existing ratings for the same player, season and type are overwritten.</DialogDescription>
        </DialogHeader>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFile} />

        {step === "upload" && (
          <div className="space-y-4 py-2">
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <FileText className="h-10 w-10" />
                <p className="text-sm font-medium text-foreground">Click to upload CSV file</p>
              </div>
            </div>
            <ErrorBox errs={fileErrors} />
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">Need a template?</p>
                <p className="text-xs text-muted-foreground">Download a CSV with example rows.</p>
              </div>
              <Button variant="outline" size="sm" onClick={template}><Download className="h-3.5 w-3.5 mr-1.5" /> Template</Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-medium">Expected columns:</p>
              <div className="flex flex-wrap gap-1">
                {COLUMNS.map(c => <Badge key={c.name} variant="secondary" className="text-xs font-mono">{c.name} <span className="ml-1 font-sans text-muted-foreground">({c.note})</span></Badge>)}
              </div>
              <p>member_id or email is required to identify the player; season, type and value are required.</p>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{fileName}</span>
                <Badge variant="secondary" className="text-xs">{rows.length} rows</Badge>
                {bad > 0 && <Badge variant="destructive" className="text-xs">{bad} with errors (will be skipped)</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={reset}><X className="h-3.5 w-3.5 mr-1" /> Change file</Button>
            </div>
            <ErrorBox errs={fileErrors} />
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="max-h-[50vh] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="table-header w-12">Row</TableHead>
                      <TableHead className="table-header">Player</TableHead>
                      <TableHead className="table-header">Season</TableHead>
                      <TableHead className="table-header">Type</TableHead>
                      <TableHead className="table-header">Value</TableHead>
                      <TableHead className="table-header">Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(r => {
                      const isBad = r.errors.length > 0;
                      return (
                        <TableRow key={r.rowNumber} className={isBad ? "bg-destructive/5 hover:bg-destructive/10" : ""}>
                          <TableCell className="text-xs text-muted-foreground font-mono">{r.rowNumber}</TableCell>
                          <TableCell className="text-sm">{r.playerName ?? (r.member_id || r.email || "—")}</TableCell>
                          <TableCell className="text-sm">{r.season || "—"}</TableCell>
                          <TableCell className="text-sm font-mono">{r.type || "—"}</TableCell>
                          <TableCell className="text-sm font-mono">{r.value || "—"}</TableCell>
                          <TableCell className="text-xs">
                            {isBad ? <span className="text-destructive flex items-start gap-1"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {r.errors.join("; ")}</span>
                              : <span className="text-muted-foreground">OK</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="py-6 space-y-4">
            <div className="text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
              <p className="text-lg font-semibold text-foreground">Import Complete</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([["Rows imported", summary.imported], ["Rows updated", summary.updated], ["Rows skipped", summary.skipped]] as const).map(([l, v]) => (
                <div key={l} className="rounded-lg border border-border p-3 text-center bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && <Button variant="outline" onClick={() => close(false)}>Cancel</Button>}
          {step === "preview" && (<>
            <Button variant="outline" onClick={reset}>Back</Button>
            <Button onClick={doImport} disabled={fileErrors.length > 0 || valid.length === 0}>Import {valid.length} Rows</Button>
          </>)}
          {step === "done" && <Button onClick={() => close(false)}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
