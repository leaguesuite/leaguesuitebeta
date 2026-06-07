import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { FormatStep, type WizardFormat } from "./steps/FormatStep";
import { SeedSourceStep, type SeedSourceConfig } from "./steps/SeedSourceStep";
import { PreviewStep, type RoundVisibility } from "./steps/PreviewStep";
import { ConflictsStep } from "./steps/ConflictsStep";
import { TemplatesPanel } from "./steps/TemplatesPanel";

const STEPS = ["Format", "Seed Source", "Preview", "Conflicts", "Templates"] as const;

interface Props {
  onPublish: () => void;
}

export const PlayoffWizard = ({ onPublish }: Props) => {
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState<WizardFormat>({
    teams: 8,
    type: "fixed",
    rounds: ["Quarterfinal", "Semifinal", "Final"],
    bronze: false,
  });
  const [seedSource, setSeedSource] = useState<SeedSourceConfig>({});
  const [visibility, setVisibility] = useState<RoundVisibility>({});

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-muted text-foreground"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {step === 0 && <FormatStep value={format} onChange={setFormat} />}
      {step === 1 && <SeedSourceStep value={seedSource} onChange={setSeedSource} />}
      {step === 2 && <PreviewStep format={format} visibility={visibility} onVisibilityChange={setVisibility} />}
      {step === 3 && <ConflictsStep />}
      {step === 4 && <TemplatesPanel format={format} onLoad={setFormat} />}

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft className="h-4 w-4" />Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>
        ) : (
          <Button onClick={() => { toast.success("Playoff bracket published"); onPublish(); }}>
            <Check className="h-4 w-4" />Publish bracket
          </Button>
        )}
      </div>
    </div>
  );
};
