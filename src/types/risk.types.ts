export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskCategory = 'financial' | 'compliance' | 'operational' | 'legal';
export type DecisionAction = 'flag' | 'block' | 'approve' | 'review';
export type DecisionPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Clause {
  id: string;
  type: string;
  text: string;
  page: number;
  confidence: number;
  riskLevel: RiskLevel;
  category: RiskCategory;
}

export interface HeuristicResult {
  clauseId: string;
  risks: string[];
  severity: number;
  factors: string[];
}

export interface ClauseScore {
  clauseId: string;
  score: number;
  factors: string[];
}

export interface CategoryScores {
  financial: number;
  compliance: number;
  operational: number;
  legal: number;
}

export interface RiskScore {
  overallScore: number;
  categoryScores: CategoryScores;
  clauseScores: ClauseScore[];
}

export interface DecisionTrigger {
  condition: string;
  action: DecisionAction;
  message: string;
  priority: DecisionPriority;
}

export interface DecisionResult {
  action: DecisionAction;
  priority: DecisionPriority;
  message: string;
  triggeredBy: string[];
}

export interface RiskAnalysisResult {
  clauses: Clause[];
  heuristicResults: HeuristicResult[];
  riskScore: RiskScore;
  decision: DecisionResult;
}
