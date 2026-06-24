import 'dotenv/config';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_KEY || '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');

const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

async function generateEmbeddings(text: string): Promise<number[]> {
  if (!process.env.HF_API_KEY) {
    throw new Error(
      'HF_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embeddings for empty text');
  }

  try {
    const response = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: text.substring(0, 512),
      waitForModel: true,
    });

    const embedding = Array.isArray(response)
      ? response.map((val) => Number(val))
      : [];

    if (embedding.length === 0) {
      throw new Error('Failed to generate embeddings');
    }

    return embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error(
      `Failed to generate embeddings using Hugging Face API: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export default generateEmbeddings;
