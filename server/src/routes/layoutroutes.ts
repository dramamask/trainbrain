import { Router } from "express";
import { coordinateSchema } from "../middleware/coordinatevalidator.js";
import { validate } from "../middleware/validate.js";
import * as layoutController from "../controllers/layoutcontroller.js";

const router: Router = Router();

// Map URL sub-paths to controller methods
router.get('/', layoutController.getLayout);
router.put('/start-position', coordinateSchema, validate, layoutController.updateStartPosition);

export default router;
