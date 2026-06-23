
import { Mastra } from '@mastra/core/mastra';
import { docAgent } from './agents/test-agent';

export const mastra = new Mastra({
  agents:{docAgent},
});
