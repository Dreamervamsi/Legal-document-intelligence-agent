import { type Request, type Response } from 'express';
import categorizeClauses from '../helpers/categorizeClauses.helper.js';
import analyzeHeuristics from '../helpers/heuristicAnalysis.helper.js';
import calculateRiskScore from '../helpers/calculateScore.helper.js';
import triggerDecisions from '../helpers/triggerDecisions.helper.js';
import analyzeWithLLM, { analyzeDocumentContext, combineWithHeuristic } from '../helpers/llmAnalysis.helper.js';
import { validateTextSegments, validateRiskAnalysisRequest, sanitizeTextSegment } from '../helpers/validation.helper.js';
import { riskAnalysisLogger } from '../helpers/logger.helper.js';
import type { RiskAnalysisResult } from '../types/risk.types.js';

interface TextSegment {
  text: string;
  page: number;
}

async function analyzeDocumentRisk(req: Request, res: Response) {
  try {
    const { textSegments, useLLM = true } = req.body;

    riskAnalysisLogger.info('Starting risk analysis', { segmentCount: textSegments?.length, useLLM });

    // Validate input
    const validation = validateTextSegments(textSegments);
    if (!validation.valid) {
      riskAnalysisLogger.warn('Validation failed', { errors: validation.errors });
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    const requestValidation = validateRiskAnalysisRequest(req.body);
    if (!requestValidation.valid) {
      riskAnalysisLogger.warn('Request validation failed', { errors: requestValidation.errors });
      return res.status(400).json({
        error: 'Validation failed',
        details: requestValidation.errors,
      });
    }

    // Sanitize input
    const sanitizedSegments = textSegments.map(sanitizeTextSegment);

    // Step 1: Categorize clauses
    riskAnalysisLogger.debug('Categorizing clauses');
    const clauses = categorizeClauses(sanitizedSegments);

    if (clauses.length === 0) {
      riskAnalysisLogger.info('No clauses detected');
      return res.json({
        message: 'No clauses detected in the document',
        result: {
          clauses: [],
          heuristicResults: [],
          riskScore: {
            overallScore: 0,
            categoryScores: { financial: 0, compliance: 0, operational: 0, legal: 0 },
            clauseScores: [],
          },
          decision: {
            action: 'approve',
            priority: 'low',
            message: 'No clauses detected - document may be empty or not properly formatted',
            triggeredBy: [],
          },
        },
      });
    }

    riskAnalysisLogger.info('Clauses categorized', { clauseCount: clauses.length });

    // Step 2: Heuristic analysis (always runs)
    riskAnalysisLogger.debug('Running heuristic analysis');
    const heuristicResults = analyzeHeuristics(clauses);

    // Step 3: LLM analysis (optional, based on parameter)
    let combinedHeuristicResults = heuristicResults;
    let llmUsed = false;

    if (useLLM) {
      riskAnalysisLogger.debug('Running LLM analysis');
      try {
        const llmResults = await analyzeWithLLM(clauses);
        combinedHeuristicResults = combineWithHeuristic(llmResults, heuristicResults);
        llmUsed = true;
        riskAnalysisLogger.info('LLM analysis completed', { llmUsed });
      } catch (llmError) {
        riskAnalysisLogger.warn('LLM analysis failed, using heuristic-only results', { error: llmError });
        // Continue with heuristic-only results
      }
    }

    // Step 4: Calculate risk scores
    riskAnalysisLogger.debug('Calculating risk scores');
    const riskScore = calculateRiskScore(clauses, combinedHeuristicResults);

    // Step 5: Trigger decisions
    riskAnalysisLogger.debug('Triggering decisions');
    const decision = triggerDecisions(clauses, riskScore);

    const result: RiskAnalysisResult = {
      clauses,
      heuristicResults: combinedHeuristicResults,
      riskScore,
      decision,
    };

    riskAnalysisLogger.info('Risk analysis completed', { 
      overallScore: riskScore.overallScore, 
      decision: decision.action,
      llmUsed 
    });

    return res.json({
      message: 'Risk analysis completed successfully',
      llmUsed,
      result,
    });
  } catch (error: any) {
    riskAnalysisLogger.error('Error in risk analysis', { error: error.message, stack: error.stack });
    return res.status(500).json({
      error: 'An error occurred during risk analysis',
      details: error.message,
    });
  }
}

async function analyzeDocumentContextOnly(req: Request, res: Response) {
  try {
    const { textSegments } = req.body;

    riskAnalysisLogger.info('Starting document context analysis', { segmentCount: textSegments?.length });

    // Validate input
    const validation = validateTextSegments(textSegments);
    if (!validation.valid) {
      riskAnalysisLogger.warn('Validation failed', { errors: validation.errors });
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Sanitize input
    const sanitizedSegments = textSegments.map(sanitizeTextSegment);

    const clauses = categorizeClauses(sanitizedSegments);

    if (clauses.length === 0) {
      riskAnalysisLogger.info('No clauses detected for context analysis');
      return res.json({
        message: 'No clauses detected',
        context: {
          overallAmbiguity: false,
          missingEssentialClauses: [],
          documentStructure: 'No clauses to analyze',
        },
      });
    }

    riskAnalysisLogger.info('Analyzing document context with LLM');
    const context = await analyzeDocumentContext(clauses);

    riskAnalysisLogger.info('Document context analysis completed');
    return res.json({
      message: 'Document context analysis completed',
      context,
    });
  } catch (error: any) {
    riskAnalysisLogger.error('Error in document context analysis', { error: error.message, stack: error.stack });
    return res.status(500).json({
      error: 'An error occurred during document context analysis',
      details: error.message,
    });
  }
}

export { analyzeDocumentRisk, analyzeDocumentContextOnly };
