import Joi from "joi";
import bcrypt from "bcrypt";
import db from "../db.js";

export default async function loginMiddleware(req,res,next){
    const obj = req.body;
    const postSchema = Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }),
        password: Joi.string().min(1).required()
    });
    const validate = postSchema.validate(obj);
    if(validate.error){
        console.error(validate.error)
        res.sendStatus(400);
        return;
    }
    try {
        const user = await db.collection("users").find({email: obj.email}).toArray();
        if(user.length === 0 || !bcrypt.compareSync(obj.password,user[0].password)){
            res.sendStatus(404);
            return;
        }
        res.locals.userid = user[0]._id;
        next();
    }catch(error){
        console.error(error);
        res.sendStatus(error);
    }
}