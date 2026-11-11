import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WizardState, WizardStep, RatingRunConfig, RatingCategory } from '@/ratings-engine/types/ratings';
import { 
  defaultStatConfigs, 
  defaultDivisionMultipliers, 
  defaultEligibilityThresholds,
  defaultRatingScale,
  defaultCarryoverConfig,
  defaultVAAConfig,
  defaultVARConfig,
  mockSeasons,
} from '@/ratings-engine/data/mockData';
import { createRatingRun, updateRatingRun } from '@/ratings-engine/services/ratingsStorage';
import { WizardProgress, WizardProgressMobile } from '@/ratings-engine/components/WizardProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Save, Play } from 'lucide-react';

// Wizard step components
import { DataSourceStep } from './steps/DataSourceStep';
import { ColumnMappingStep } from './steps/ColumnMappingStep';
import { StatWeightsStep } from './steps/StatWeightsStep';
import { EligibilityStep } from './steps/EligibilityStep';
import { DivisionMultipliersStep } from './steps/DivisionMultipliersStep';
import { RatingScaleStep } from './steps/RatingScaleStep';
import { CarryoverStep } from './steps/CarryoverStep';
import { GenerateStep } from './steps/GenerateStep';

const WIZARD_STEPS: WizardStep[] = [
  { id: 'data-source', label: 'Data Source', description: 'Select where to pull player data from', completed: false },
  { id: 'column-mapping', label: 'Column Mapping', description: 'Map data columns to rating fields', completed: false },
  { id: 'stat-weights', label: 'Stat Weights', description: 'Configure stat weights per category', completed: false },
  { id: 'eligibility', label: 'Eligibility', description: 'Set minimum thresholds for ratings', completed: false },
  { id: 'division-multipliers', label: 'Division Multipliers', description: 'Adjust ratings by division level', completed: false },
  { id: 'rating-scale', label: 'Rating Scale', description: 'Define min/max ratings and caps', completed: false },
  { id: 'carryover', label: 'Carryover', description: "Blend with previous seasons' ratings", completed: false },
  { id: 'generate', label: 'Generate', description: 'Generate ratings and download them to Excel', completed: false },
];

export default function RatingWizard() {
  const navigate = useNavigate();
  const { runId } = useParams();
  
  const [state, setState] = useState<WizardState>({
    current_step: 0,
    steps: WIZARD_STEPS.map(s => ({ ...s })),
    config: {
      data_source: 'internal',
      stat_configs: [...defaultStatConfigs],
      eligibility_thresholds: [...defaultEligibilityThresholds],
      division_multipliers: [...defaultDivisionMultipliers],
      rating_scale: { ...defaultRatingScale },
      carryover: { ...defaultCarryoverConfig },
      vaa_config: { ...defaultVAAConfig },
      var_config: { ...defaultVARConfig },
    },
    is_calculating: false,
    calculation_progress: 0,
  });

  const currentStep = state.current_step;
  const config = state.config as RatingRunConfig;

  const updateConfig = useCallback(<K extends keyof RatingRunConfig>(
    key: K, 
    value: RatingRunConfig[K]
  ) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));
  }, []);

  const markStepCompleted = useCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === stepIndex ? { ...step, completed: true } : step
      ),
    }));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < WIZARD_STEPS.length) {
      markStepCompleted(currentStep);
      setState(prev => ({ ...prev, current_step: stepIndex }));
    }
  }, [currentStep, markStepCompleted]);

  // Column Mapping only applies to uploaded CSV stats.
  const visibleIdx = WIZARD_STEPS.map((_, i) => i).filter(
    i => !(WIZARD_STEPS[i].id === 'column-mapping' && config.data_source !== 'csv')
  );
  const visiblePos = Math.max(0, visibleIdx.indexOf(currentStep));
  const visibleSteps = visibleIdx.map(i => state.steps[i]);
  const goToVisible = (pos: number) => { if (pos >= 0 && pos < visibleIdx.length) goToStep(visibleIdx[pos]); };

  const nextStep = () => goToVisible(visiblePos + 1);
  const prevStep = () => goToVisible(visiblePos - 1);

  const saveDraft = useCallback(() => {
    const activeSeason = mockSeasons.find(s => s.active) || mockSeasons[0];
    createRatingRun({
      tenant_id: 'tenant-1',
      season_id: activeSeason.id,
      season_name: activeSeason.name,
      version_label: `${activeSeason.name} Draft`,
      status: 'draft',
      config: config,
      players_processed: 0,
      players_excluded: 0,
      created_by: 'admin@league.com',
    });
    toast.success('Draft saved');
    navigate('/ratings');
  }, [config, navigate]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <DataSourceStep
            dataSource={config.data_source}
            onDataSourceChange={(ds) => updateConfig('data_source', ds)}
            onCSVUpload={(data) => setState(prev => ({ ...prev, csv_data: data }))}
            csvData={state.csv_data}
          />
        );
      case 1:
        return (
          <ColumnMappingStep
            dataSource={config.data_source}
            csvData={state.csv_data}
            columnMapping={config.column_mapping || {}}
            onMappingChange={(mapping) => updateConfig('column_mapping', mapping)}
          />
        );
      case 2:
        return (
          <StatWeightsStep
            statConfigs={config.stat_configs}
            onStatConfigsChange={(configs) => updateConfig('stat_configs', configs)}
          />
        );
      case 3:
        return (
          <EligibilityStep
            thresholds={config.eligibility_thresholds}
            onThresholdsChange={(t) => updateConfig('eligibility_thresholds', t)}
          />
        );
      case 4:
        return (
          <DivisionMultipliersStep
            multipliers={config.division_multipliers}
            onMultipliersChange={(m) => updateConfig('division_multipliers', m)}
          />
        );
      case 5:
        return (
          <RatingScaleStep
            scale={config.rating_scale}
            onScaleChange={(s) => updateConfig('rating_scale', s)}
          />
        );
      case 6:
        return (
          <CarryoverStep
            carryover={config.carryover}
            onCarryoverChange={(c) => updateConfig('carryover', c)}
          />
        );
      case 7:
        return <GenerateStep config={config} onDone={() => navigate('/ratings')} />;
      default:
        return null;
    }
  };

  return (
    <div className="-m-6 min-h-full">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/ratings')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold tracking-tight">New Rating Run</h1>
                <p className="text-sm text-muted-foreground">
                  {state.steps[currentStep].label}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={saveDraft} className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Mobile Progress */}
        <div className="mb-6">
          <WizardProgressMobile steps={visibleSteps} currentStep={visiblePos} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Desktop Sidebar Progress */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <WizardProgress 
                steps={visibleSteps}
                currentStep={visiblePos}
                onStepClick={goToVisible}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0">
            <Card>
              <CardHeader>
                <CardTitle>{state.steps[currentStep].label}</CardTitle>
                <CardDescription>{state.steps[currentStep].description}</CardDescription>
              </CardHeader>
              <CardContent>
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={visiblePos === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {visiblePos < visibleIdx.length - 1 ? (
                <Button onClick={nextStep} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
