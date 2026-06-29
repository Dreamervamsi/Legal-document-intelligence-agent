import type { Clause } from '../types/risk.types.js';
import { CLAUSE_PATTERNS } from '../config/risk.config.js';

interface TextSegment {
  text: string;
  page: number;
}

function categorizeClauses(textSegments: TextSegment[]): Clause[] {
  const clauses: Clause[] = [];
  let clauseCounter = 0;

  for (const segment of textSegments) {
    const sentences = splitIntoSentences(segment.text);
    
    for (const sentence of sentences) {
      const matchedPatterns = matchClausePatterns(sentence);
      
      if (matchedPatterns.length > 0) {
        // Use the highest confidence match
        const bestMatch = matchedPatterns.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );

        clauses.push({
          id: `clause-${++clauseCounter}`,
          type: bestMatch.type,
          text: sentence.trim(),
          page: segment.page,
          confidence: bestMatch.confidence,
          riskLevel: bestMatch.defaultRiskLevel as 'low' | 'medium' | 'high' | 'critical',
          category: bestMatch.category as 'financial' | 'compliance' | 'operational' | 'legal',
        });
      }
    }
  }

  return clauses;
}

function splitIntoSentences(text: string): string[] {
  // Split by common sentence delimiters while keeping the delimiter
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 20); // Filter out very short segments

  // If no sentences found, split by newlines and filter
  if (sentences.length === 0) {
    return text
      .split(/\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);
  }

  return sentences;
}

interface PatternMatch {
  type: string;
  category: string;
  defaultRiskLevel: string;
  confidence: number;
}

function matchClausePatterns(text: string): PatternMatch[] {
  const matches: PatternMatch[] = [];

  for (const pattern of CLAUSE_PATTERNS) {
    let matchCount = 0;
    
    for (const regex of pattern.patterns) {
      const matches = text.match(regex);
      if (matches) {
        matchCount += matches.length;
      }
    }

    if (matchCount > 0) {
      // Calculate confidence based on number of pattern matches
      const confidence = Math.min(matchCount * 0.3, 1.0);
      
      matches.push({
        type: pattern.type,
        category: pattern.category,
        defaultRiskLevel: pattern.defaultRiskLevel,
        confidence,
      });
    }
  }

  return matches;
}

export default categorizeClauses;
