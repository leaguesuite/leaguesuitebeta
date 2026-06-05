import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Mail, X } from "lucide-react";

export interface BulkMessageRecipient {
  /** Stable identifier (used as React key + dedupe). */
  id: string;
  /** Display name (e.g., "John Smith — Eagles"). */
  name: string;
  /** Email address. Empty string means "no email on file". */
  email: string;
  /** Optional context tag shown alongside the chip (e.g., team or division). */
  context?: string;
}

interface BulkMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Window title, e.g., "Message Captains". */
  title?: string;
  /** Sub-description shown below the title. */
  description?: string;
  recipients: BulkMessageRecipient[];
}

export default function BulkMessageDialog({
  open,
  onOpenChange,
  title = "Message Recipients",
  description,
  recipients,
}: BulkMessageDialogProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const active = recipients.filter(r => !removed.has(r.id) && r.email);
  const missing = recipients.filter(r => !r.email);

  const reset = () => {
    setSubject("");
    setBody("");
    setRemoved(new Set());
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Subject and message required", variant: "destructive" });
      return;
    }
    if (active.length === 0) {
      toast({ title: "No recipients with an email on file", variant: "destructive" });
      return;
    }
    toast({
      title: `Message sent to ${active.length} recipient${active.length === 1 ? "" : "s"}`,
      description: subject,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Recipients ({active.length})
            </Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-muted/30 p-2 max-h-32 overflow-y-auto">
              {active.length === 0 && (
                <span className="text-xs text-muted-foreground px-1.5 py-1">
                  No recipients selected.
                </span>
              )}
              {active.map(r => (
                <Badge
                  key={r.id}
                  variant="secondary"
                  className="gap-1.5 pl-2 pr-1 py-1 font-normal"
                >
                  <span className="text-xs">
                    <span className="font-medium text-foreground">{r.name}</span>
                    <span className="text-muted-foreground"> · {r.email}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setRemoved(prev => new Set(prev).add(r.id))}
                    className="ml-0.5 rounded hover:bg-muted-foreground/20 p-0.5"
                    aria-label={`Remove ${r.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {missing.length > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                {missing.length} selected {missing.length === 1 ? "item has" : "items have"} no email on file and will be skipped.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-subject">Subject</Label>
            <Input
              id="bulk-subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Rainout — tonight's games cancelled"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-body">Message</Label>
            <Textarea
              id="bulk-body"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message…"
              rows={8}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} className="gap-2">
            <Mail className="h-4 w-4" />
            Send to {active.length} recipient{active.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
