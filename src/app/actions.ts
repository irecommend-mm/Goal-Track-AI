'use server';

import { suggestGoalAdjustments } from '@/ai/flows/suggest-goal-adjustments';
import { z } from 'zod';

const formSchema = z.object({
  weeklyReflection: z.string().min(10, "Please provide a more detailed reflection."),
  currentGoals: z.string(),
});

export interface AIActionState {
  message: string;
  suggestion?: string;
  error?: boolean;
}

export async function getAiSuggestions(
  prevState: AIActionState,
  formData: FormData,
): Promise<AIActionState> {
  const validatedFields = formSchema.safeParse({
    weeklyReflection: formData.get('weeklyReflection'),
    currentGoals: formData.get('currentGoals'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors.map(e => e.message).join(', '),
      error: true,
    };
  }

  try {
    const { suggestedAdjustments } = await suggestGoalAdjustments(validatedFields.data);
    return {
      message: 'Here are your AI-powered suggestions!',
      suggestion: suggestedAdjustments,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'There was an error getting suggestions from the AI. Please try again later.',
      error: true,
    };
  }
}
