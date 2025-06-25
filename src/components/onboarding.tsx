'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle, BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Target,
      title: t('onboarding.step1_title'),
      description: t('onboarding.step1_desc'),
    },
    {
      icon: CheckCircle,
      title: t('onboarding.step2_title'),
      description: t('onboarding.step2_desc'),
    },
    {
      icon: BrainCircuit,
      title: t('onboarding.step3_title'),
      description: t('onboarding.step3_desc'),
    },
  ];
  
  const [step, setStep] = useState(0);
  const isLastStep = step === steps.length - 1;
  
  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const currentStep = steps[step];
  const progressValue = ((step + 1) / steps.length) * 100;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <currentStep.icon className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Progress value={progressValue} className="w-full" />
        </div>
        <DialogFooter>
          <Button onClick={handleNext} className="w-full">
            {isLastStep ? t('onboarding.getStarted') : t('onboarding.next')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
