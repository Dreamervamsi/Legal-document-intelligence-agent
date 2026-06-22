import * as fs from 'node:fs';
import mupdf from 'mupdf';
import express,{type Request, type Response} from 'express';
import 'dotenv/config';
import multer from 'multer';

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const app = express();

app.use(express.json({limit:'16kb'}));

app.post('/upload',upload.array('documents',2),(req:Request,res:Response)=>{
    const files = req.files as Express.Multer.File[];
    
    files.forEach((file:any)=>{
        const buffer = file.buffer;
        const pdfDocument = mupdf.Document.openDocument(buffer);
        const pageCount = pdfDocument.countPages();
        console.log(`Uploaded file: ${file.originalname}, Pages: ${pageCount}`);
    });
});


export default app;