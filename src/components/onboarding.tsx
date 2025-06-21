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

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Target,
    title: 'Welcome to Goal Track AI!',
    description: "Let's get you set up to achieve your goals. This app helps you break down your ambitions into manageable tasks.",
  },
  {
    icon: CheckCircle,
    title: 'Track Your Progress',
    description: 'Use the dashboard to see your daily tasks, monitor your weekly and monthly goals, and build your momentum.',
  },
  {
    icon: BrainCircuit,
    title: 'Reflect and Adjust with AI',
    description: 'Each week, reflect on your progress. Our AI will provide personalized suggestions to keep you on track.',
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
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
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
