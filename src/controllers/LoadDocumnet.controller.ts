import {type Request, type Response} from 'express';
import scanForPromptInjections from '../helpers/preprocess.helper.js';
import extractContentFromFiles from '../helpers/extractContent.helper.js';
import qdrantClient from '../config/qdrant.config.js';
import generateEmbeddings from '../helpers/createEmbeddings.helper.js';

async function loadDocuments(req:Request,res:Response){
    try {
        const files = req.files as Express.Multer.File[];
    
        if (!files || files.length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        const texts = await extractContentFromFiles(files);
    
    
        const scannerRes = await scanForPromptInjections(texts.map((t: any) => t.text).join(' '));
    
        if (!scannerRes) {
            return res.status(400).send('Prompt injection detected in the uploaded documents.');
        }

        const points = await Promise.all(texts.map(async (t: any, index: number) =>{
            await generateEmbeddings(t.text);
        }));

        // await qdrantClient.upsert({
        //     indexName: 'qdrantCollection',
        //     points: points
        // });

        return res.send(texts);

    } catch(error:any) {
        console.error('Error occurred while processing the request:', error.message);
        return res.status(500).send('An error occurred while processing the request.');
    }
}

export default loadDocuments;