import { Router } from "express";
import { validate } from "../middleware/validate.js";
import * as layoutsController from "../controllers/layoutscontroller.js";
import { layoutsIndexSchema } from "../middleware/layoutsindexschema.js";

const router: Router = Router();

// Map URL sub-paths to controller methods
router.get('/', layoutsController.getLayouts);
router.post('/active/:index', layoutsIndexSchema, validate, layoutsController.setActiveLayout);

export default router;
