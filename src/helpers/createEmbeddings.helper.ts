import { embed } from 'ai';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';

async function generateEmbeddings(text: string) {
  const { embedding } = await embed({
    value: text,
    model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  });

  return embedding;
}
