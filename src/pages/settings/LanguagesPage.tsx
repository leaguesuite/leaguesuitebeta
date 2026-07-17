import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AVAILABLE = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
] as const;

export default function LanguagesPage() {
  const [selected, setSelected] = useState<string[]>(["en"]);
  const [defaultLang, setDefaultLang] = useState<string>("en");

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      if (!next.includes(defaultLang) && next.length > 0) setDefaultLang(next[0]);
      return next.length ? next : prev;
    });
  };

  const save = () => {
    toast.success("Languages saved", {
      description: `${selected.length} language${selected.length === 1 ? "" : "s"} enabled. Default: ${
        AVAILABLE.find((a) => a.code === defaultLang)?.label
      }.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Languages</CardTitle>
          <CardDescription>
            Select which languages your league offers to members and public visitors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {AVAILABLE.map((lang) => (
            <div key={lang.code} className="flex items-center gap-3 rounded-md border p-3">
              <Checkbox
                id={`lang-${lang.code}`}
                checked={selected.includes(lang.code)}
                onCheckedChange={() => toggle(lang.code)}
              />
              <Label htmlFor={`lang-${lang.code}`} className="flex-1 cursor-pointer font-medium">
                {lang.label}
              </Label>
              <span className="text-xs text-muted-foreground uppercase">{lang.code}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Language</CardTitle>
          <CardDescription>Used when a visitor's preference is unknown.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={defaultLang} onValueChange={setDefaultLang} className="space-y-2">
            {AVAILABLE.filter((a) => selected.includes(a.code)).map((lang) => (
              <div key={lang.code} className="flex items-center gap-3">
                <RadioGroupItem id={`def-${lang.code}`} value={lang.code} />
                <Label htmlFor={`def-${lang.code}`} className="cursor-pointer">
                  {lang.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>Save Languages</Button>
      </div>
    </div>
  );
}
