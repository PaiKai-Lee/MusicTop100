const express = require("express");
const myList = express.Router()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
let dburl = "mongodb://localhost:27017/";


myList.use((req, res, next) => {
    if (req.session.valid == true) {
        next()
    } else
        res.status(200).send({ "status": "error" })
    return
})

myList.get("/api", (req, res) => {
    MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) { throw err };
        let dbcol = db.db("top100")
        let email = req.session.user
        let query = { "email": email }
        dbcol.collection("user").find(query).project({ song: 1 }).toArray((err, result) => {
            if (err) { throw err };
            let data = result[0].song
            if (data != undefined) {
                db.close()
                res.status(200).send(data)
            } else {
                res.send({
                    "status": "ok",
                    "message": "no list"
                })
            }
        })
    })
})

myList.post("/api", (req, res) => {
    let data = req.body
    let email = req.session.user;
    let song = data["song"]
    let artist = data["artist"]
    MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) { throw err };
        let dbcol = db.db("top100")
        let query = { "email": email }
        dbcol.collection("user").find(query).project({ song: 1 }).toArray((err, result) => {
            if (err) { throw err };
            let data = result[0].song
            let ans
            if (data == undefined) {
                ans=false
            } else {
                ans = data.some((element) => {
                return song === element["song"]
                })
            }
            if (ans) {
                res.status(200).send({
                    "status": "error"
                })
            } else {
                let obj = { $push: { "song": { "song": song, "artist": artist, "insertDate": new Date() } } }
                dbcol.collection("user").updateOne(query, obj, (err, result) => {
                    if (err) throw err;
                    console.log(result["result"])
                    console.log("Data has been updated")
                    db.close()
                    res.send({ "status": "ok" })
                })
            }
        })
    })
})

myList.delete("/api",(req,res)=>{
    let data=req.body
    let email=req.session.user;
    let song=data["song"]
    let query={"email":email}
    MongoClient.connect(dburl,{ useNewUrlParser: true, useUnifiedTopology: true },async(err,db)=>{
        if (err) { throw err };
        try{
            let dbcol=db.db("top100");
            let result = await dbcol.collection("user").findOne(query,{project:{song:1}});
            let songs = result["song"]
            songs=songs.filter(item=>item.song!==song)
            await dbcol.collection("user").findOneAndUpdate(query,{$set:{"song":songs}})
            res.status(200).send({"status":"ok"})
        }catch(e){
            console.log(`deleteError:${e}`)
        }finally{
            db.close()
        }
    })
})

module.exports = myList