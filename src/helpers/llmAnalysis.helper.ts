import 'dotenv/config';
import type { Clause, HeuristicResult } from '../types/risk.types.js';

interface LLMAnalysisResult {
  clauseId: string;
  contextualRisks: string[];
  ambiguityDetected: boolean;
  missingClauses: string[];
  bestPracticeAlignment: string;
  confidence: number;
}

interface GroqResponse {
  risks: string[];
  ambiguity: boolean;
  missingClauses: string[];
  bestPractices: string;
  confidence: number;
}

async function analyzeWithLLM(clauses: Clause[]): Promise<LLMAnalysisResult[]> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  const results: LLMAnalysisResult[] = [];
  
  // Process clauses in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < clauses.length; i += batchSize) {
    const batch = clauses.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(clause => analyzeClauseWithLLM(clause))
    );
    results.push(...batchResults);
  }

  return results;
}

async function analyzeClauseWithLLM(clause: Clause): Promise<LLMAnalysisResult> {
  const prompt = buildAnalysisPrompt(clause);
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a legal risk analysis expert. Analyze legal clauses for potential risks, ambiguity, and alignment with best practices. Respond in JSON format with the following structure:
{
  "risks": ["risk1", "risk2"],
  "ambiguity": true/false,
  "missingClauses": ["clause1", "clause2"],
  "bestPractices": "assessment",
  "confidence": 0.0-1.0
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content) as GroqResponse;

    return {
      clauseId: clause.id,
      contextualRisks: parsed.risks || [],
      ambiguityDetected: parsed.ambiguity || false,
      missingClauses: parsed.missingClauses || [],
      bestPracticeAlignment: parsed.bestPractices || 'Not assessed',
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error(`LLM analysis failed for clause ${clause.id}:`, error);
    // Return fallback result with low confidence
    return {
      clauseId: clause.id,
      contextualRisks: [],
      ambiguityDetected: false,
      missingClauses: [],
      bestPracticeAlignment: 'LLM analysis failed - using heuristic only',
      confidence: 0.0,
    };
  }
}

function buildAnalysisPrompt(clause: Clause): string {
  return `Analyze the following legal clause for risk assessment:

Clause Type: ${clause.type}
Category: ${clause.category}
Text: "${clause.text}"

Please identify:
1. Any contextual risks not captured by keyword matching
2. Ambiguities or vague language
3. Any potentially missing related clauses
4. Alignment with legal best practices
5. Your confidence in this assessment (0.0 to 1.0)`;
}

async function analyzeDocumentContext(clauses: Clause[]): Promise<{
  overallAmbiguity: boolean;
  missingEssentialClauses: string[];
  documentStructure: string;
}> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  const clauseSummary = clauses.map(c => 
    `- Type: ${c.type}, Category: ${c.category}, Risk Level: ${c.riskLevel}`
  ).join('\n');

  const prompt = `Analyze the overall structure of this legal document based on the following clause summary:

${clauseSummary}

Identify:
1. Overall ambiguity in the document structure
2. Any essential clauses that appear to be missing
3. General assessment of document completeness

Respond in JSON format:
{
  "overallAmbiguity": true/false,
  "missingEssentialClauses": ["clause1", "clause2"],
  "documentStructure": "assessment"
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a legal document structure expert. Analyze document completeness and structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      overallAmbiguity: parsed.overallAmbiguity || false,
      missingEssentialClauses: parsed.missingEssentialClauses || [],
      documentStructure: parsed.documentStructure || 'Not assessed',
    };
  } catch (error) {
    console.error('Document context analysis failed:', error);
    return {
      overallAmbiguity: false,
      missingEssentialClauses: [],
      documentStructure: 'LLM analysis failed',
    };
  }
}

function combineWithHeuristic(
  llmResults: LLMAnalysisResult[],
  heuristicResults: HeuristicResult[]
): HeuristicResult[] {
  const llmMap = new Map(llmResults.map(r => [r.clauseId, r]));
  const combinedResults: HeuristicResult[] = [];

  for (const heuristic of heuristicResults) {
    const llm = llmMap.get(heuristic.clauseId);
    
    if (llm && llm.confidence > 0.5) {
      // Combine heuristic and LLM results
      combinedResults.push({
        clauseId: heuristic.clauseId,
        risks: [...heuristic.risks, ...llm.contextualRisks],
        severity: heuristic.severity + (llm.ambiguityDetected ? 0.3 : 0),
        factors: [
          ...heuristic.factors,
          llm.ambiguityDetected ? 'Ambiguity detected by LLM' : '',
          llm.bestPracticeAlignment !== 'Not assessed' 
            ? `Best practice: ${llm.bestPracticeAlignment}` 
            : '',
        ].filter(Boolean),
      });
    } else {
      // Use heuristic only if LLM failed or has low confidence
      combinedResults.push(heuristic);
    }
  }

  return combinedResults;
}

export default analyzeWithLLM;
export { analyzeDocumentContext, combineWithHeuristic };
