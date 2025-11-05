'use server';

/**
 * @fileOverview Provides AI-generated assistance to students answering questions related to their studies.
 *
 * - provideAITutorAssistance - A function that handles the AI tutoring process.
 * - ProvideAITutorAssistanceInput - The input type for the provideAITutorAssistance function.
 * - ProvideAITutorAssistanceOutput - The return type for the provideAITutorAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAITutorAssistanceInputSchema = z.object({
  question: z.string().describe('The question asked by the student.'),
  context: z.string().optional().describe('Relevant context for the question, e.g., the student\'s current topic of study.'),
  educationLevel: z.string().describe('The education level of the student.'),
});
export type ProvideAITutorAssistanceInput = z.infer<typeof ProvideAITutorAssistanceInputSchema>;

const ProvideAITutorAssistanceOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
  explanation: z.string().optional().describe('An explanation of the answer, if needed.'),
});
export type ProvideAITutorAssistanceOutput = z.infer<typeof ProvideAITutorAssistanceOutputSchema>;

export async function provideAITutorAssistance(input: ProvideAITutorAssistanceInput): Promise<ProvideAITutorAssistanceOutput> {
  return provideAITutorAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorAssistancePrompt',
  input: {schema: ProvideAITutorAssistanceInputSchema},
  output: {schema: ProvideAITutorAssistanceOutputSchema},
  prompt: `You are an AI tutor designed to help students with their studies.

  A student has asked the following question:
  {{question}}

  The student's education level is: {{educationLevel}}

  {{#if context}}The student has also provided the following context:
  {{context}}{{/if}}

  Provide a clear and concise answer to the question, and provide a brief explanation if necessary.
  Remember to tailor your answer to the student's education level.
  Answer:
  `,
});

const provideAITutorAssistanceFlow = ai.defineFlow(
  {
    name: 'provideAITutorAssistanceFlow',
    inputSchema: ProvideAITutorAssistanceInputSchema,
    outputSchema: ProvideAITutorAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
