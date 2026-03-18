import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  expectedColumns: string[];
  sampleRows: string[][];
  onImport: (rows: Record<string, string>[]) => void;
}

export default function CsvImportDialog({
  open, onOpenChange, title, description, expectedColumns, sampleRows, onImport,
}: CsvImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");

  const reset = () => {
    setStep("upload");
    setParsedRows([]);
    setHeaders([]);
    setErrors([]);
    setFileName("");
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split("\n").map(l => l.split(",").map(c => c.trim().replace(/^"|"$/g, "")));
    if (lines.length < 2) {
      setErrors(["File must contain a header row and at least one data row."]);
      return;
    }
    const hdrs = lines[0];
    const errs: string[] = [];
    const missing = expectedColumns.filter(c => !hdrs.some(h => h.toLowerCase() === c.toLowerCase()));
    if (missing.length) errs.push(`Missing columns: ${missing.join(", ")}`);

    const rows = lines.slice(1).filter(l => l.some(c => c.length > 0)).map(cells => {
      const row: Record<string, string> = {};
      hdrs.forEach((h, i) => { row[h] = cells[i] || ""; });
      return row;
    });

    setHeaders(hdrs);
    setParsedRows(rows);
    setErrors(errs);
    setStep("preview");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setErrors(["Please upload a .csv file."]);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => parseCsv(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleImport = () => {
    onImport(parsedRows);
    setStep("done");
    toast({ title: "Import successful", description: `${parsedRows.length} rows imported.` });
  };

  const downloadTemplate = () => {
    const csv = [expectedColumns.join(","), ...sampleRows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />

        {step === "upload" && (
          <div className="space-y-4 py-2">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <FileText className="h-10 w-10" />
                <div>
                  <p className="text-sm font-medium text-foreground">Click to upload CSV file</p>
                  <p className="text-xs mt-1">or drag and drop</p>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 space-y-1">
                {errors.map((e, i) => (
                  <p key={i} className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {e}
                  </p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">Need a template?</p>
                <p className="text-xs text-muted-foreground">Download a CSV with the expected column headers.</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Template
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Expected columns:</p>
              <div className="flex flex-wrap gap-1">
                {expectedColumns.map(c => (
                  <Badge key={c} variant="secondary" className="text-xs font-mono">{c}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{fileName}</span>
                <Badge variant="secondary" className="text-xs">{parsedRows.length} rows</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="h-3.5 w-3.5 mr-1" /> Change file
              </Button>
            </div>

            {errors.length > 0 && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 space-y-1">
                {errors.map((e, i) => (
                  <p key={i} className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {e}
                  </p>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="table-header w-10">#</TableHead>
                      {headers.map(h => (
                        <TableHead key={h} className="table-header">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.slice(0, 20).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                        {headers.map(h => (
                          <TableCell key={h} className="text-sm">{row[h]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsedRows.length > 20 && (
                <div className="text-center py-2 text-xs text-muted-foreground bg-muted/30 border-t border-border">
                  Showing 20 of {parsedRows.length} rows
                </div>
              )}
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
            <div>
              <p className="text-lg font-semibold text-foreground">Import Complete</p>
              <p className="text-sm text-muted-foreground">{parsedRows.length} rows were imported successfully.</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={handleImport} disabled={errors.length > 0 || parsedRows.length === 0}>
                Import {parsedRows.length} Rows
              </Button>
            </>
          )}
          {step === "done" && (
            <Button onClick={() => handleClose(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
