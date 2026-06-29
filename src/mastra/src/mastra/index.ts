
import { Mastra } from '@mastra/core/mastra';
import { docAgent } from './agents/test-agent';
import { riskAnalysisAgent } from './agents/risk-analysis-agent';

export const mastra = new Mastra({
  agents:{docAgent, riskAnalysisAgent},
});
