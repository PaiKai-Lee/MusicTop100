const express = require("express");
const billboard = express.Router()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
let dburl = "mongodb://localhost:27017/";

billboard.get("/", (req, res) => {
    console.log(req.params)
    MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        let data = {}
        let dbcol = db.db("top100");
        dbcol.collection("billboard").find({}, { projection: { _id: 0, year: 1, genres: 1 } }).toArray(function (err, result) {
            if (err) throw err;
            result.forEach((n) => {
                let subGenresList = []
                for (let i in n["genres"]["sub_genres"]) {
                    let subObj = {}
                    subObj[i] = n["genres"]["sub_genres"][i]
                    subGenresList.push(subObj)
                }
                let year = n["year"]
                let genres = { mainGenres: n["genres"]["main_genres"], subGenres: subGenresList }
                data[year] = genres
            })
            res.send(data);
            db.close();
        });
    });
})

billboard.post('/', (req, res) => {
    let data = req.body
    let year = Number(data["year"])
    console.log(year)
    MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        let dbcol = db.db('top100');
        let query = { "year": year }
        dbcol.collection("billboard").find(query, { projection: { _id: 0, year: 1, songs: 1 } }).toArray((err, result) => {
            if (err) throw err;
            res.send(result[0]);
            db.close()
        })
    })
})

module.exports = billboard