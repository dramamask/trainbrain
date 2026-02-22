import { Router } from "express";
import layoutRoutes from "./layoutroutes.js";
import layoutsRoutes from "./layoutsroutes.js";
import pieceDefRoutes from "./piecedefroutes.js";

const router: Router = Router();

router.use('/layouts', layoutsRoutes);
router.use('/layout', layoutRoutes);
router.use('/piecedefs', pieceDefRoutes);

export default router;
