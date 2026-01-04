import { Router } from "express";
import { coordinateSchema } from "../middleware/coordinatevalidator.js";
import { validate } from "../middleware/validate.js";
import * as layoutController from "../controllers/layoutcontroller.js";
import { addLayoutPieceSchema } from "../middleware/addlayoutpieceschema.js";

const router: Router = Router();

// Map URL sub-paths to controller methods
router.get('/', layoutController.getLayout);
router.post('/', addLayoutPieceSchema, validate, layoutController.addLayoutPiece);
router.put('/start-position', coordinateSchema, validate, layoutController.updateStartPosition);

export default router;
