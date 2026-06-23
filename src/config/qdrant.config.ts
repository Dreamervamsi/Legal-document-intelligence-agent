import 'dotenv/config';
import { QdrantVector } from "@mastra/qdrant";

const qdrantClient = new QdrantVector({
    id: 'qdrant-vector-store', 
    url:process.env.QDRANT_URL || 'https://localhost:6333',
    apiKey:process.env.QDRANT_CLOUD || 'something',
    https:true
});

await qdrantClient.createIndex({
    indexName:'qdrantCollection',
    dimension:768,
    metric:'cosine'
});

export default qdrantClient;
