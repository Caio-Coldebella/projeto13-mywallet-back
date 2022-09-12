import {Router} from "express";
import { gethome, postdebt, postearn } from "../controllers/homecontrollers.js";
import postvalueMiddleware from "../middlewares/postvalueMiddleware.js";

const home = Router();
home.get('/home',gethome);
home.use(postvalueMiddleware);
home.post('/home/new-earn', postearn);
home.post('/home/new-debt', postdebt);
export default home;