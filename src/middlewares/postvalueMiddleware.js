import Joi from "joi";
import db from "../db.js";

export default async function postvalueMiddleware(req,res,next){
    const auth = req.headers.authentication.replace('Bearer ','');
    const obj = req.body;
    const posttransactionSchema = Joi.object({
        name: Joi.string().min(1).required(),
        date: Joi.date().required(),
        value: Joi.number().required()
    });
    const validate = posttransactionSchema.validate(obj);
    if(validate.error){
        res.sendStatus(400);
        return;
    }
    try {
        const userid = await db.collection("sessions").find({token: auth}).toArray();
        if(userid.length === 0){
            res.sendStatus(404);
            return;
        }
        res.locals.userid = userid;
        res.locals.obj = obj;
        next();
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}