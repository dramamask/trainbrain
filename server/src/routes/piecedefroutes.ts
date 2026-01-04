import { Router } from "express";
import * as pieceDefController from "../controllers/piecedefcontroller.js";

const router: Router = Router();

// Map URL sub-paths to controller methods
 router.get('/', pieceDefController.getPieceDefinitions);

export default router;
