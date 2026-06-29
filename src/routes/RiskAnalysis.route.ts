import { Router } from 'express';
import { analyzeDocumentRisk, analyzeDocumentContextOnly } from '../controllers/RiskAnalysis.controller.js';

const router = Router();

// Main risk analysis endpoint
router.post('/analyze-risk', analyzeDocumentRisk);

// Document context analysis endpoint (optional, for deeper analysis)
router.post('/analyze-context', analyzeDocumentContextOnly);

export default router;
