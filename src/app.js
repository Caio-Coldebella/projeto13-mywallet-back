import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import cors from "cors";
import { v4 as uuid } from 'uuid';
import Joi from "joi";
import dayjs from "dayjs";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("MyWallet");
});

const app = express();
app.use(express.json());
app.use(cors());

//Routes
app.post('/', async (req,res)=>{
    const obj = req.body;
    const postSchema = Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }),
        password: Joi.string().min(1).required()
    });
    const validate = postSchema.validate(obj);
    if(validate.error){
        res.sendStatus(400);
        return;
    }
    try {
        const user = await db.collection("users").find({email: obj.email}).toArray();
        if(user.length === 0 || !bcrypt.compareSync(obj.password,user[0].password)){
            res.sendStatus(404);
            return;
        }
        const token = uuid();
        await db.collection("sessions").insertOne({ 
          token: token,
          userId: user[0]._id,
          lastStatus: Date.now()
        });
        res.status(200).send(token);
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
});

app.post('/sign-up', async (req,res)=>{
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
        const hashpass = bcrypt.hashSync(obj.password,10);
        await db.collection("users").insertOne({name: obj.name, email: obj.email, password: hashpass});
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
});

app.get('/home',async (req,res)=>{
    const auth = req.headers.authentication.replace('Bearer ','');
    try {
        const userid = await db.collection("sessions").find({token: auth}).toArray();
        if(userid.length === 0){
            res.sendStatus(404);
            return;
        }
        const id = userid[0].userId;
        const name = await db.collection("users").find({_id: id}).toArray();
        const userdata = await db.collection("wallet").find({name: name[0].name}).toArray();
        res.status(200).send(userdata[0]);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.post('/status', async (req,res)=>{
    const obj = req.body.token;
    const token = obj.replace('Bearer ','');
    try {
        await db.collection("sessions").updateOne({token: token},{$set:{lastStatus: Date.now()}});
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        console.error(error)
    }
});


app.listen(5000, ()=>{
    console.log("Server running on port 5000")
});