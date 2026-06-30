import express,{type Request, type Response} from 'express';
import 'dotenv/config';
import documentRouter from './routes/LoadDocument.route.js';
import riskAnalysisRouter from './routes/RiskAnalysis.route.js';


const app = express();

app.use(express.json({limit:'16kb'}));

app.use('/', documentRouter);
app.use('/risk', riskAnalysisRouter);

export default app;

