import type { Clause, RiskScore, DecisionResult } from '../types/risk.types.js';
import { DECISION_TRIGGERS, RISK_THRESHOLDS } from '../config/risk.config.js';

function triggerDecisions(clauses: Clause[], riskScore: RiskScore): DecisionResult {
  const triggeredBy: string[] = [];
  let action: 'flag' | 'block' | 'approve' | 'review' = 'approve';
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let message = 'Document analysis complete. No significant risks detected.';

  // Check overall score
  if (riskScore.overallScore >= DECISION_TRIGGERS.criticalScore) {
    triggeredBy.push(`Overall risk score (${riskScore.overallScore}) exceeds critical threshold (${DECISION_TRIGGERS.criticalScore})`);
    action = 'block';
    priority = 'critical';
    message = `CRITICAL: Document has extremely high risk score (${riskScore.overallScore}/100). Immediate review required before proceeding.`;
  } else if (riskScore.overallScore >= DECISION_TRIGGERS.alertScore) {
    triggeredBy.push(`Overall risk score (${riskScore.overallScore}) exceeds alert threshold (${DECISION_TRIGGERS.alertScore})`);
    action = 'review';
    priority = 'high';
    message = `ALERT: Document has high risk score (${riskScore.overallScore}/100). Detailed review recommended before proceeding.`;
  } else if (riskScore.overallScore >= DECISION_TRIGGERS.warningScore) {
    triggeredBy.push(`Overall risk score (${riskScore.overallScore}) exceeds warning threshold (${DECISION_TRIGGERS.warningScore})`);
    action = 'flag';
    priority = 'medium';
    message = `WARNING: Document has moderate risk score (${riskScore.overallScore}/100). Review flagged clauses before proceeding.`;
  }

  // Check for critical clauses
  const criticalClauses = clauses.filter(c => c.riskLevel === 'critical');
  if (criticalClauses.length >= DECISION_TRIGGERS.criticalClauseCount) {
    triggeredBy.push(`${criticalClauses.length} critical clause(s) detected`);
    if (action !== 'block') {
      action = 'block';
      priority = 'critical';
      message = `CRITICAL: ${criticalClauses.length} critical clause(s) detected. Document requires immediate legal review.`;
    }
  }

  // Check for high-risk clauses
  const highRiskClauses = clauses.filter(c => c.riskLevel === 'high');
  if (highRiskClauses.length >= DECISION_TRIGGERS.highRiskClauseCount) {
    triggeredBy.push(`${highRiskClauses.length} high-risk clause(s) detected`);
    if (action === 'approve' || action === 'flag') {
      action = 'review';
      priority = 'high';
      message = `ALERT: ${highRiskClauses.length} high-risk clause(s) detected. Comprehensive review required.`;
    }
  }

  // Check category-specific scores
  for (const [category, score] of Object.entries(riskScore.categoryScores) as [string, number][]) {
    if (score >= 70) {
      triggeredBy.push(`${category} category score (${score}) exceeds 70`);
      if (action === 'approve') {
        action = 'flag';
        priority = 'medium';
      }
    }
    if (score >= 85) {
      triggeredBy.push(`${category} category score (${score}) exceeds 85`);
      if (action !== 'block') {
        action = 'review';
        priority = 'high';
      }
    }
  }

  // Check for specific high-risk clause types
  const liabilityClauses = clauses.filter(c => c.type === 'liability' && c.riskLevel === 'critical');
  if (liabilityClauses.length > 0) {
    triggeredBy.push('Critical liability clause(s) detected');
    if (action !== 'block') {
      action = 'review';
      priority = 'high';
    }
  }

  const nonCompeteClauses = clauses.filter(c => c.type === 'non_compete' && c.riskLevel === 'critical');
  if (nonCompeteClauses.length > 0) {
    triggeredBy.push('Critical non-compete clause(s) detected - may be unenforceable');
    if (action !== 'block') {
      action = 'review';
      priority = 'high';
    }
  }

  // Check for missing essential clauses (optional enhancement)
  const essentialClauseTypes = ['termination', 'liability', 'governing_law'];
  const missingClauses = essentialClauseTypes.filter(type => 
    !clauses.some(c => c.type === type)
  );

  if (missingClauses.length > 0 && missingClauses.length < essentialClauseTypes.length) {
    triggeredBy.push(`Missing potentially essential clause(s): ${missingClauses.join(', ')}`);
    if (action === 'approve') {
      action = 'flag';
      priority = 'low';
    }
  }

  // If no triggers, ensure approve action
  if (triggeredBy.length === 0) {
    action = 'approve';
    priority = 'low';
    message = 'Document analysis complete. No significant risks detected. Document may proceed.';
  }

  return {
    action,
    priority,
    message,
    triggeredBy,
  };
}

function getRiskThreshold(score: number): { level: string; action: string } {
  for (const threshold of RISK_THRESHOLDS) {
    if (score >= threshold.min && score <= threshold.max) {
      return {
        level: threshold.level,
        action: threshold.action,
      };
    }
  }
  return { level: 'low', action: 'info' };
}

export default triggerDecisions;
export { getRiskThreshold };
