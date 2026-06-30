import type { Request, Response } from 'express';
import { analyzeDocumentRisk } from '../controllers/RiskAnalysis.controller.js';

async function runRiskAnalysisSmokeTest() {
  const sampleSegments = [
    {
      page: 1,
      text: 'The Company shall have unlimited liability for any damages, including consequential damages. The agreement may be terminated without notice for convenience.',
    },
    {
      page: 2,
      text: 'Payment terms are net 90 days and late payments incur interest. The parties agree to a perpetual non-compete and exclusive jurisdiction in New York.',
    },
  ];

  const req = {
    body: {
      textSegments: sampleSegments,
      useLLM: false,
    },
  } as unknown as Request;

  let statusCode = 200;
  let payload: any;

  const res = {
    json(body: any) {
      payload = body;
      return body;
    },
    status(code: number) {
      statusCode = code;
      return {
        json(body: any) {
          payload = body;
          return body;
        },
      };
    },
  } as unknown as Response;

  await analyzeDocumentRisk(req, res);

  console.log('Status:', statusCode);
  console.log(JSON.stringify(payload, null, 2));
}

runRiskAnalysisSmokeTest().catch((error) => {
  console.error('Risk analysis smoke test failed:', error);
  process.exit(1);
});
