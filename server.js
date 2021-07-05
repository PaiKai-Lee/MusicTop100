const express = require('express');
const path = require('path');
const ejs = require('ejs')
const mongodb=require('mongodb')
const MongoClient=mongodb.MongoClient
const app = express();
const port = 3000;
let dburl= "mongodb://localhost:27017/";

app.set('view engine', 'ejs');
app.use(express.static("public"))

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/billboard/',(req,res)=>{
  MongoClient.connect(dburl, function(err, db) {
    let data={}
    if (err) throw err;
    let dbo = db.db("top100");
    dbo.collection("billboard").find({},{projection:{_id:0,year:1,genres:1}}).toArray(function(err, result) {
      if (err) throw err;
      result.forEach((n)=>{
        let year=n["year"]
        let mainGenres=n["genres"]["main_genres"]
        data[year]=mainGenres
      })
      res.send(data);
      db.close();
    });
  }); 
})

app.get('/data',(req,res)=>{
  MongoClient.connect(dburl, function(err, db) {
    if (err) throw err;
    let dbo = db.db("top100");
    dbo.collection("billboard").find().toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });
  }); 
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})