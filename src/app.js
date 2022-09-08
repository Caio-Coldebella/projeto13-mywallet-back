import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import cors from "cors";
import { v4 as uuid } from 'uuid';
import Joi from "joi";

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


app.listen(5000, ()=>{
    console.log("Server running on port 5000")
});