// src/ai/flows/suggest-goal-adjustments.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests goal adjustments based on user reflections from their weekly review.
 *
 * - suggestGoalAdjustments - A function that suggests adjustments to the user's goals or tasks based on their reflections.
 * - SuggestGoalAdjustmentsInput - The input type for the suggestGoalAdjustments function.
 * - SuggestGoalAdjustmentsOutput - The return type for the suggestGoalAdjustments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestGoalAdjustmentsInputSchema = z.object({
  weeklyReflection: z
    .string()
    .describe(
      'The user provided reflection on their progress from the weekly review.'
    ),
  currentGoals: z.string().describe('The user provided current goals.'),
});
export type SuggestGoalAdjustmentsInput = z.infer<
  typeof SuggestGoalAdjustmentsInputSchema
>;

const SuggestGoalAdjustmentsOutputSchema = z.object({
  suggestedAdjustments: z
    .string()
    .describe(
      'Suggested adjustments to the user goals or tasks for the upcoming week.'
    ),
});
export type SuggestGoalAdjustmentsOutput = z.infer<
  typeof SuggestGoalAdjustmentsOutputSchema
>;

export async function suggestGoalAdjustments(
  input: SuggestGoalAdjustmentsInput
): Promise<SuggestGoalAdjustmentsOutput> {
  return suggestGoalAdjustmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestGoalAdjustmentsPrompt',
  input: {schema: SuggestGoalAdjustmentsInputSchema},
  output: {schema: SuggestGoalAdjustmentsOutputSchema},
  prompt: `You are an AI assistant designed to help users stay on track with their goals.

  Based on the user's reflection from their weekly review and their current goals, suggest concrete adjustments to their goals or tasks for the upcoming week. The adjustments should be specific, measurable, achievable, relevant, and time-bound (SMART).

  Weekly Reflection: {{{weeklyReflection}}}
  Current Goals: {{{currentGoals}}}
  `,
});

const suggestGoalAdjustmentsFlow = ai.defineFlow(
  {
    name: 'suggestGoalAdjustmentsFlow',
    inputSchema: SuggestGoalAdjustmentsInputSchema,
    outputSchema: SuggestGoalAdjustmentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
