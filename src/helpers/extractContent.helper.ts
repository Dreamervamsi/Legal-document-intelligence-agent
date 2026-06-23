import mupdf from 'mupdf';

function extractContentFromFiles(files: Express.Multer.File[]): Promise<Array<{page: number, text: string}>> {
const texts:Array<{page: number, text: string}> = [];
    
    files.forEach(async(file:any)=>{
        const buffer = file.buffer;
        const doc = mupdf.Document.openDocument(buffer);
        const totalPages = doc.countPages();
        console.log(`Uploaded file: ${file.originalname}, Pages: ${totalPages}`);

        for(let i=0;i<totalPages;i++){
            const page = doc.loadPage(i);
            const text = page.toStructuredText().asText();
            texts.push({
                page:i+1,
                text:text
            });
        }
    });
    return Promise.resolve(texts);
}

export default extractContentFromFiles;