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
        const doc = mupdf.Document.openDocument(buffer);
        const totalPages = doc.countPages();
        console.log(`Uploaded file: ${file.originalname}, Pages: ${totalPages}`);

        const texts = [];
        for(let i=0;i<totalPages;i++){
            const page = doc.loadPage(i);
            const text = page.toStructuredText().asText();
            texts.push({
                page:i+1,
                text:text
            });
        }
        res.send(texts);
    });
});


export default app;