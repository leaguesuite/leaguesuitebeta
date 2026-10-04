import { useState, useRef, useMemo, Fragment } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface ImportRow {
  rowNumber: number;
  team_name: string;
  division: string;
  captain: string;
  captain_email: string;
  coach: string;
  first_name: string;
  last_name: string;
  email: string;
  jersey_number: string;
  role: string;
  gender: string;
  phone: string;
  errors: string[];
}

export interface ImportSummary {
  teamsCreated: number;
  teamsMatched: number;
  playersAdded: number;
  rowsSkipped: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingTeams: { name: string; division: string }[];
  /** Applies valid rows; returns the summary. */
  onImport: (validRows: ImportRow[]) => Omit<ImportSummary, "rowsSkipped">;
}

const COLUMNS: { name: string; required: boolean }[] = [
  { name: "team_name", required: true },
  { name: "division", required: true },
  { name: "captain", required: false },
  { name: "captain_email", required: false },
  { name: "coach", required: false },
  { name: "first_name", required: true },
  { name: "last_name", required: true },
  { name: "email", required: true },
  { name: "jersey_number", required: false },
  { name: "role", required: false },
  { name: "gender", required: false },
  { name: "phone", required: false },
];

const SAMPLE_ROWS = [
  ["Eagles", "Division A", "John Smith", "john.smith@example.com", "N/A", "John", "Smith", "john.smith@example.com", "12", "captain", "male", "555-0101"],
  ["Eagles", "Division A", "John Smith", "john.smith@example.com", "N/A", "Mike", "Lee", "mike.lee@example.com", "7", "QB", "male", ""],
  ["Eagles", "Division A", "John Smith", "john.smith@example.com", "N/A", "Sara", "Diaz", "sara.diaz@example.com", "22", "player", "female", ""],
  ["Eagles", "Division A", "John Smith", "john.smith@example.com", "N/A", "Tom", "Ng", "tom.ng@example.com", "", "coach", "", "555-0104"],
  ["Comets", "Division B", "Ana Ruiz", "ana.ruiz@example.com", "Paul King", "Ana", "Ruiz", "ana.ruiz@example.com", "3", "captain", "female", ""],
  ["Comets", "Division B", "Ana Ruiz", "ana.ruiz@example.com", "Paul King", "Ben", "Cole", "ben.cole@example.com", "10", "RB", "male", ""],
  ["Comets", "Division B", "Ana Ruiz", "ana.ruiz@example.com", "Paul King", "Kim", "Park", "kim.park@example.com", "44", "player", "", "555-0203"],
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur.trim()); cur = ""; }
    else cur += c;
  }
  out.push(cur.trim());
  return out;
}

const normHeader = (h: string) => {
  const k = h.trim().toLowerCase().replace(/\s+/g, "_");
  return k === "position" || k === "role/position" ? "role" : k;
};

export default function TeamRosterImportDialog({ open, onOpenChange, existingTeams, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const reset = () => { setStep("upload"); setRows([]); setFileErrors([]); setFileName(""); setSummary(null); };
  const handleClose = (v: boolean) => { if (!v) reset(); onOpenChange(v); };

  const parseCsv = (text: string) => {
    const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim().length);
    if (lines.length < 2) { setFileErrors(["File must contain a header row and at least one data row."]); return; }
    const hdrs = parseLine(lines[0]).map(normHeader);
    const missing = COLUMNS.filter(c => c.required && !hdrs.includes(c.name)).map(c => c.name);
    const errs = missing.length ? [`Missing required columns: ${missing.join(", ")}`] : [];

    const parsed: ImportRow[] = lines.slice(1).map((line, idx) => {
      const cells = parseLine(line);
      const get = (k: string) => { const i = hdrs.indexOf(k); return i >= 0 ? (cells[i] ?? "") : ""; };
      const r: ImportRow = {
        rowNumber: idx + 2,
        team_name: get("team_name"), division: get("division"), captain: get("captain"),
        captain_email: get("captain_email"), coach: get("coach"), first_name: get("first_name"),
        last_name: get("last_name"), email: get("email"), jersey_number: get("jersey_number"),
        role: get("role"), gender: get("gender"), phone: get("phone"), errors: [],
      };
      COLUMNS.filter(c => c.required).forEach(c => {
        if (!(r as unknown as Record<string, string>)[c.name]) r.errors.push(`Missing ${c.name}`);
      });
      if (r.email && !EMAIL_RE.test(r.email)) r.errors.push("Invalid email");
      if (r.captain_email && !EMAIL_RE.test(r.captain_email)) r.errors.push("Invalid captain_email");
      if (r.jersey_number && !/^\d+$/.test(r.jersey_number)) r.errors.push("Jersey number must be numeric");
      return r;
    });

    // Duplicate jersey numbers within a team
    const seen = new Map<string, number>();
    parsed.forEach(r => {
      if (!r.jersey_number || !/^\d+$/.test(r.jersey_number)) return;
      const key = `${r.team_name.toLowerCase()}|${r.division.toLowerCase()}|${Number(r.jersey_number)}`;
      if (seen.has(key)) r.errors.push(`Duplicate jersey #${r.jersey_number} (row ${seen.get(key)})`);
      else seen.set(key, r.rowNumber);
    });

    setRows(parsed);
    setFileErrors(errs);
    setStep("preview");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) { setFileErrors(["Please upload a .csv file."]); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => parseCsv(ev.target?.result as string);
    reader.readAsText(file);
  };

  const groups = useMemo(() => {
    const map = new Map<string, { team: string; division: string; rows: ImportRow[] }>();
    rows.forEach(r => {
      const key = `${r.team_name.toLowerCase()}|${r.division.toLowerCase()}`;
      if (!map.has(key)) map.set(key, { team: r.team_name || "(no team)", division: r.division || "(no division)", rows: [] });
      map.get(key)!.rows.push(r);
    });
    return [...map.values()];
  }, [rows]);

  const validRows = rows.filter(r => r.errors.length === 0);
  const errorCount = rows.length - validRows.length;
  const isExisting = (team: string, div: string) =>
    existingTeams.some(t => t.name.toLowerCase() === team.toLowerCase() && t.division.toLowerCase() === div.toLowerCase());

  const handleImport = () => {
    const res = onImport(validRows);
    setSummary({ ...res, rowsSkipped: errorCount });
    setStep("done");
    toast({ title: "Import complete", description: `${res.playersAdded} players added, ${errorCount} rows skipped.` });
  };

  const downloadTemplate = () => {
    const esc = (v: string) => (/[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [COLUMNS.map(c => c.name).join(","), ...SAMPLE_ROWS.map(r => r.map(esc).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "teams-rosters-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const ErrorBox = ({ errs }: { errs: string[] }) => errs.length ? (
    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 space-y-1">
      {errs.map((e, i) => (
        <p key={i} className="text-sm text-destructive flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {e}
        </p>
      ))}
    </div>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> Import Teams & Rosters
          </DialogTitle>
          <DialogDescription>
            One row per player, with team columns repeated on each row. Teams are matched by team name + division, or created if new.
          </DialogDescription>
        </DialogHeader>

        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />

        {step === "upload" && (
          <div className="space-y-4 py-2">
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <FileText className="h-10 w-10" />
                <p className="text-sm font-medium text-foreground">Click to upload CSV file</p>
              </div>
            </div>
            <ErrorBox errs={fileErrors} />
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">Need a template?</p>
                <p className="text-xs text-muted-foreground">Example with 2 teams and their players.</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Template
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-medium">Expected columns:</p>
              <div className="flex flex-wrap gap-1">
                {COLUMNS.map(c => (
                  <Badge key={c.name} variant={c.required ? "default" : "secondary"} className="text-xs font-mono">
                    {c.name}{c.required ? " *" : ""}
                  </Badge>
                ))}
              </div>
              <p>* required. <span className="font-mono">role</span> accepts player, captain, coach or a position (QB, RB…); <span className="font-mono">position</span> is accepted as a header alias.</p>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{fileName}</span>
                <Badge variant="secondary" className="text-xs">{groups.length} teams</Badge>
                <Badge variant="secondary" className="text-xs">{rows.length} rows</Badge>
                {errorCount > 0 && <Badge variant="destructive" className="text-xs">{errorCount} with errors (will be skipped)</Badge>}
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
                      <TableHead className="table-header">Email</TableHead>
                      <TableHead className="table-header">#</TableHead>
                      <TableHead className="table-header">Role</TableHead>
                      <TableHead className="table-header">Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map(g => (
                      <Fragment key={`${g.team}|${g.division}`}>
                        <TableRow key={`h-${g.team}-${g.division}`} className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={6} className="py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{g.team}</span>
                              <span className="text-xs text-muted-foreground">{g.division}</span>
                              <Badge variant="outline" className="text-xs">
                                {isExisting(g.team, g.division) ? "Existing team" : "New team"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{g.rows.length} players</span>
                            </div>
                          </TableCell>
                        </TableRow>
                        {g.rows.map(r => {
                          const bad = r.errors.length > 0;
                          return (
                            <TableRow key={r.rowNumber} className={bad ? "bg-destructive/5 hover:bg-destructive/10" : ""}>
                              <TableCell className="text-xs text-muted-foreground font-mono">{r.rowNumber}</TableCell>
                              <TableCell className="text-sm">{`${r.first_name} ${r.last_name}`.trim() || "—"}</TableCell>
                              <TableCell className="text-sm">{r.email || "—"}</TableCell>
                              <TableCell className="text-sm font-mono">{r.jersey_number || "—"}</TableCell>
                              <TableCell className="text-sm">{r.role || "player"}</TableCell>
                              <TableCell className="text-xs">
                                {bad ? (
                                  <span className="text-destructive flex items-start gap-1">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {r.errors.join("; ")}
                                  </span>
                                ) : <span className="text-muted-foreground">OK</span>}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {step === "done" && summary && (
          <div className="py-6 space-y-4">
            <div className="text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
              <p className="text-lg font-semibold text-foreground">Import Complete</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["Teams created", summary.teamsCreated],
                ["Teams matched", summary.teamsMatched],
                ["Players added", summary.playersAdded],
                ["Rows skipped", summary.rowsSkipped],
              ].map(([label, val]) => (
                <div key={label as string} className="rounded-lg border border-border p-3 text-center bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{val}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={handleImport} disabled={fileErrors.length > 0 || validRows.length === 0}>
                Import {validRows.length} Rows
              </Button>
            </>
          )}
          {step === "done" && <Button onClick={() => handleClose(false)}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
