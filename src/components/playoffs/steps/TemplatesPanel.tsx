import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MOCK_TEMPLATES, type MockPlayoffTemplate } from "@/data/mockPlayoffs";
import type { WizardFormat } from "./FormatStep";

const KEY = "playoff_templates_v1";

interface Props {
  format: WizardFormat;
  onLoad: (f: WizardFormat) => void;
}

export const TemplatesPanel = ({ format, onLoad }: Props) => {
  const [templates, setTemplates] = useState<MockPlayoffTemplate[]>(MOCK_TEMPLATES);
  const [name, setName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setTemplates([...MOCK_TEMPLATES, ...JSON.parse(stored)]);
    } catch {/* ignore */}
  }, []);

  const persist = (custom: MockPlayoffTemplate[]) => {
    localStorage.setItem(KEY, JSON.stringify(custom));
  };

  const save = () => {
    if (!name.trim()) return;
    const t: MockPlayoffTemplate = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: `${format.teams} teams · ${format.type.replace("_", " ")}${format.bronze ? " · bronze" : ""}`,
      format: format.type,
      teams: format.teams,
      rounds: format.rounds,
      bronze: format.bronze,
    };
    const customs = templates.filter((x) => x.id.startsWith("custom-")).concat(t);
    setTemplates([...MOCK_TEMPLATES, ...customs]);
    persist(customs);
    setName("");
    toast.success(`Template "${t.name}" saved`);
  };

  const remove = (id: string) => {
    const customs = templates.filter((x) => x.id.startsWith("custom-") && x.id !== id);
    setTemplates([...MOCK_TEMPLATES, ...customs]);
    persist(customs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Template name (e.g. 'D1 Reseeded 8')" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={save} disabled={!name.trim()}><Save className="h-4 w-4" />Save current</Button>
        </div>
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-md border border-border bg-card/40 px-3 py-2">
              <Bookmark className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
              </div>
              <Badge variant="outline">{t.teams} teams</Badge>
              <Button size="sm" variant="outline" onClick={() => {
                onLoad({ teams: t.teams, type: t.format, rounds: t.rounds, bronze: t.bronze });
                toast.success(`Loaded "${t.name}"`);
              }}>Load</Button>
              {t.id.startsWith("custom-") && (
                <Button size="sm" variant="ghost" onClick={() => remove(t.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
