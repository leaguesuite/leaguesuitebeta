import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Bird } from 'lucide-react';
import { EagleRatingsConfig, defaultEagleConfig } from '@/types/eagleRatings';
import { mockSeasons, mockDivisions } from '@/data/eagleMockData';
import { EagleSeasonTypeStep } from '@/pages/eagle-steps/EagleSeasonTypeStep';
import { EagleDivisionStrengthStep } from '@/pages/eagle-steps/EagleDivisionStrengthStep';
import { EagleRatingRangeStep } from '@/pages/eagle-steps/EagleRatingRangeStep';
import { EagleEligibilityStep } from '@/pages/eagle-steps/EagleEligibilityStep';
import { EagleSeasonWeightsStep } from '@/pages/eagle-steps/EagleSeasonWeightsStep';

const steps = [
  { id: 'season-type', label: 'Season & Type', description: 'Select season and rating category' },
  { id: 'division-strength', label: 'Division Strength', description: 'Configure division weighting' },
  { id: 'rating-range', label: 'Rating Range', description: 'Set expected rating ranges' },
  { id: 'eligibility', label: 'Eligibility', description: 'Set minimum requirements' },
  { id: 'season-weights', label: 'Season Weights', description: 'Configure past season contribution' },
];

export default function EagleRatingsWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<EagleRatingsConfig>(() => ({
    ...defaultEagleConfig,
    divisions: mockDivisions.map((d, i) => ({
      id: d.id,
      name: d.name,
      order: i,
      ratingRange: { min: 60, max: 90 },
    })),
  }));

  const updateConfig = (updates: Partial<EagleRatingsConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return config.seasonId && config.ratingTypes.length > 0;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return config.minGamesPlayed > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      console.log('Eagle Ratings Config:', config);
      navigate('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <EagleSeasonTypeStep config={config} updateConfig={updateConfig} seasons={mockSeasons} />;
      case 1:
        return <EagleDivisionStrengthStep config={config} updateConfig={updateConfig} />;
      case 2:
        return <EagleRatingRangeStep config={config} updateConfig={updateConfig} />;
      case 3:
        return <EagleEligibilityStep config={config} updateConfig={updateConfig} />;
      case 4:
        return <EagleSeasonWeightsStep config={config} updateConfig={updateConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center">
            <Bird className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Player Ratings</h1>
            <p className="text-sm text-muted-foreground">Configure player rating parameters</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl">
        <div className="relative">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`h-5 w-5 rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary border-primary'
                        : isCurrent
                        ? 'bg-background border-primary ring-4 ring-primary/20'
                        : 'bg-background border-muted-foreground/30'
                    }`}
                  >
                    {isCompleted && (
                      <svg className="h-full w-full text-primary-foreground p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          {steps.map((step, index) => {
            const isCurrent = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className={`text-xs text-center transition-colors ${
                  isCurrent
                    ? 'text-primary font-semibold'
                    : isCompleted
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
                style={{ width: `${100 / steps.length}%` }}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{steps[currentStep].label}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="max-w-3xl flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()}>
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
