import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Bird } from 'lucide-react';
import { EagleRatingsConfig, defaultEagleConfig } from '@/ratings-engine/types/eagleRatings';
import { mockSeasons, mockDivisions } from '@/ratings-engine/data/mockData';
import { EagleSeasonTypeStep } from '@/ratings-engine/pages/eagle-steps/EagleSeasonTypeStep';
import { EagleDivisionStrengthStep } from '@/ratings-engine/pages/eagle-steps/EagleDivisionStrengthStep';
import { EagleRatingRangeStep } from '@/ratings-engine/pages/eagle-steps/EagleRatingRangeStep';
import { EagleEligibilityStep } from '@/ratings-engine/pages/eagle-steps/EagleEligibilityStep';
import { EagleSeasonWeightsStep } from '@/ratings-engine/pages/eagle-steps/EagleSeasonWeightsStep';
import { EagleCarryoverUploadStep } from '@/ratings-engine/pages/eagle-steps/EagleCarryoverUploadStep';
import { EagleStatsUploadStep } from '@/ratings-engine/pages/eagle-steps/EagleStatsUploadStep';
import { EagleResultsStep } from '@/ratings-engine/pages/eagle-steps/EagleResultsStep';

const steps = [
  { id: 'season-type', label: 'Season & Type', description: 'Select season and rating category' },
  { id: 'division-strength', label: 'Division Strength', description: 'Configure division weighting' },
  { id: 'rating-range', label: 'Rating Range', description: 'Set expected rating ranges' },
  { id: 'eligibility', label: 'Eligibility', description: 'Set minimum requirements' },
  { id: 'season-weights', label: 'Season Weights', description: 'Configure past season contribution' },
  { id: 'carryover-upload', label: 'Carryover Ratings', description: 'Upload previous season ratings' },
  { id: 'stats-upload', label: 'Season Stats', description: 'Upload current season statistics' },
  { id: 'results', label: 'Results', description: 'Review calculated ratings' },
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
        return config.seasonId && config.ratingType;
      case 1:
        return true; // Always can proceed from division strength
      case 2:
        return true; // Always can proceed from rating range
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
      // Final step - complete wizard
      console.log('Eagle Ratings Config:', config);
      navigate('/ratings');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/ratings');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <EagleSeasonTypeStep
            config={config}
            updateConfig={updateConfig}
            seasons={mockSeasons}
          />
        );
      case 1:
        return (
          <EagleDivisionStrengthStep
            config={config}
            updateConfig={updateConfig}
          />
        );
      case 2:
        return (
          <EagleRatingRangeStep
            config={config}
            updateConfig={updateConfig}
          />
        );
      case 3:
        return (
          <EagleEligibilityStep
            config={config}
            updateConfig={updateConfig}
          />
        );
      case 4:
        return (
          <EagleSeasonWeightsStep
            config={config}
            updateConfig={updateConfig}
          />
        );
      case 5:
        return (
          <EagleCarryoverUploadStep
            config={config}
            updateConfig={updateConfig}
          />
        );
      case 6:
        return (
          <EagleStatsUploadStep
            config={config}
            updateConfig={updateConfig}
          />
        );
      case 7:
        return (
          <EagleResultsStep
            config={config}
            updateConfig={updateConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="-m-6 min-h-full">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/ratings')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Bird className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Eagle Ratings</h1>
                <p className="text-sm text-muted-foreground">Configure player rating parameters</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 pb-24">
        {/* Progress Bar with Milestones */}
        <div className="mb-8 max-w-3xl mx-auto">
          {/* Progress bar background */}
          <div className="relative">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {/* Milestone markers */}
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
          
          {/* Step labels */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
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
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>{steps[currentStep].label}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </main>

      {/* Fixed Navigation */}
      <div className="sticky bottom-0 -mx-0 mt-8 border-t bg-background/95 backdrop-blur-sm z-10">
        <div className="container py-4">
          <div className="max-w-3xl mx-auto flex justify-between">
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
      </div>
    </div>
  );
}
