import { Router } from "express";
import { coordinateSchema } from "../middleware/coordinatevalidator.js";
import { validate } from "../middleware/validate.js";
import * as layoutController from "../controllers/layoutcontroller.js";
import { addLayoutPieceSchema } from "../middleware/addlayoutpieceschema.js";
import { indexLayoutPieceSchema } from "../middleware/indexlayoutpieceschema.js";

const router: Router = Router();

// Map URL sub-paths to controller methods
router.get('/', layoutController.getLayout);
// router.post('/piece', addLayoutPieceSchema, validate, layoutController.addLayoutPiece);
// router.delete('/piece/:index', indexLayoutPieceSchema, validate, layoutController.deleteLayoutPiece);
// router.put('/piece/rotate/:index', indexLayoutPieceSchema, validate, layoutController.rotateLayoutPiece);
// router.put('/start-position', coordinateSchema, validate, layoutController.updateStartPosition);

export default router;
