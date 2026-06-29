import type { RiskCategory, RiskLevel } from '../types/risk.types.js';

export interface ClausePattern {
  type: string;
  patterns: RegExp[];
  category: RiskCategory;
  defaultRiskLevel: RiskLevel;
}

export interface RiskThreshold {
  min: number;
  max: number;
  level: RiskLevel;
  action: 'info' | 'warning' | 'alert' | 'critical';
}

export interface CategoryWeight {
  category: RiskCategory;
  weight: number;
}

export const CLAUSE_PATTERNS: ClausePattern[] = [
  {
    type: 'termination',
    patterns: [
      /terminat(e|ion|ing)/gi,
      /end of agreement/gi,
      /expiration/gi,
      /notice period/gi,
      /early terminat/gi,
    ],
    category: 'legal',
    defaultRiskLevel: 'medium',
  },
  {
    type: 'liability',
    patterns: [
      /liabilit(y|ies)/gi,
      /indemnif(y|ication|ying)/gi,
      /hold harmless/gi,
      /damages/gi,
      /limitation of liability/gi,
      /unlimited liability/gi,
    ],
    category: 'financial',
    defaultRiskLevel: 'high',
  },
  {
    type: 'payment_terms',
    patterns: [
      /payment terms?/gi,
      /pay(able|ment)/gi,
      /invoice/gi,
      /late fee/gi,
      /penalt(y|ies)/gi,
      /interest rate/gi,
      /net \d+/gi,
    ],
    category: 'financial',
    defaultRiskLevel: 'medium',
  },
  {
    type: 'confidentiality',
    patterns: [
      /confidential/gi,
      /non-disclos/gi,
      /trade secret/gi,
      /proprietary/gi,
      /sensitive information/gi,
    ],
    category: 'compliance',
    defaultRiskLevel: 'medium',
  },
  {
    type: 'force_majeure',
    patterns: [
      /force majeure/gi,
      /act of god/gi,
      /unforeseeable circumstances/gi,
      /beyond reasonable control/gi,
    ],
    category: 'operational',
    defaultRiskLevel: 'low',
  },
  {
    type: 'governing_law',
    patterns: [
      /governing law/gi,
      /jurisdiction/gi,
      /governed by/gi,
      /courts of/gi,
      /venue/gi,
    ],
    category: 'legal',
    defaultRiskLevel: 'medium',
  },
  {
    type: 'dispute_resolution',
    patterns: [
      /dispute resolution/gi,
      /arbitration/gi,
      /mediation/gi,
      /litigation/gi,
      /settlement/gi,
    ],
    category: 'legal',
    defaultRiskLevel: 'medium',
  },
  {
    type: 'non_compete',
    patterns: [
      /non-compete/gi,
      /non compete/gi,
      /non-solicit/gi,
      /non solicit/gi,
      /restrictive covenant/gi,
      /competition/gi,
    ],
    category: 'compliance',
    defaultRiskLevel: 'high',
  },
  {
    type: 'intellectual_property',
    patterns: [
      /intellectual property/gi,
      /ip rights?/gi,
      /copyright/gi,
      /trademark/gi,
      /patent/gi,
      /ownership/gi,
      /license/gi,
    ],
    category: 'legal',
    defaultRiskLevel: 'medium',
  },
];

export const HEURISTIC_RULES = {
  highRiskKeywords: [
    { keyword: 'unlimited liability', severity: 1.0, category: 'financial' },
    { keyword: 'perpetual', severity: 0.9, category: 'legal' },
    { keyword: 'irrevocable', severity: 0.8, category: 'legal' },
    { keyword: 'without limitation', severity: 0.7, category: 'financial' },
    { keyword: 'exclusive jurisdiction', severity: 0.6, category: 'legal' },
    { keyword: 'waive all rights', severity: 0.9, category: 'legal' },
    { keyword: 'no liability', severity: 1.0, category: 'financial' },
    { keyword: 'sole discretion', severity: 0.5, category: 'operational' },
  ],
  mediumRiskKeywords: [
    { keyword: 'reasonable', severity: 0.3, category: 'legal' },
    { keyword: 'material breach', severity: 0.4, category: 'legal' },
    { keyword: 'termination for convenience', severity: 0.5, category: 'operational' },
    { keyword: 'liquidated damages', severity: 0.6, category: 'financial' },
  ],
  favorableTerms: [
    { keyword: 'mutual', severity: -0.3, category: 'legal' },
    { keyword: 'reasonable efforts', severity: -0.2, category: 'operational' },
    { keyword: 'good faith', severity: -0.2, category: 'legal' },
    { keyword: 'capped liability', severity: -0.4, category: 'financial' },
  ],
};

export const CATEGORY_WEIGHTS: CategoryWeight[] = [
  { category: 'financial', weight: 0.35 },
  { category: 'compliance', weight: 0.25 },
  { category: 'legal', weight: 0.25 },
  { category: 'operational', weight: 0.15 },
];

export const RISK_THRESHOLDS: RiskThreshold[] = [
  { min: 0, max: 30, level: 'low', action: 'info' },
  { min: 31, max: 60, level: 'medium', action: 'warning' },
  { min: 61, max: 80, level: 'high', action: 'alert' },
  { min: 81, max: 100, level: 'critical', action: 'critical' },
];

export const DECISION_TRIGGERS = {
  criticalScore: 81,
  alertScore: 61,
  warningScore: 31,
  highRiskClauseCount: 3,
  criticalClauseCount: 1,
};

export const SCORING_CONFIG = {
  maxDocumentScore: 100,
  maxClauseScore: 10,
  baseClauseScore: 5,
  riskLevelMultipliers: {
    low: 0.5,
    medium: 1.0,
    high: 1.5,
    critical: 2.0,
  },
};
