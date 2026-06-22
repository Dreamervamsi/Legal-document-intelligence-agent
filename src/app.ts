import * as fs from 'node:fs';
import mupdf from 'mupdf';
import express,{type Request, type Response} from 'express';
import 'dotenv/config';
import multer from 'multer';

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const app = express();

app.use(express.json({limit:'16kb'}));

app.post('/upload',upload.array('documents',2),(_req:Request,res:Response)=>{
    const files = _req.files;

    console.log(files);
});


export default app;