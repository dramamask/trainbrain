import { Router } from "express";
import { addNodeSchema } from "../middleware/addnodeschema.js";
import { updateNodeSchema } from "../middleware/updatenodeschema.js";
import { validate } from "../middleware/validate.js";
import * as layoutController from "../controllers/layoutcontroller.js";
import { addLayoutPieceSchema } from "../middleware/addlayoutpieceschema.js";
import { nodeIndexSchema } from "../middleware/nodeindexschema.js";
import { deleteLayoutElementSchema } from "../middleware/deletelayoutelementschema.js";
import { moveLayoutPieceSchema } from "../middleware/movelayoutpieceschema.js";
import { pieceIndexSchema } from "../middleware/pieceindexschema.js";

const router: Router = Router();

// Map URL sub-paths to controller methods
router.get('/', layoutController.getLayout);
router.post('/node', addNodeSchema, validate, layoutController.addNode);
router.put('/node/:index', nodeIndexSchema, updateNodeSchema, validate, layoutController.updateNode);
router.post('/piece', addLayoutPieceSchema, validate, layoutController.addLayoutPiece);
router.put('/piece/:index', pieceIndexSchema, moveLayoutPieceSchema, validate, layoutController.movePiece);
router.delete('/element', deleteLayoutElementSchema, validate, layoutController.deleteLayoutElement);

export default router;
