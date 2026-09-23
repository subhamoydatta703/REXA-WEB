import { Router } from "express";
import { verifyTokenController } from "../controllers/tokenController";


const router = Router();

// POST /api/cli/verify
router.post("/verify", verifyTokenController);


export default router;
