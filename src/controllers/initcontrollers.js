import db from "../db.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from 'uuid';

export async function postlogin(req,res){
    const token = uuid();
    const userid = res.locals.userid;
    try{
        await db.collection("sessions").insertOne({ 
          token: token,
          userId: userid,
          lastStatus: Date.now()
        });
        res.status(200).send(token);
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
};

export async function postsignup(req,res){
    const obj = res.locals.obj;
    try {
        const hashpass = bcrypt.hashSync(obj.password,10);
        await db.collection("users").insertOne({name: obj.name, email: obj.email, password: hashpass});
        await db.collection("wallet").insertOne({name: obj.name, total: 0, transactions: []});
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
};

export async function poststatus(req,res){
    const obj = req.body.token;
    const token = obj.replace('Bearer ','');
    try {
        await db.collection("sessions").updateOne({token: token},{$set:{lastStatus: Date.now()}});
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        console.error(error)
    }
};