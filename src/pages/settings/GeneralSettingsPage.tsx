import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings2, Clock, Trophy, Users, Eye, ShieldCheck } from "lucide-react";

interface GeneralSettings {
  supportSpecialTeams: boolean;
  showRosterVerification: boolean;
  showRegistration: boolean;
  use24HourClock: boolean;
  useFourQuarters: boolean;
}

const initialSettings: GeneralSettings = {
  supportSpecialTeams: true,
  showRosterVerification: true,
  showRegistration: true,
  use24HourClock: false,
  useFourQuarters: true,
};

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<GeneralSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("General settings saved");
    }, 600);
  };

  const items = [
    {
      key: "supportSpecialTeams" as const,
      label: "Support Special Teams",
      description: "Enable special teams tracking (kickoffs, punts, returns) in game stats.",
      icon: ShieldCheck,
    },
    {
      key: "showRosterVerification" as const,
      label: "Show Roster Verification",
      description: "Display the roster verification section on the public site and in team management.",
      icon: Users,
    },
    {
      key: "showRegistration" as const,
      label: "Show Registration",
      description: "Display the registration link and pages on the public site.",
      icon: Trophy,
    },
    {
      key: "use24HourClock" as const,
      label: "Use 24-Hour Clock",
      description: "Display all times in 24-hour format instead of 12-hour AM/PM.",
      icon: Clock,
    },
    {
      key: "useFourQuarters" as const,
      label: "Use 4 Quarters",
      description: "Structure games as 4 quarters instead of 2 halves.",
      icon: Eye,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">General Settings</h1>
        <p className="text-sm text-muted-foreground">
          Core league preferences that apply across the admin portal and public site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            League Preferences
          </CardTitle>
          <CardDescription>
            Toggle visibility and formatting options for your league.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <Label htmlFor={item.key} className="text-sm font-medium cursor-pointer">
                    {item.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch
                id={item.key}
                checked={settings[item.key]}
                onCheckedChange={(v) => update(item.key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
