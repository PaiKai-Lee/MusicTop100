require('dotenv').config()
const express = require('express');
const path = require('path');
const ejs = require('ejs')
const fetch = require('node-fetch');
const fs=require("fs")
const userRouter=require("./routes/user")
const listRouter=require("./routes/myList")
const billboardRouter=require("./routes/billboard")
const ytRouter=require("./routes/yt")
const session = require('express-session')

const app = express();


const host = 'localhost'
const port = 3000;
const SECRET_KEY=process.env.SECRET_KEY


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
app.use("/yt",ytRouter)

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