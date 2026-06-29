import {type Request, type Response} from 'express';
import scanForPromptInjections from '../helpers/preprocess.helper.js';
import extractContentFromFiles from '../helpers/extractContent.helper.js';
import createCollection from '../config/qdrant.config.js';
import generateEmbeddings from '../helpers/createEmbeddings.helper.js';
import categorizeClauses from '../helpers/categorizeClauses.helper.js';
import analyzeHeuristics from '../helpers/heuristicAnalysis.helper.js';
import calculateRiskScore from '../helpers/calculateScore.helper.js';
import triggerDecisions from '../helpers/triggerDecisions.helper.js';

const qdrantClient = await createCollection();
        
async function loadDocuments(req:Request,res:Response){
    try {
        const files = req.files as Express.Multer.File[];
        const enableRiskAnalysis = req.query.riskAnalysis === 'true' || req.body.riskAnalysis === true;
    
        if (!files || files.length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        const texts = await extractContentFromFiles(files);
    
    
        const scannerRes = await scanForPromptInjections(texts.map((t: any) => t.text).join(' '));
    
        if (!scannerRes) {
            return res.status(400).send('Prompt injection detected in the uploaded documents.');
        }

        const points = await Promise.all(texts.map(async (t: any, index: number) =>{
            return await generateEmbeddings(t.text);
        }));
        
        let riskAnalysisResult : any = null;
        let metadata = texts.map((t: any) => ({
            text: t.text
        }));

        // Optional risk analysis - does not affect existing flow
        if (enableRiskAnalysis) {
            try {
                const textSegments = texts.map((t: any) => ({
                    text: t.text,
                    page: t.page
                }));

                const clauses = categorizeClauses(textSegments);
                const heuristicResults = analyzeHeuristics(clauses);
                const riskScore = calculateRiskScore(clauses, heuristicResults);
                const decision = triggerDecisions(clauses, riskScore);

                riskAnalysisResult = {
                    clauses,
                    heuristicResults,
                    riskScore,
                    decision
                };

                // Enrich metadata with risk scores
                metadata = texts.map((t: any, index: number) => ({
                    text: t.text,
                    page: t.page,
                    riskScore: riskAnalysisResult?.riskScore.overallScore || 0,
                    decision: riskAnalysisResult?.decision.action || 'approve'
                }));
            } catch (riskError) {
                console.warn('Risk analysis failed, continuing with document upload:', riskError);
                // Continue with normal flow if risk analysis fails
            }
        }
        
        await qdrantClient.upsert({
            indexName: 'qdrantCollection',
            vectors: points,
            metadata:metadata
        });

        const response: any = {
            message: "Documents loaded and processed successfully."
        };

        if (riskAnalysisResult) {
            response.riskAnalysis = riskAnalysisResult;
        }

        return res.json(response);

    } catch(error:any) {
        console.error('Error occurred while processing the request:', error.message);
        return res.status(500).send('An error occurred while processing the request.');
    }
}

export default loadDocuments;