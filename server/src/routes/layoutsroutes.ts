import { Router } from "express";
import { validate } from "../middleware/validate.js";
import * as layoutsController from "../controllers/layoutscontroller.js";

const router: Router = Router();

// Map URL sub-paths to controller methods
router.get('/', layoutsController.getLayouts);
router.post('/active/:index', layoutsController.setActiveLayout);

export default router;
