import { processQueryService } from "../services/processing/processQueryService";
import type { Request, Response } from "express";
import { verifyTokenService } from "../services/token/tokenService";
import { getUserService } from "../services/user/userService";
import { searchSimilarVectors } from "../services/vectors/vectorService";
import { createEmbeddings } from "../services/processing/embeddingService";
import type { SimilarChunk } from "../utils/types";

export const saveMemoryController = async (req: Request, res: Response) => {

    try {
        // checking header for token
        const auth = req.headers.authorization;
        if (!auth?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token missing"
            })
        }

        const data = req.body.text as string
        // slicing the token from the header
        const tokenString = auth.slice("Bearer ".length).trim();
        // verify the token
        const verifiedToken = await verifyTokenService(tokenString);
        if (!verifiedToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }
        const getUserData = await getUserService(verifiedToken.userId);
        if(!getUserData){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        if(!data || data.trim().length === 0){
            return res.status(400).json({
                success: false,
                message: "No data provided"
            })
        }
        if(typeof data !== "string"){
            return res.status(400).json({
                success: false,
                message: "Invalid data"
            })
        }
        const cleanedData = data?.trim();

        // service for save data in memory
        await processQueryService(verifiedToken.userId, cleanedData)
        
        

        // send response
        return res.status(200).json({
            success: true,
            message: "Data saved in memory",
            
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}       




export const searchMemoryController = async (req: Request, res: Response) => {

    try {
        // checking header for token
        const auth = req.headers.authorization;
        if (!auth?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token missing"
            })
        }

        const query = req.body.query as string
        // slicing the token from the header
        const tokenString = auth.slice("Bearer ".length).trim();
        // verify the token
        const verifiedToken = await verifyTokenService(tokenString);
        if (!verifiedToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }
        const getUserData = await getUserService(verifiedToken.userId);
        if(!getUserData){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        if(!query || query.trim().length === 0){
            return res.status(400).json({
                success: false,
                message: "No query provided"
            })
        }
        if(typeof query !== "string"){
            return res.status(400).json({
                success: false,
                message: "Invalid query"
            })
        }
        const cleanedQuery = query?.trim();

        // service for save data in memory

        const vectorData = await createEmbeddings(cleanedQuery)
        
        const memory = await searchSimilarVectors(
            vectorData,
            verifiedToken.userId,
            5
        ) as SimilarChunk[]
        
        const relevantChunks = memory.filter((chunk) => chunk.distance <= 0.4);

        if (relevantChunks.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No relevant information found in memory",
            });
        }

        const context = relevantChunks.map(chunk => chunk.content).join("\n\n")



        // send response
        return res.status(200).json({
            success: true,
            message: "Data found in memory",
            data: context,
            
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}