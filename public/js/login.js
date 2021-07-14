let loginForm = document.querySelector(".loginForm")
let signupForm = document.querySelector(".signupForm")
let toLogin = signupForm.children[5]
let toSignup = loginForm.children[5]
let loginBtn = loginForm.children[3]
let signupBtn = signupForm.children[4]

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
            "password": password
        })
    })
    .then(res => res.json())
    .then((myjson) => {
        if (myjson["status"]==="ok"){
            window.location.assign("/")
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
        console.log(myjson)
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

