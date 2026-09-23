
import { type AuthenticatedRequest } from '../middlewares/authMiddleware';
import type { Request, Response } from "express";
import { getUserService, createUserService } from '../services/user/userService';
import { clerkClient } from "@clerk/express";
import { verifyTokenService } from '../services/token/tokenService';
import { processQueryService } from '../services/processing/processQueryService';




export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
    try {

        if (!req.userId) {
            return res.status(404).json({
                success: false,
                message: "Invalid user"
            })
        }

        const existingUser = await getUserService(req.userId)
        if (!existingUser) {
            return res.status(409).json({
                success: false,
                message: "User not found"
            })
        }
        return res.status(200).json({
            success: true,
            existingUser
        })

    } catch (error) {

        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })



    }
}

export const createUserController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(404).json({
                success: false,
                message: "Invalid user"
            })
        }

        const existingUser = await getUserService(req.userId)
        if (existingUser) {
            return res.status(40).json({
                success: false,
                message: "User already exists"
            })
        }

        //  Fetch user data from Clerk
        const clerkUser = await clerkClient.users.getUser(req.userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "No email associated with this Clerk account",
            });
        }

        const user = await createUserService(req.userId, email, name!)

        return res.status(201).json({
            success: true,
            user,
        });




    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// // rexa cli verified user data
//  export const saveMemoryController = async (req: Request, res: Response) => {

//     try {
//         // checking header for token
//         const auth = req.headers.authorization;
//         if (!auth?.startsWith("Bearer ")) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Token missing"
//             })
//         }

//         const data = req.body.text as string
//         // slicing the token from the header
//         const tokenString = auth.slice("Bearer ".length).trim();
//         // verify the token
//         const verifiedToken = await verifyTokenService(tokenString);
//         if (!verifiedToken) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid or expired token"
//             });
//         }
//         const getUserData = await getUserService(verifiedToken.userId);
//         if(!getUserData){
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             })
//         }
//         if(!data || data.trim().length === 0){
//             return res.status(400).json({
//                 success: false,
//                 message: "No data provided"
//             })
//         }
//         if(typeof data !== "string"){
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid data"
//             })
//         }
//         const cleanedData = data?.trim();

//         // service for save data in memory
//         await processQueryService(verifiedToken.userId, cleanedData)
        
        

//         // send response
//         return res.status(200).json({
//             success: true,
//             message: "Data saved in memory",
            
//         });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// }