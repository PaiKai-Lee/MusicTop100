
const express = require("express");
const myList = express.Router()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
let dburl = "mongodb://localhost:27017/";


myList.use((req, res, next) => {
    if (req.session.valid == true) {
        next()
    } else
        res.status(400).send({ "status": "error" })
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
                // console.log(data)
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

// myList.delete("/api",(req,res)=>{
//     let data=req.body
//     let email=req.session.email;
//     console.log(email);
//     let song=data["song"]
//     let artist=data["artist"]
//     let query=
//     MongoClient.connect(dburl,{ useNewUrlParser: true, useUnifiedTopology: true },function(err,db){
//         if (err) { throw err };
//         let dbcol=db.db("100");
//         dbcol.collection("user").findOneAndDelete(query,)

//     })
// })

module.exports = myList