export interface SimilarChunk {
  id: string;
  userId: string;
  content: string;
  chunkIndex: number;
  createdAt: Date;
  distance: number;
}
