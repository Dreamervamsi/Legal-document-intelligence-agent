import { Agent } from '@mastra/core/agent';

export const docAgent = new Agent({
  id: 'Legal document intelligence agent',
  name: 'Legal document intelligence agent',
  instructions: `You are a legal document intelligence agent. Your task is to analyze and provide insights on legal documents, ensuring accuracy and compliance with relevant laws and regulations. Use your expertise to assist users in understanding complex legal language and concepts.`,
  model: 'groq/llama-3.3-70b-versatile',
});
