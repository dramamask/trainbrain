import { Router } from "express";
import { addNodeSchema } from "../middleware/addnodeschema.js";
import { updateNodeSchema } from "../middleware/updatenodeschema.js";
import { validate } from "../middleware/validate.js";
import * as layoutController from "../controllers/layoutcontroller.js";
import { addLayoutPieceSchema } from "../middleware/addlayoutpieceschema.js";
import { layoutPieceIndexSchema } from "../middleware/layoutpieceindexschema.js";
import { nodeIndexSchema } from "../middleware/nodeindexschema.js";

const router: Router = Router();

// Map URL sub-paths to controller methods
router.get('/', layoutController.getLayout);
router.put('/node/:index', nodeIndexSchema, updateNodeSchema, validate, layoutController.updateNode);
router.post('/node', addNodeSchema, validate, layoutController.addNode);
router.post('/piece', addLayoutPieceSchema, validate, layoutController.addLayoutPiece);
router.delete('/piece/:index', layoutPieceIndexSchema, validate, layoutController.deleteLayoutPiece);
// router.put('/piece/rotate/:index', pieceIndexSchema, validate, layoutController.rotateLayoutPiece);

export default router;
