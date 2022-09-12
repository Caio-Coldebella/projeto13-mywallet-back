import db from "../db.js";

export async function gethome(req,res){
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
}

export async function postearn(req,res){
    const obj = res.locals.obj;
    const userid = res.locals.userid;
    try {
        const id = userid[0].userId;
        const name = await db.collection("users").find({_id: id}).toArray();
        const userdata = await db.collection("wallet").find({name: name[0].name}).toArray();
        const transact = userdata[0].transactions;
        transact.push(obj);
        const totalwallet  = sumwallet(transact)
        await db.collection("wallet").updateOne({_id: userdata[0]._id},{$set:{transactions: transact,total: totalwallet}});
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

export async function postdebt(req,res){
    const obj = res.locals.obj;
    const userid = res.locals.userid;
    try {
        const id = userid[0].userId;
        const name = await db.collection("users").find({_id: id}).toArray();
        const userdata = await db.collection("wallet").find({name: name[0].name}).toArray();
        const transact = userdata[0].transactions;
        obj.value *= -1;
        transact.push(obj);
        const totalwallet  = sumwallet(transact)
        await db.collection("wallet").updateOne({_id: userdata[0]._id},{$set:{transactions: transact,total: totalwallet}});
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

function sumwallet(arr){
    let sum = 0;
    for(let i=0; i<arr.length; i++){
        sum += arr[i].value;
    }
    return sum;
}