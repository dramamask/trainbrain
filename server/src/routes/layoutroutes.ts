import { Router } from "express";
import { coordinateSchema } from "../middleware/coordinatevalidator.js";
import { validate } from "../middleware/validate.js";
import * as layoutController from "../controllers/layoutcontroller.js";
import { addLayoutPieceSchema } from "../middleware/addlayoutpieceschema.js";
import { pieceIndexSchema } from "../middleware/pieceindexschema.js";
import { nodeIndexSchema } from "../middleware/nodeindexschema.js";

const router: Router = Router();

// Map URL sub-paths to controller methods
router.get('/', layoutController.getLayout);
router.put('/node/:index', nodeIndexSchema, coordinateSchema, validate, layoutController.updateNode);
// router.post('/piece', addLayoutPieceSchema, validate, layoutController.addLayoutPiece);
// router.delete('/piece/:index', pieceIndexSchema, validate, layoutController.deleteLayoutPiece);
// router.put('/piece/rotate/:index', pieceIndexSchema, validate, layoutController.rotateLayoutPiece);

export default router;
