'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending the next topics or levels to study based on a student's quiz performance and selected education level.
 *
 * - recommendNextTopics - A function that takes quiz performance data and education level as input and returns a recommendation for the next topics to study.
 * - RecommendNextTopicsInput - The input type for the recommendNextTopics function.
 * - RecommendNextTopicsOutput - The return type for the recommendNextTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendNextTopicsInputSchema = z.object({
  quizPerformance: z
    .string()
    .describe(
      'A string containing data about the student\u2019s quiz performance, including topics attempted, scores, and areas of weakness.'
    ),
  educationLevel: z
    .string()
    .describe(
      'The student\u2019s current education level, e.g., 1st grade, 10th grade, college, undergraduate.'
    ),
});
export type RecommendNextTopicsInput = z.infer<typeof RecommendNextTopicsInputSchema>;

const RecommendNextTopicsOutputSchema = z.object({
  recommendedTopics: z
    .string()
    .describe(
      'A string containing a comma separated list of recommended next topics or levels to study, based on the quiz performance and education level provided.'
    ),
  reasoning: z
    .string()
    .describe(
      'A string describing the AI\u2019s reasoning for recommending the next topics.'
    ),
});
export type RecommendNextTopicsOutput = z.infer<typeof RecommendNextTopicsOutputSchema>;

export async function recommendNextTopics(
  input: RecommendNextTopicsInput
): Promise<RecommendNextTopicsOutput> {
  return recommendNextTopicsFlow(input);
}

const recommendNextTopicsPrompt = ai.definePrompt({
  name: 'recommendNextTopicsPrompt',
  input: {schema: RecommendNextTopicsInputSchema},
  output: {schema: RecommendNextTopicsOutputSchema},
  prompt: `Based on the student's quiz performance and education level, recommend the next topics or levels to study.

Quiz Performance: {{{quizPerformance}}}
Education Level: {{{educationLevel}}}

Consider the student's weaknesses and areas for improvement when making your recommendations. Explain your reasoning for suggesting the recommended topics. Return the recommendation as a comma separated list.
`,
});

const recommendNextTopicsFlow = ai.defineFlow(
  {
    name: 'recommendNextTopicsFlow',
    inputSchema: RecommendNextTopicsInputSchema,
    outputSchema: RecommendNextTopicsOutputSchema,
  },
  async input => {
    const {output} = await recommendNextTopicsPrompt(input);
    return output!;
  }
);
