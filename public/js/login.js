let loginForm = document.querySelector(".loginForm")
let signupForm = document.querySelector(".signupForm")
let toLogin = signupForm.children[5]
let toSignup = loginForm.children[5]
let loginBtn = loginForm.children[3]
let signupBtn = signupForm.children[4]

function checkLoginState() {
    FB.getLoginStatus(function (response) {
        if (response.status === "connected") {
            console.log("已登入")
            login()
        } else {
            console.log("請登入")
            FB.login(function () {
                login()
            })
        }
    });
}

function login() {
    FB.api('/me',{fields: 'name, email, picture'}, function (response) {
        console.log(response)
        let {id,name,email,picture}=response;
        let photo=picture.data.url;
        fetch("/user/api",{
            method:"PATCH",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "id":id,
                "photo":photo,
                "email": email,
                "user": name,
                "third_party": true
            })
        })
        .then(res => res.json())
        .then(myjson=>{
            if (myjson["status"]==="ok"){
                window.history.go(-1)
            }else{
                alert(myjson["message"])
            }
        })
        .catch(e=>{console.log(e)})
    });
}

// 登入
loginBtn.addEventListener("click", (e) => {
    e.preventDefault()
    let email = loginForm.children[1].value;
    let password = loginForm.children[2].value;
    fetch("/user/api", {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "email": email,
            "password": password,
            "third_party": false
        })
    })
    .then(res => res.json())
    .then((myjson) => {
        if (myjson["status"]==="ok"){
            window.history.go(-1)
        }else{
            alert(myjson["message"])
        }
    })
    .catch(e=>{console.log(e)})
})

// 註冊
signupBtn.addEventListener("click", (e) => {
    e.preventDefault()
    let user = signupForm.children[1].value;
    let email = signupForm.children[2].value;
    let password = signupForm.children[3].value;
    fetch("/user/api", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "user": user,
            "email": email,
            "password": password
        })
    })
    .then(res => res.json())
    .then((myjson) => {
        if (myjson["status"]==="error"){
            alert(myjson["message"])
        }else{
            alert("註冊成功")
            signupForm.children[1].value=""
            signupForm.children[2].value=""
            signupForm.children[3].value=""
        }
    })
    .catch(e=>{console.error(e)})
})

toSignup.addEventListener("click",()=>{
    loginForm.classList.toggle("hide");
    signupForm.classList.toggle("hide");
})
toLogin.addEventListener("click",()=>{
    loginForm.classList.toggle("hide");
    signupForm.classList.toggle("hide");
})

