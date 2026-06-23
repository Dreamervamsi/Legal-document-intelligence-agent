import { embed } from 'ai';
import { cohere } from '@ai-sdk/cohere';

async function generateEmbeddings(text: string) :Promise<number[]> {
  const { embedding } = await embed({
    model: cohere.embedding('embed-english-v3.0'),
    value: text,
  });
  return embedding;
}

export default generateEmbeddings;