require('dotenv').config()
const yt = require("express").Router();
const MongoClient = require("mongodb").MongoClient;
const fetch = require('node-fetch');
const dburl = "mongodb://localhost:27017/";
const API_key = process.env.API_key

yt.post("/", async (req, res) => {
    let songInfo = req.body
    let song = songInfo["song"]
    let artist = songInfo["artist"]
    MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, async (err, db) => {
        if (err) { throw err };
        let dbcol = db.db("top100");
        try {
            let query = { [song]: { $exists: true } }
            let result = await dbcol.collection("youtube").findOne(query);
            if (result) {
                console.log(`get from database ${result[song]}`)
                res.send({ "videoId": result[song] });
            } else {
                fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${song}%20${artist}&type=video&videoEmbeddable=true&key=${API_key}`)
                    .then(res => res.json())
                    .then(async (myjson) => {
                        let videoId = (myjson["items"][0]["id"]['videoId'])
                        MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, async (err, db) => {
                            if (err) { throw err };
                            let dbcol = db.db("top100");
                            let result=await dbcol.collection("youtube").insertOne({ [song]: [videoId] })
                            if(result){
                                console.log("insert successfully")
                            }
                        })
                        res.send({ "videoId": videoId })
                    })
                    .catch(err => console.error(err))
            }
        } catch (e) {
            console.log(`Signup Error:${e}`)
        } finally {
            db.close()
        }
    })
})

// yt.put("/", (req, res) => {
//     let info = req.body;
//     let song = info["song"];
//     let videoID = info["videoID"]
//     Mongclint.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, async (err, db) => {
//         let dbcol = db.db("top100");

//     })
// })

// yt.post("/", (req, res) => {
//     let songInfo = req.body
//     let song = songInfo["song"]
//     let artist = songInfo["artist"]
//     console.log(songInfo);
//     fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${song}%20${artist}&type=video&videoEmbeddable=true&key=${API_key}`)
//         .then(res => res.json())
//         .then(myjson => {
//             let videoId = (myjson["items"][0]["id"]['videoId'])
//             res.send({ "videoId": videoId })
//         })
//         .catch(err => console.error(err))
// })

module.exports = yt