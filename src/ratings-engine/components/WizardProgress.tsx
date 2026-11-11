import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { WizardStep } from '@/ratings-engine/types/ratings';

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function WizardProgress({ steps, currentStep, onStepClick }: WizardProgressProps) {
  return (
    <nav aria-label="Progress" className="hidden lg:block">
      <ol className="space-y-2">
        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isCurrent = index === currentStep;
          const isClickable = isCompleted || index <= currentStep;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                  isClickable && 'hover:bg-muted/50 cursor-pointer',
                  !isClickable && 'cursor-not-allowed opacity-50',
                  isCurrent && 'bg-primary/5'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && !isCompleted && 'border-primary text-primary',
                    !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary',
                      !isCurrent && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Mobile progress indicator
export function WizardProgressMobile({ steps, currentStep }: WizardProgressProps) {
  const currentStepData = steps[currentStep];
  
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-sm font-medium">{currentStepData?.label}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
