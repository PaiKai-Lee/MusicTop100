require('dotenv').config()
const express = require('express');
const session = require('express-session')
const path = require('path');
const ejs = require('ejs')
const fetch = require('node-fetch');
const mongodb=require('mongodb')
const userRouter=require("./routes/user")

const MongoClient=mongodb.MongoClient
const app = express();


const host = 'localhost'
const port = 3000;
const API_key=process.env.API_key
let dburl= "mongodb://localhost:27017/";


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

app.use("/user",userRouter)

app.get('/', (req, res) => {
  res.render('index.ejs')
})


app.get('/billboard/',(req,res)=>{
  MongoClient.connect(dburl,{ useNewUrlParser: true, useUnifiedTopology: true },function(err, db) {
    if (err) throw err;
    let data={}
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
  MongoClient.connect(dburl,{ useNewUrlParser: true, useUnifiedTopology: true },function(err,db){
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

app.post("/ytb",(req,res)=>{
  let songInfo=req.body
  let song=songInfo["song"]
  let artist=songInfo["artist"]
  console.log(songInfo);
  fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${song}%20${artist}&type=video&videoEmbeddable=true&key=${API_key}`)
  .then(res=>res.json())
  .then(myjson=>{
    let videoId=(myjson["items"][0]["id"]['videoId'])
    res.send({"videoId":videoId})
  })
  .catch(err=>console.error(err))
})

app.get("/*",(req,res)=>{
  res.redirect("/")
})

app.use((err,req,res,next)=>{
  console.log(err)
  res.status(500).send("Something broken,need to be fixed")
})

app.listen(port, () => {
  console.log(`Server listening at http://${host}:${port}`)
})