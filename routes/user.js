const express = require("express")
const member = express.Router()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const { createHash } = require('crypto');
let dburl = "mongodb://localhost:27017/";

// 取得會員狀態
member.get("/api", (req, res) => {
    if (req.session.valid != undefined && req.session.valid == true) {
        res.status(200).send({ "status": "ok" })
    }
    else {
        res.status(200).send({ "status": "error" })
    }
})

// 會員登入
member.patch("/api", (req, res) => {

    let data = req.body
    let email = data["email"]
    let password = data["password"]

    MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        let dbcol = db.db("top100")
        let query = { "email": email };
        dbcol.collection("user").findOne(query, (err, result) => {
            if (err) throw err;
            db.close()
            if (result == null) {
                res.send({ "status": "error", "message": "帳號或密碼錯誤" })
                return
            }
            let salt = result["salt"]
            let dbPass = result["password"]
            const hash = createHash('sha256')
            hash.update(salt + password);
            password = hash.digest('hex');
            if (password == dbPass) {
                // 設定session //
                req.session.valid = true;
                req.session.user = email;
                res.send({
                    "status": "ok"
                })
            } else {
                res.send({ "status": "error", "message": "帳號或密碼錯誤" })
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

    if (user===''){
        return res.status(400).send({ "status": "error", "message": "請輸入使用者名稱"})
    }
    const emailRule=/^([\w\.\-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
    if(!emailRule.test(email)){
        return res.status(400).send({ "status": "error", "message": "請輸入正確的Email"})
    }
    const passwordRule=/[\w\.\-\!\@\*]{6,30}/
    if (!passwordRule.test(password)){
        return res.status(400).send({ "status": "error", "message": "密碼長度需大於6位數"})
    }
    MongoClient.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, async (err, db) => {
        if (err) { throw err };

        try{
            let dbcol = db.db("top100")
            let result = await dbcol.collection("user").findOne({ "email": email })
            if (result != null) {
                console.log(result)
                res.status(400).send({ "status": "error", "message": "此Emai已被註冊" })
            } else {
                const hash = createHash('sha256')
                password = hash.update(salt + password).digest('hex');
                let obj = { "user": user, "email": email, "password": password, "salt": salt, "date": new Date() };
                let result =await dbcol.collection("user").insertOne(obj)
                console.log("Data has been saved")
                console.log(result["result"])
                res.status(200).send({ "status": "ok" })
            }
        }catch(e){
            console.log(`Signup Error:${e}`)
        }finally{
            db.close() 
        }
    });
})

// 登出會員
member.delete("/api", (req, res) => {
    req.session.destroy();
    return res.send({
        "status": "ok"
    });
})


module.exports = member;