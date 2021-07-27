require('dotenv').config()
const express = require('express');
const path = require('path');
const ejs = require('ejs')
const fetch = require('node-fetch');
const fs=require("fs")
const mongodb=require('mongodb')
const userRouter=require("./routes/user")
const listRouter=require("./routes/myList")
const billboardRouter=require("./routes/billboard")
const session = require('express-session')

const MongoClient=mongodb.MongoClient
const app = express();


const host = 'localhost'
const port = 3000;
const API_key=process.env.API_key
const SECRET_KEY=process.env.SECRET_KEY
let dburl= "mongodb://localhost:27017/";

app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1*24*3600*1000} //10天到期
}));


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/user",userRouter)
app.use("/list",listRouter)
app.use("/billboard",billboardRouter)

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get("/main",(req,res)=>{
  res.render("main.ejs")
})

app.get("/sub/",(req,res)=>{
  res.render("sub.ejs")
})

app.get("/user/login", (req, res) => {
  res.render("login.ejs")
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