import { createChunks } from "./chunkService";
import { processBatch, type ChunkBatchItem } from "./processBatchService";


 
export const processQueryService = async (userId: string, textData: string) => {
  try {
    const chunks = await createChunks(userId, textData);

    if (chunks.length > 500) {
      throw new Error("Text data is too large. Exceeds limit of 500 chunks.");
    }

    const batch: ChunkBatchItem[] = [];

    for (const [index, chunk] of chunks.entries()) {
      batch.push({ chunk, index });
      if (batch.length === 5) {
        await processBatch(batch, userId);
        batch.length = 0;
      }
    }

    if (batch.length > 0) {
      await processBatch(batch, userId);
    }
    
  } catch (error) {
    console.error("Error in processQueryService: ", error);
    throw error;
  }
};

