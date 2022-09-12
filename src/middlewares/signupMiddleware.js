import Joi from "joi";
import db from "../db.js";

export default async function signupMiddleware(req,res,next){
    const obj = req.body;
    const postSchema = Joi.object({
        name: Joi.string().min(1).required(),
        email: Joi.string().email({ tlds: { allow: false } }),
        password: Joi.string().min(1).required()
    });
    const validate = postSchema.validate(obj);
    if(validate.error){
        res.sendStatus(400);
        return;
    }
    try {
        const match = await db.collection("users").find({$or: [{name: obj.name},{email: obj.email}]}).toArray();
        if(match.length > 0){
            res.sendStatus(401);
            return;
        }
        res.locals.obj = obj;
        next();
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}