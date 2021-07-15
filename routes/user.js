const express = require("express")
const member= express.Router()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const session = require('express-session')
const { createHash } = require('crypto');
let dburl = "mongodb://localhost:27017/";

// router.get("/login", (req, res) => {
//     res.render("login.ejs")
// })

member.use(session({
    // 測試後須隱藏重設
    secret: 'recommand 128 bytes random string',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1*24*3600*1000} //10天到期
  }));

// 取得會員狀態
member.get("/api",(req,res)=>{
    if (req.session.valid!=undefined && req.session.valid==true){
        res.status(200).send({"status":"ok"})
    }
    else{
        res.status(200).send({"status":"error"})
    }
})

// 會員登入
member.patch("/api", (req, res) => {
    
    let data = req.body
    let email = data["email"]
    let password = data["password"]
    
    MongoClient.connect(dburl,{ useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        let dbcol = db.db("top100")
        let query = { "email": email };
        dbcol.collection("user").findOne(query, (err, result) => {
            if (err) throw err;
            db.close()
            if (result == null){
                res.send({"status":"error","message": "帳號或密碼錯誤"})
                return 
            }
            let salt = result["salt"]
            let dbPass = result["password"]
            const hash = createHash('sha256')
            hash.update(salt + password);
            password = hash.digest('hex');
            if (password == dbPass) {
                // 設定session //
                req.session.valid=true;
                req.session.user=email;
                res.send({
                    "status":"ok"
                })
            }else{
                res.send({"status":"error","message": "帳號或密碼錯誤"})
            }

        })
    });
})

// 會員註冊
member.post("/api", (req, res) => {
    let data = req.body
    let user = data["user"]
    let email = data["email"]
    let password = data["password"]
    let salt = Date.now()

    MongoClient.connect(dburl,{ useNewUrlParser: true, useUnifiedTopology: true },function (err, db) {
        if (err) { throw err };
        let dbcol = db.db("top100")
        dbcol.collection("user").findOne({ "email": email }, (err, result) => {
            if (err) throw err;
            if (result != null) {
                console.log(result)
                res.status(400).send({ "status": "error","message": "此Emai已註冊" })
            } else {
                const hash = createHash('sha256')
                password = hash.update(salt + password).digest('hex');
                let obj = { "user": user, "email": email, "password": password, "salt": salt, "date": new Date() };
                dbcol.collection("user").insertOne(obj, (err, result) => {
                    if (err) throw err;
                    console.log("Data has been saved")
                    db.close()
                })
                res.status(200).send({ "status": "ok" })
            }
        })
    });
})

// 登出會員
member.delete("/api",(req,res)=>{
    req.session.destroy();
    return res.send({
        "status":"ok"
    });
})


module.exports = member;