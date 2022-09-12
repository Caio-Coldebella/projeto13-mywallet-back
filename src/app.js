import express from 'express';
import cors from "cors";
import router from "./routers/index.js";
import db from "./db.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

setInterval(()=>{removeinative()},30000);

async function removeinative(){
    const actual = Date.now();
    try {
        const arr = await db.collection("sessions").find().toArray();
        for(let i=0; i<arr.length;i++){
            const past = Number(arr[i].lastStatus)
            const diff = Math.abs(actual - past)/1000; 
            if(diff > 20){
                await db.collection("sessions").deleteOne({_id: arr[i]._id});
            }
        }
    } catch (error) {
        return;
    }
}

app.listen(5000, ()=>{
    console.log("Server running on port 5000")
});