'use server';

/**
 * @fileOverview Summarizes a child's chat history for parental review.
 *
 * - summarizeChatHistory - A function that summarizes the chat history.
 * - SummarizeChatHistoryInput - The input type for the summarizeChatHistory function.
 * - SummarizeChatHistoryOutput - The return type for the summarizeChatHistory function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeChatHistoryInputSchema = z.object({
  chatHistory: z.string().describe('The complete chat history to summarize.'),
  childName: z.string().describe('The name of the child whose chat is being summarized.'),
});
export type SummarizeChatHistoryInput = z.infer<typeof SummarizeChatHistoryInputSchema>;

const SummarizeChatHistoryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the chat history, highlighting key topics and potential concerns.'),
});
export type SummarizeChatHistoryOutput = z.infer<typeof SummarizeChatHistoryOutputSchema>;

export async function summarizeChatHistory(input: SummarizeChatHistoryInput): Promise<SummarizeChatHistoryOutput> {
  return summarizeChatHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChatHistoryPrompt',
  input: {
    schema: z.object({
      chatHistory: z.string().describe('The complete chat history to summarize.'),
      childName: z.string().describe('The name of the child whose chat is being summarized.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the chat history, highlighting key topics and potential concerns.'),
    }),
  },
  prompt: `You are an AI assistant helping parents understand their child's online conversations.
  Please provide a concise summary of the following chat history for {{{childName}}}, highlighting the main topics discussed, any potential safety concerns, and educational content. 
  Ensure the summary is easy to understand and helps the parent quickly grasp the essence of the conversation.

  Chat History:
  {{chatHistory}}`,
});

const summarizeChatHistoryFlow = ai.defineFlow<
  typeof SummarizeChatHistoryInputSchema,
  typeof SummarizeChatHistoryOutputSchema
>(
  {
    name: 'summarizeChatHistoryFlow',
    inputSchema: SummarizeChatHistoryInputSchema,
    outputSchema: SummarizeChatHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
