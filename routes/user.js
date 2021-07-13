const express = require("express")
const router = express.Router()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const { createHash } = require('crypto');
const hash = createHash('sha256')
let dburl = "mongodb://localhost:27017/";

router.get("/login", (req, res) => {
    res.render("login.ejs")
})

// 會員登入
router.patch("/api", (req, res) => {
    let data = req.body
    let email = data["email"]
    let password = data["password"]
    MongoClient.connect(dburl, function (err, db) {
        if (err) throw err;
        let dbcol = db.db("top100")
        let query = { "email": email };
        dbcol.collection("user").findOne(query, (err, result) => {
            if (err) throw err;
            db.close()
            let salt=result["salt"]
            let dbPass=result["password"]
            hash.update(salt + password);
            password = hash.digest('hex');
            if (password==dbPass){
                // 設定session //
                res.send({
                    "status":"ok"
                })
            }
            
        })
    });
})

// 會員註冊
router.post("/api", (req, res) => {
    let data = req.body
    let user = data["user"]
    let email = data["email"]
    let password = data["password"]
    // email比對 //
    let salt = Date.now()
    hash.update(salt + password);
    password = hash.digest('hex');
    MongoClient.connect(dburl, function (err, db) {
        if (err) { throw err };
        let dbcol = db.db("top100")
        let obj = { "user": user, "email": email, "password": password, "salt": salt, "date": new Date() };
        dbcol.collection("user").insertOne(obj, (err, result) => {
            if (err) throw err;
            console.log("Data has been saved")
            db.close()
        })
    });
    res.send({ "message": "ok" })
})


module.exports = router;