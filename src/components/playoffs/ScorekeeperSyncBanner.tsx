import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";

export const ScorekeeperSyncBanner = () => {
  const [lastSync, setLastSync] = useState("2 minutes ago");
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync("just now");
      toast.success("Scorekeeper app synced — playoff games pushed to devices");
    }, 900);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Smartphone className="h-4 w-4 text-primary" />
        <span>
          Scorekeeper app last synced <span className="font-medium text-foreground">{lastSync}</span>. Advancement changes push automatically.
        </span>
      </div>
      <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing}>
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
        Re-sync now
      </Button>
    </div>
  );
};
