import 'dotenv/config';
import { QdrantVector } from "@mastra/qdrant";

async function createCollection(){
    const qdrantClient = new QdrantVector({
    id: 'qdrant-vector-store', 
    url:process.env.QDRANT_URL || 'https://localhost:6333',
    apiKey:process.env.QDRANT_CLOUD || 'something',
    https:true
});
    const indexes = await qdrantClient.listIndexes();
    const isExists = indexes.includes('qdrantCollection');

    if(isExists){
        await qdrantClient.deleteIndex({
            indexName:'qdrantCollection'
        });
    }

    await qdrantClient.createIndex({
        indexName:'qdrantCollection',
        dimension:384,
        metric:'cosine'
    });

    return qdrantClient;
}

export default createCollection;
