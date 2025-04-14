// Use server directive to ensure this file is only run on the server.
'use server';

/**
 * @fileOverview This file defines a Genkit flow that generates age-appropriate responses for children.
 *
 * It includes the `generateAgeAppropriateResponse` function, which is the main entry point for the flow.
 * The flow takes an input message and generates a response that is tailored to be easily understood by children.
 *
 * @exports generateAgeAppropriateResponse - The main function to generate age-appropriate responses.
 * @exports GenerateAgeAppropriateResponseInput - The input type for the generateAgeAppropriateResponse function.
 * @exports GenerateAgeAppropriateResponseOutput - The output type for the generateAgeAppropriateResponse function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateAgeAppropriateResponseInputSchema = z.object({
  message: z.string().describe('The message to generate an age-appropriate response for.'),
  childAge: z.number().describe('The age of the child.').optional(),
});

export type GenerateAgeAppropriateResponseInput = z.infer<
  typeof GenerateAgeAppropriateResponseInputSchema
>;

const GenerateAgeAppropriateResponseOutputSchema = z.object({
  response: z.string().describe('The age-appropriate response.'),
});

export type GenerateAgeAppropriateResponseOutput = z.infer<
  typeof GenerateAgeAppropriateResponseOutputSchema
>;

export async function generateAgeAppropriateResponse(
  input: GenerateAgeAppropriateResponseInput
): Promise<GenerateAgeAppropriateResponseOutput> {
  return generateAgeAppropriateResponseFlow(input);
}

const generateAgeAppropriateResponsePrompt = ai.definePrompt({
  name: 'generateAgeAppropriateResponsePrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The message to generate an age-appropriate response for.'),
      childAge: z.number().describe('The age of the child.').optional(),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The age-appropriate response.'),
    }),
  },
  prompt: `You are an AI assistant designed to respond to children in an age-appropriate manner.\

  Please rephrase the following message so that a child of age {{{childAge}}} can easily understand it. If no age is given, respond in a way that is simple to understand for any child. 

Message: {{{message}}}`,
});

const generateAgeAppropriateResponseFlow = ai.defineFlow<
  typeof GenerateAgeAppropriateResponseInputSchema,
  typeof GenerateAgeAppropriateResponseOutputSchema
>(
  {
    name: 'generateAgeAppropriateResponseFlow',
    inputSchema: GenerateAgeAppropriateResponseInputSchema,
    outputSchema: GenerateAgeAppropriateResponseOutputSchema,
  },
  async input => {
    const {output} = await generateAgeAppropriateResponsePrompt(input);
    return output!;
  }
);
