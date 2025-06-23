// src/ai/flows/generate-goal-image.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that generates an image for a user's goal.
 *
 * - generateGoalImage - A function that creates an image based on a goal's title.
 * - GenerateGoalImageInput - The input type for the generateGoalImage function.
 * - GenerateGoalImageOutput - The return type for the generateGoalImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGoalImageInputSchema = z.object({
  goalTitle: z.string().describe("The user's goal title."),
});
export type GenerateGoalImageInput = z.infer<
  typeof GenerateGoalImageInputSchema
>;

const GenerateGoalImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "A data URI for the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateGoalImageOutput = z.infer<
  typeof GenerateGoalImageOutputSchema
>;

export async function generateGoalImage(
  input: GenerateGoalImageInput
): Promise<GenerateGoalImageOutput> {
  const {media} = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: `Generate an inspiring, minimalist, abstract image representing the goal: "${input.goalTitle}"`,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  return {imageUrl: media.url};
}
