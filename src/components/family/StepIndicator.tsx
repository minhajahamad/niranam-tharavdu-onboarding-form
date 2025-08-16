import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  isAlive: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  isAlive
}) => {
  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'inactive';
  };

  const filteredSteps = isAlive ? steps : steps.filter(step => step.id === 1 || step.id === 4);

  return (
    <div className="flex items-center justify-between">
      {filteredSteps.map((step, index) => {
        const status = getStepStatus(step.id);
        const isClickable = step.id <= currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  {
                    "bg-step-completed text-white": status === 'completed',
                    "bg-step-active text-white": status === 'active',
                    "bg-step-inactive text-white": status === 'inactive',
                    "cursor-pointer hover:scale-105": isClickable,
                    "cursor-not-allowed opacity-50": !isClickable
                  }
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </button>
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-sm font-medium",
                  status === 'active' ? "text-step-active" : "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < filteredSteps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 transition-colors duration-200",
                step.id < currentStep ? "bg-step-completed" : "bg-step-inactive"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};