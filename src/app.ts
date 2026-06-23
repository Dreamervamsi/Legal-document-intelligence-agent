import express,{type Request, type Response} from 'express';
import 'dotenv/config';
import router from './routes/LoadDocument.route.js';


const app = express();

app.use(express.json({limit:'16kb'}));

app.use('/', router);

export default app;

