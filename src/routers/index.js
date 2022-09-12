import { Router } from "express";
import initRouter from "./initRouter.js";
import homeRouter from "./homeRouter.js";

const router = Router();
router.use(initRouter);
router.use(homeRouter);
export default router;