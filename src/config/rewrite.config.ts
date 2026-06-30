import type { RiskCategory } from '../types/risk.types.js';

export interface MitigationStrategy {
  pattern: string;
  replacement: string;
  riskReductionFactor: number;
  category: RiskCategory;
  description: string;
}

export interface ClauseRewriteStrategy {
  clauseType: string;
  strategies: MitigationStrategy[];
  defaultMitigations: string[];
}

export const CLAUSE_REWRITE_STRATEGIES: Record<string, ClauseRewriteStrategy> = {
  liability: {
    clauseType: 'liability',
    strategies: [
      {
        pattern: 'unlimited liability',
        replacement: 'liability capped at 12 months of fees',
        riskReductionFactor: 0.4,
        category: 'financial',
        description: 'Added liability cap to limit financial exposure',
      },
      {
        pattern: 'no liability',
        replacement: 'limited liability for willful misconduct and gross negligence',
        riskReductionFactor: 0.3,
        category: 'financial',
        description: 'Added liability for intentional misconduct',
      },
      {
        pattern: 'without limitation',
        replacement: 'subject to reasonable limitations',
        riskReductionFactor: 0.2,
        category: 'financial',
        description: 'Added reasonable limitations to liability scope',
      },
      {
        pattern: 'sole discretion',
        replacement: 'reasonable discretion',
        riskReductionFactor: 0.15,
        category: 'operational',
        description: 'Changed sole discretion to reasonable discretion',
      },
    ],
    defaultMitigations: [
      'Introduce liability cap based on contract value',
      'Exclude consequential damages except for willful misconduct',
      'Add mutual indemnification obligations',
    ],
  },
  termination: {
    clauseType: 'termination',
    strategies: [
      {
        pattern: 'immediate termination',
        replacement: 'termination upon 30 days written notice',
        riskReductionFactor: 0.25,
        category: 'operational',
        description: 'Added reasonable notice period for termination',
      },
      {
        pattern: 'termination for convenience',
        replacement: 'termination for convenience with 30 days notice and fee payment',
        riskReductionFactor: 0.2,
        category: 'operational',
        description: 'Added fee payment requirement for convenience termination',
      },
      {
        pattern: 'without notice',
        replacement: 'with reasonable prior written notice',
        riskReductionFactor: 0.3,
        category: 'operational',
        description: 'Added notice requirement for termination',
      },
    ],
    defaultMitigations: [
      'Establish reasonable notice periods (30-60 days)',
      'Define material breach conditions clearly',
      'Add cure period for breaches before termination',
    ],
  },
  payment_terms: {
    clauseType: 'payment_terms',
    strategies: [
      {
        pattern: 'immediate payment',
        replacement: 'payment within 30 days of invoice',
        riskReductionFactor: 0.15,
        category: 'financial',
        description: 'Added standard 30-day payment term',
      },
      {
        pattern: 'penalty',
        replacement: 'late fee not exceeding 1.5% per month',
        riskReductionFactor: 0.2,
        category: 'financial',
        description: 'Capped late fee percentage to industry standard',
      },
      {
        pattern: 'unlimited interest',
        replacement: 'interest rate not exceeding applicable legal maximum',
        riskReductionFactor: 0.25,
        category: 'financial',
        description: 'Capped interest rate to legal maximum',
      },
    ],
    defaultMitigations: [
      'Establish standard payment terms (net 30/60)',
      'Cap late fees and interest rates',
      'Define invoice submission and dispute processes',
    ],
  },
  confidentiality: {
    clauseType: 'confidentiality',
    strategies: [
      {
        pattern: 'perpetual confidentiality',
        replacement: 'confidentiality for 5 years after termination',
        riskReductionFactor: 0.2,
        category: 'compliance',
        description: 'Added time limit to confidentiality obligation',
      },
      {
        pattern: 'unlimited disclosure',
        replacement: 'disclosure only on need-to-know basis',
        riskReductionFactor: 0.15,
        category: 'compliance',
        description: 'Restricted disclosure to need-to-know basis',
      },
    ],
    defaultMitigations: [
      'Define reasonable confidentiality duration',
      'Exclude publicly available information',
      'Allow disclosure with prior written consent',
    ],
  },
  non_compete: {
    clauseType: 'non_compete',
    strategies: [
      {
        pattern: 'perpetual non-compete',
        replacement: 'non-compete for 12 months post-termination',
        riskReductionFactor: 0.35,
        category: 'compliance',
        description: 'Limited non-compete duration to 12 months',
      },
      {
        pattern: 'worldwide non-compete',
        replacement: 'non-compete limited to geographic area of business operations',
        riskReductionFactor: 0.3,
        category: 'compliance',
        description: 'Limited geographic scope to business operations',
      },
    ],
    defaultMitigations: [
      'Limit duration to reasonable period (6-12 months)',
      'Restrict geographic scope to relevant markets',
      'Define specific competitive activities',
    ],
  },
  indemnification: {
    clauseType: 'indemnification',
    strategies: [
      {
        pattern: 'unlimited indemnification',
        replacement: 'indemnification capped at contract value',
        riskReductionFactor: 0.35,
        category: 'financial',
        description: 'Capped indemnification to contract value',
      },
      {
        pattern: 'one-way indemnification',
        replacement: 'mutual indemnification obligations',
        riskReductionFactor: 0.25,
        category: 'financial',
        description: 'Changed to mutual indemnification',
      },
    ],
    defaultMitigations: [
      'Make indemnification mutual',
      'Cap indemnification amounts',
      'Define trigger conditions clearly',
    ],
  },
  force_majeure: {
    clauseType: 'force_majeure',
    strategies: [
      {
        pattern: 'no force majeure',
        replacement: 'force majeure clause for events beyond reasonable control',
        riskReductionFactor: 0.2,
        category: 'operational',
        description: 'Added force majeure protection',
      },
    ],
    defaultMitigations: [
      'Include comprehensive force majeure events',
      'Define notice requirements',
      'Add suspension of obligations during force majeure',
    ],
  },
  governing_law: {
    clauseType: 'governing_law',
    strategies: [
      {
        pattern: 'exclusive jurisdiction',
        replacement: 'non-exclusive jurisdiction in agreed courts',
        riskReductionFactor: 0.15,
        category: 'legal',
        description: 'Changed to non-exclusive jurisdiction',
      },
    ],
    defaultMitigations: [
      'Choose neutral governing law',
      'Allow non-exclusive jurisdiction',
      'Define dispute resolution mechanism',
    ],
  },
  dispute_resolution: {
    clauseType: 'dispute_resolution',
    strategies: [
      {
        pattern: 'litigation only',
        replacement: 'negotiation followed by arbitration or mediation',
        riskReductionFactor: 0.2,
        category: 'legal',
        description: 'Added alternative dispute resolution steps',
      },
    ],
    defaultMitigations: [
      'Require good faith negotiation first',
      'Include arbitration or mediation options',
      'Define arbitration rules and venue',
    ],
  },
  intellectual_property: {
    clauseType: 'intellectual_property',
    strategies: [
      {
        pattern: 'unlimited ip rights',
        replacement: 'limited IP rights as specified in agreement',
        riskReductionFactor: 0.25,
        category: 'legal',
        description: 'Limited IP rights scope to specified terms',
      },
    ],
    defaultMitigations: [
      'Clearly define IP ownership',
      'Specify license scope and duration',
      'Address pre-existing IP separately',
    ],
  },
};

export const REWRITE_TRIGGERS = {
  marketAlignmentThreshold: 0.7,
  riskScoreThreshold: 60,
  highRiskClauseThreshold: 7,
  autoTriggerEnabled: true,
};

export const RISK_REDUCTION_FACTORS = {
  liabilityCap: 0.4,
  mutualObligation: 0.25,
  noticePeriod: 0.2,
  clarification: 0.15,
  standardization: 0.1,
};

export const REWRITE_CONFIG = {
  batchSize: 3,
  maxRetries: 2,
  confidenceThreshold: 0.7,
  minSimilarityForGrounding: 0.6,
};
