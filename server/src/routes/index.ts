import { Router } from "express";
import layoutRoutes from "./layoutroutes.js";
//import pieceDefRoutes from "./piecedefroutes.js";

const router: Router = Router();

router.use('/layout', layoutRoutes);
//router.use('/piecedef', pieceDefRoutes);

export default router;
