import { Agent } from '@mastra/core/agent';
import { z } from 'zod';

export const riskAnalysisAgent = new Agent({
  id: 'risk-analysis-agent',
  name: 'Legal Risk Analysis Agent',
  instructions: `You are a specialized legal risk analysis agent. Your expertise includes:

1. **Risk Assessment**: Analyze legal clauses for potential risks including financial, compliance, operational, and legal risks.
2. **Clause Categorization**: Identify and categorize different types of legal clauses (termination, liability, payment terms, confidentiality, etc.).
3. **Ambiguity Detection**: Identify vague, ambiguous, or unclear language that could lead to disputes.
4. **Best Practices**: Assess alignment with industry-standard legal best practices.
5. **Missing Clauses**: Identify potentially essential clauses that may be missing from the document.
6. **Severity Scoring**: Provide severity assessments for identified risks on a scale of 0-2.0.

When analyzing clauses:
- Consider both explicit risks and contextual implications
- Look for unusual or non-standard terms
- Identify potentially unenforceable provisions
- Flag clauses that may require legal review
- Provide clear, actionable recommendations

Always maintain objectivity and note when analysis requires human legal expertise.`,
  model: 'groq/llama-3.3-70b-versatile',
});

// Define schemas for structured outputs
const ClauseAnalysisSchema = z.object({
  risks: z.array(z.string()).describe('Identified risks in the clause'),
  ambiguity: z.boolean().describe('Whether the clause contains ambiguous language'),
  missingClauses: z.array(z.string()).describe('Related clauses that may be missing'),
  bestPractices: z.string().describe('Alignment with legal best practices'),
  confidence: z.number().min(0).max(1).describe('Confidence in the analysis'),
  severity: z.number().min(0).max(2).describe('Severity score for identified risks'),
});

const DocumentAnalysisSchema = z.object({
  overallAmbiguity: z.boolean().describe('Overall ambiguity in document structure'),
  missingEssentialClauses: z.array(z.string()).describe('Essential clauses that appear to be missing'),
  documentStructure: z.string().describe('Assessment of document completeness'),
  overallRisk: z.number().min(0).max(100).describe('Overall risk score for the document'),
});

export { ClauseAnalysisSchema, DocumentAnalysisSchema };
