import type { Clause, HeuristicResult, RiskCategory } from '../types/risk.types.js';
import { HEURISTIC_RULES } from '../config/risk.config.js';

function analyzeHeuristics(clauses: Clause[]): HeuristicResult[] {
  const results: HeuristicResult[] = [];

  for (const clause of clauses) {
    const risks: string[] = [];
    const factors: string[] = [];
    let severity = 0;

    // Check high-risk keywords
    for (const rule of HEURISTIC_RULES.highRiskKeywords) {
      if (clause.text.toLowerCase().includes(rule.keyword.toLowerCase())) {
        risks.push(`High-risk keyword: "${rule.keyword}"`);
        factors.push(`${rule.category} risk detected`);
        severity += rule.severity;
      }
    }

    // Check medium-risk keywords
    for (const rule of HEURISTIC_RULES.mediumRiskKeywords) {
      if (clause.text.toLowerCase().includes(rule.keyword.toLowerCase())) {
        risks.push(`Medium-risk keyword: "${rule.keyword}"`);
        factors.push(`${rule.category} risk detected`);
        severity += rule.severity;
      }
    }

    // Check favorable terms (reduce severity)
    for (const rule of HEURISTIC_RULES.favorableTerms) {
      if (clause.text.toLowerCase().includes(rule.keyword.toLowerCase())) {
        factors.push(`Favorable term: "${rule.keyword}"`);
        severity += rule.severity; // Negative severity
      }
    }

    // Analyze clause-specific patterns
    const clauseSpecificRisks = analyzeClauseSpecificPatterns(clause);
    risks.push(...clauseSpecificRisks.risks);
    factors.push(...clauseSpecificRisks.factors);
    severity += clauseSpecificRisks.severity;

    // Ensure severity is within bounds
    severity = Math.max(0, Math.min(severity, 2.0));

    if (risks.length > 0 || severity > 0) {
      results.push({
        clauseId: clause.id,
        risks,
        severity,
        factors,
      });
    }
  }

  return results;
}

interface ClauseSpecificAnalysis {
  risks: string[];
  factors: string[];
  severity: number;
}

function analyzeClauseSpecificPatterns(clause: Clause): ClauseSpecificAnalysis {
  const risks: string[] = [];
  const factors: string[] = [];
  let severity = 0;

  const text = clause.text.toLowerCase();

  // Liability-specific patterns
  if (clause.type === 'liability') {
    if (text.includes('unlimited') || text.includes('without limit')) {
      risks.push('Unlimited liability clause');
      factors.push('Financial risk: No liability cap');
      severity += 0.8;
    }
    if (text.includes('consequential') || text.includes('indirect')) {
      risks.push('Consequential damages included');
      factors.push('Financial risk: Broad damage scope');
      severity += 0.5;
    }
    if (text.includes('joint and several')) {
      risks.push('Joint and several liability');
      factors.push('Financial risk: Full liability exposure');
      severity += 0.6;
    }
  }

  // Termination-specific patterns
  if (clause.type === 'termination') {
    if (text.includes('immediate') || text.includes('without notice')) {
      risks.push('Immediate termination without notice');
      factors.push('Operational risk: No notice period');
      severity += 0.7;
    }
    if (text.includes('for convenience') && !text.includes('notice')) {
      risks.push('Termination for convenience without notice');
      factors.push('Operational risk: Unstable contract');
      severity += 0.5;
    }
    if (text.includes('material breach') && text.includes('immediate')) {
      risks.push('Immediate termination for material breach');
      factors.push('Legal risk: Strict breach definition');
      severity += 0.4;
    }
  }

  // Payment-specific patterns
  if (clause.type === 'payment_terms') {
    if (text.includes('net 60') || text.includes('net 90') || text.includes('net 120')) {
      risks.push('Extended payment terms');
      factors.push('Financial risk: Cash flow impact');
      severity += 0.4;
    }
    if (text.includes('interest') && text.includes('%') && !text.includes('cap')) {
      risks.push('Uncapped interest on late payments');
      factors.push('Financial risk: Uncapped penalties');
      severity += 0.5;
    }
    if (text.includes('automatic') && text.includes('renewal')) {
      risks.push('Automatic renewal clause');
      factors.push('Operational risk: Unintended renewal');
      severity += 0.3;
    }
  }

  // Non-compete-specific patterns
  if (clause.type === 'non_compete') {
    if (text.includes('perpetual') || text.includes('permanent')) {
      risks.push('Perpetual non-compete clause');
      factors.push('Compliance risk: Unreasonable restriction');
      severity += 1.0;
    }
    if (text.includes('worldwide') || text.includes('global')) {
      risks.push('Worldwide non-compete restriction');
      factors.push('Compliance risk: Overbroad geographic scope');
      severity += 0.7;
    }
    if (text.includes('all business') || text.includes('any industry')) {
      risks.push('Broad non-compete scope');
      factors.push('Compliance risk: Overbroad activity restriction');
      severity += 0.6;
    }
  }

  // Governing law-specific patterns
  if (clause.type === 'governing_law') {
    if (text.includes('exclusive') && text.includes('jurisdiction')) {
      risks.push('Exclusive jurisdiction clause');
      factors.push('Legal risk: Limited forum options');
      severity += 0.4;
    }
    if (text.includes('waive') && text.includes('venue')) {
      risks.push('Venue waiver clause');
      factors.push('Legal risk: Convenience waived');
      severity += 0.3;
    }
  }

  return { risks, factors, severity };
}

function calculateCategorySeverity(clauses: Clause[], category: RiskCategory): number {
  const categoryClauses = clauses.filter(c => c.category === category);
  if (categoryClauses.length === 0) return 0;

  let totalSeverity = 0;
  for (const clause of categoryClauses) {
    if (clause.riskLevel === 'critical') totalSeverity += 2.0;
    else if (clause.riskLevel === 'high') totalSeverity += 1.5;
    else if (clause.riskLevel === 'medium') totalSeverity += 1.0;
    else totalSeverity += 0.5;
  }

  return totalSeverity / categoryClauses.length;
}

export default analyzeHeuristics;
export { calculateCategorySeverity };
