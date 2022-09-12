import {Router} from "express";
import { postlogin,postsignup,poststatus } from "../controllers/initcontrollers.js";
import loginMiddleware from "../middlewares/loginMiddleware.js";
import signupMiddleware from "../middlewares/signupMiddleware.js";

const init = Router();
init.post('/sign-up', signupMiddleware, postsignup);
init.post('/status', poststatus);
init.post('/', loginMiddleware, postlogin);
export default init;