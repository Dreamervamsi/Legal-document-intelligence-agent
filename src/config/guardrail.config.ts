export interface HallucinationThreshold {
  pass: number;
  warning: number;
  fail: number;
}

export interface ContradictionPattern {
  pattern: RegExp;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export const HALLUCINATION_THRESHOLDS: HallucinationThreshold = {
  pass: 0.2,
  warning: 0.5,
  fail: 1.0,
};

export const SEMANTIC_OVERLAP_THRESHOLD = 0.4;
export const CONTEXT_ADHERENCE_THRESHOLD = 0.5;
export const CITATION_INTEGRITY_THRESHOLD = 0.7;

export const CONTRADICTION_PATTERNS: ContradictionPattern[] = [
  {
    pattern: /(\d+)\s*days?\s*notice/gi,
    description: 'Multiple different notice periods detected',
    severity: 'high',
  },
  {
    pattern: /(\d+)\s*months?\s*(?:fee|payment)/gi,
    description: 'Multiple different fee cap periods detected',
    severity: 'high',
  },
  {
    pattern: /(\d+)%\s*(?:interest|fee|penalty)/gi,
    description: 'Multiple different percentage rates detected',
    severity: 'medium',
  },
  {
    pattern: /(immediate|instant)\s*(?:termination|cancellation)/gi,
    description: 'Immediate termination with other notice periods',
    severity: 'high',
  },
  {
    pattern: /(unlimited|unbounded|without limit)/gi,
    description: 'Unlimited terms with capped terms',
    severity: 'high',
  },
  {
    pattern: /(mutual|reciprocal)\s*(?:obligation|liability)/gi,
    description: 'Mutual obligations with unilateral terms',
    severity: 'medium',
  },
];

export const CITATION_VERIFICATION_RULES = {
  idPattern: /^[a-z]+-[a-z]+-\d+$/i,
  minSimilarityScore: 0.6,
  requireGroundingContext: true,
};

export const VALIDATION_CONFIG = {
  crossEvaluationModel: 'llama-3.1-8b-instant',
  batchSize: 5,
  maxRetries: 1,
  enableValidation: true,
  fallbackOnFailure: true,
  validationTimeout: 5000, // 5 seconds
};

export const VALIDATION_WEIGHTS = {
  semanticOverlap: 0.3,
  contextAdherence: 0.3,
  contradictionScore: 0.2,
  citationIntegrity: 0.2,
};
