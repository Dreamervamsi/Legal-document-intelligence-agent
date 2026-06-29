import type { Clause, HeuristicResult, RiskScore, CategoryScores, ClauseScore } from '../types/risk.types.js';
import { CATEGORY_WEIGHTS, SCORING_CONFIG, RISK_THRESHOLDS } from '../config/risk.config.js';
import { calculateCategorySeverity } from './heuristicAnalysis.helper.js';

function calculateRiskScore(clauses: Clause[], heuristicResults: HeuristicResult[]): RiskScore {
  const clauseScores = calculateClauseScores(clauses, heuristicResults);
  const categoryScores = calculateCategoryScores(clauses, clauseScores);
  const overallScore = calculateOverallScore(categoryScores, clauses);

  return {
    overallScore,
    categoryScores,
    clauseScores,
  };
}

function calculateClauseScores(clauses: Clause[], heuristicResults: HeuristicResult[]): ClauseScore[] {
  const clauseScores: ClauseScore[] = [];
  const heuristicMap = new Map(heuristicResults.map(r => [r.clauseId, r]));

  for (const clause of clauses) {
    const heuristic = heuristicMap.get(clause.id);
    const factors: string[] = [];

    // Base score from risk level
    let score = SCORING_CONFIG.baseClauseScore;
    score *= SCORING_CONFIG.riskLevelMultipliers[clause.riskLevel];

    if (heuristic) {
      score += heuristic.severity * 2;
      factors.push(...heuristic.factors);

      if (heuristic.risks.length > 2) {
        score += 0.5;
        factors.push('Multiple risk factors detected');
      }
    }

    // Category-specific adjustments
    score = applyCategoryAdjustments(clause, score, factors);

    score = Math.max(0, Math.min(score, SCORING_CONFIG.maxClauseScore));

    score = Math.round(score * 10) / 10;

    if (factors.length === 0) {
      factors.push(`Standard ${clause.type} clause`);
    }

    clauseScores.push({
      clauseId: clause.id,
      score,
      factors,
    });
  }

  return clauseScores;
}

function applyCategoryAdjustments(clause: Clause, score: number, factors: string[]): number {
  const text = clause.text.toLowerCase();

  switch (clause.category) {
    case 'financial':
      // Financial clauses get higher weight for risk
      if (text.includes('unlimited') || text.includes('without limit')) {
        score += 1.5;
        factors.push('Unlimited financial exposure');
      }
      if (text.includes('penalty') && !text.includes('cap')) {
        score += 1.0;
        factors.push('Uncapped penalties');
      }
      break;

    case 'compliance':
      // Compliance risks are critical
      if (text.includes('perpetual') || text.includes('permanent')) {
        score += 2.0;
        factors.push('Perpetual obligation - may be unenforceable');
      }
      if (text.includes('worldwide') || text.includes('global')) {
        score += 1.0;
        factors.push('Global compliance requirements');
      }
      break;

    case 'legal':
      // Legal risks affect enforceability
      if (text.includes('waive') && text.includes('rights')) {
        score += 1.0;
        factors.push('Rights waiver clause');
      }
      if (text.includes('exclusive') && text.includes('jurisdiction')) {
        score += 0.5;
        factors.push('Exclusive jurisdiction limitation');
      }
      break;

    case 'operational':
      // Operational risks affect business continuity
      if (text.includes('immediate') && text.includes('terminat')) {
        score += 1.0;
        factors.push('Immediate termination risk');
      }
      if (text.includes('sole discretion')) {
        score += 0.5;
        factors.push('Sole discretion provision');
      }
      break;
  }

  return score;
}

function calculateCategoryScores(clauses: Clause[], clauseScores: ClauseScore[]): CategoryScores {
  const categoryScores: CategoryScores = {
    financial: 0,
    compliance: 0,
    operational: 0,
    legal: 0,
  };

  const clauseScoreMap = new Map(clauseScores.map(cs => [cs.clauseId, cs]));

  for (const category of Object.keys(categoryScores) as Array<keyof CategoryScores>) {
    const categoryClauses = clauses.filter(c => c.category === category);
    
    if (categoryClauses.length === 0) {
      categoryScores[category] = 0;
      continue;
    }

    let totalScore = 0;
    for (const clause of categoryClauses) {
      const scoreData = clauseScoreMap.get(clause.id);
      if (scoreData) {
        totalScore += scoreData.score;
      }
    }

    // Average score for this category, normalized to 0-100
    const averageScore = totalScore / categoryClauses.length;
    categoryScores[category] = Math.round((averageScore / SCORING_CONFIG.maxClauseScore) * 100);
  }

  return categoryScores;
}

function calculateOverallScore(categoryScores: CategoryScores, clauses: Clause[]): number {
  let weightedScore = 0;

  for (const weightConfig of CATEGORY_WEIGHTS) {
    const categoryScore = categoryScores[weightConfig.category as keyof CategoryScores];
    weightedScore += categoryScore * weightConfig.weight;
  }

  // Apply frequency penalty for repeated high-risk clauses
  const highRiskClauseCount = clauses.filter(c => 
    c.riskLevel === 'high' || c.riskLevel === 'critical'
  ).length;

  if (highRiskClauseCount > 3) {
    const penalty = (highRiskClauseCount - 3) * 2;
    weightedScore = Math.min(weightedScore + penalty, 100);
  }

  // Apply bonus for having no critical clauses
  const hasCriticalClauses = clauses.some(c => c.riskLevel === 'critical');
  if (!hasCriticalClauses && clauses.length > 0) {
    weightedScore = Math.max(weightedScore - 5, 0);
  }

  // Ensure score is within bounds
  weightedScore = Math.max(0, Math.min(weightedScore, SCORING_CONFIG.maxDocumentScore));

  return Math.round(weightedScore);
}

function getRiskLevelFromScore(score: number): string {
  for (const threshold of RISK_THRESHOLDS) {
    if (score >= threshold.min && score <= threshold.max) {
      return threshold.level;
    }
  }
  return 'low';
}

export default calculateRiskScore;
export { getRiskLevelFromScore };
