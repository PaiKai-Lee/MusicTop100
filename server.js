const express = require('express');
const path = require('path');
const ejs = require('ejs')
const bodyParser=require("body-parser")
const mongodb=require('mongodb')
const MongoClient=mongodb.MongoClient
const app = express();
const port = 3000;
let dburl= "mongodb://localhost:27017/";


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/billboard/',(req,res)=>{
  MongoClient.connect(dburl, function(err, db) {
    let data={}
    if (err) throw err;
    let dbcol = db.db("top100");
    dbcol.collection("billboard").find({},{projection:{_id:0,year:1,genres:1}}).toArray(function(err, result) {
      if (err) throw err;
      result.forEach((n)=>{
        let subGenresList=[]
        for (let i in n["genres"]["sub_genres"]) {  
          let subObj={}
          subObj[i]=n["genres"]["sub_genres"][i]
          subGenresList.push(subObj)
        }
        let year=n["year"]
        let genres={mainGenres:n["genres"]["main_genres"],subGenres:subGenresList}
        data[year]=genres
      })
      res.send(data);
      db.close();
    });
  }); 
})

app.post('/billboard',(req,res)=>{
  let data=req.body
  let year=Number(data["year"])
  console.log(year)
  MongoClient.connect(dburl,function(err,db){
    if (err) throw err;
    let dbcol=db.db('top100');
    let query={"year":year}
    dbcol.collection("billboard").find(query,{projection:{_id:0,year:1,songs:1}}).toArray((err,result)=>{
      if(err) throw err;
      res.send(result[0]);
      db.close()
    })
  })
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})