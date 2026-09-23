import { Router } from "express";

import { saveMemoryController, searchMemoryController } from "../controllers/memoryController";

const router = Router()

router.post("/memory", saveMemoryController);
router.post("/memory/search", searchMemoryController)

export default router;