const express = require("express");
const billboard = express.Router()
const mongodb = require('mongodb')
const fs =require("fs")
const MongoClient = mongodb.MongoClient
let dburl = "mongodb://localhost:27017/";

billboard.get("/", (req, res) => {
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

billboard.patch("/genre", (req, res) => {
    let data = req.body
    let genre = data["genre"]
    if (genre==="Hip-hop/Rap"){
        genre="Hip-hop and Rap"
    }
    if (genre==="Folk/Acoustic"){
        genre="Folk / Acoustic"
    }
    if (genre==="Dance/EDM"){
        genre="Dance / EDM"
    }
    if (genre==="World/Traditional Folk"){
        genre="World / Traditional Folk"
    }
    
    let getGenres = fs.promises.readFile('./genres.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        return data
    })

    let songGenres = new Promise(function (resolve, rejects) {
        MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            if (err) { throw err };
            let dbcol = db.db("top100")
            dbcol.collection("billboard").find().project({ _id: 0, year: 1, songs: 1 }).toArray((err, result) => {
                if (err) {
                    rejects(err)
                }
                resolve(result)
                db.close()
            })
        });
    })

    Promise.all([getGenres, songGenres]).then(result => {
        let allGenres = result[0]
        let songs = result[1]
        allGenres = JSON.parse(allGenres)
        let mainGenre = allGenres[genre]
        let genreSongs = []
        songs.forEach(song => {
            yearSong = song["songs"]
            yearSong.forEach(eachSong => {
                let ans = eachSong["genres"].some(item => mainGenre.includes(item))
                if (ans === true) {
                    genreSongs.push(eachSong)
                }
            })
        })
        res.send({data:genreSongs})
    })
})

module.exports = billboard