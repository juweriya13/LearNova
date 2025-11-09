'use server';

/**
 * @fileOverview A quiz question generation AI agent.
 *
 * - generateQuizQuestions - A function that handles the quiz question generation process.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate quiz questions. This can be any subject imaginable, from "Quantum Physics" to "18th Century French Poetry".'),
  educationLevel: z
    .string()
    .describe(
      'The education level of the student (e.g., 1st to 10th, college, undergraduate).' /*enum: ['1st to 10th', 'college', 'undergraduate', 'other']*/
    ),
  numberOfQuestions: z
    .number()
    .min(1)
    .max(10)
    .default(5) // Setting a default number of questions.
    .describe('The number of quiz questions to generate (between 1 and 10).'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ).describe('The generated quiz questions with options and correct answers.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an expert quiz question generator for students of all levels. Your knowledge is vast and covers any conceivable topic.

You will generate a set of quiz questions based on the topic and education level provided by the user.
Each question must have multiple-choice options, with only one correct answer.

Topic: {{{topic}}}
Education Level: {{{educationLevel}}}
Number of Questions: {{{numberOfQuestions}}}

Ensure the questions are challenging but appropriate for the specified education level and accurately cover key concepts of the topic.

Output the questions in a JSON format as specified by the output schema. The "questions" array should contain objects with "question", "options", and "correctAnswer" fields.
`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    