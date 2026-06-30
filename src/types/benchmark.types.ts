export type DocumentType = 'NDA' | 'MSA' | 'SAAS';

export interface BenchmarkGap {
  type: 'missing' | 'non_standard' | 'unfavorable';
  clauseType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}
    
export interface ClauseComparison {
  clauseId: string;
  clauseType: string;
  uploadedClause: string;
  standardClause: string;
  similarityScore: number;
  classification: 'standard' | 'non_standard' | 'favorable';
  deviations: string[];
}

export interface MarketAlignmentScore {
  overallScore: number;
  categoryScores: {
    completeness: number;
    standardization: number;
    favorability: number;
  };
  explanation: string;
}

export interface BenchmarkResult {
  documentType: DocumentType;
  marketAlignmentScore: MarketAlignmentScore;
  gaps: BenchmarkGap[];
  clauseComparisons: ClauseComparison[];
  missingClauses: string[];
  summary: string;
}

export interface DocumentTypeConfig {
  documentType: DocumentType;
  mandatoryClauses: string[];
  optionalClauses: string[];
  clauseWeights: Record<string, number>;
}

export interface StandardClauseMetadata {
  id: string;
  documentType: DocumentType;
  clauseType: string;
  text: string;
  source: string;
  isGoldStandard: boolean;
}