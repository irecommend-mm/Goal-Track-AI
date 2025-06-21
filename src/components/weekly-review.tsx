'use client';

import { useFormStatus } from 'react';
import type { Goal } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAiSuggestions, AIActionState } from '@/app/actions';
import { BrainCircuit, Lightbulb, LoaderCircle, AlertTriangle } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';

interface WeeklyReviewProps {
  goals: Goal[];
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? (
                <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Getting Suggestions...
                </>
            ) : (
                <>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Get AI Suggestions
                </>
            )}
        </Button>
    );
}

export default function WeeklyReview({ goals }: WeeklyReviewProps) {
  const initialState: AIActionState = { message: '' };
  const [state, formAction] = useActionState(getAiSuggestions, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
      if (state.message && !state.error) {
        formRef.current?.reset();
      }
  }, [state]);

  const currentGoalsString = goals.map(g => `${g.title} (Progress: ${Math.round(g.progress)}%)`).join('\n');

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Reflective Review</CardTitle>
          <CardDescription>
            Take a moment to reflect on your past week and set your intentions for the next one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} ref={formRef} className="space-y-6">
            <div>
              <label htmlFor="weeklyReflection" className="mb-2 block text-sm font-medium">
                My reflection on last week's progress, challenges, and wins:
              </label>
              <Textarea
                id="weeklyReflection"
                name="weeklyReflection"
                placeholder="e.g., I was consistent with my workouts but struggled to find time for reading..."
                rows={6}
                required
              />
            </div>
            <input type="hidden" name="currentGoals" value={currentGoalsString} />

            <SubmitButton />

            {state.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          </form>

          {state.suggestion && (
            <Alert className="mt-6">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Your AI-Powered Suggestions</AlertTitle>
              <AlertDescription>
                <p className="whitespace-pre-wrap">{state.suggestion}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
