const listBtn=document.querySelector(".listBtn")
const myPlayList=document.querySelector("#myPlayList")
const listWrap=document.querySelector("#listWrap")
let address=new URL(location.href)
if (address.pathname=="/"){
    document.querySelector(".yearBar").classList.add("hideiframe")
}
let myListContainer = document.querySelector("#myPlayList")
// 產生個人清單
let personList = (song, artist,myListContainer) => {
    // let myListContainer = document.querySelector("#myPlayList")
    let mySongP = document.createElement("p")
    let myArtistP = document.createElement("p")
    let myItemBox = document.createElement("div")
    let myHeartBtn = document.createElement("button")
    let myHeartImg = document.createElement("img")
    let myYtbImg = document.createElement("img")
    let myPlayBtn = document.createElement("button")
    myPlayBtn.appendChild(myYtbImg)
    myYtbImg.src = "/img/ytb.png"
    myHeartImg.src = "/img/fullheart.svg"
    myItemBox.classList.add("items")
    mySongP.innerText = song;
    myArtistP.innerText = artist;

    myPlayBtn.addEventListener("click", () => {
        let song = myPlayBtn.parentElement.children[0].innerText
        let artist = myPlayBtn.parentElement.children[1].innerText
        playSong(song, artist)
    })


    myHeartBtn.addEventListener("click", () => {
        let song = myHeartBtn.parentElement.children[0].innerText;
        (async () => {
            let res = await fetch('/list/api', {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "song": song })
            })
            let myjson = await res.json()
            if (myjson["status"] === "ok") {
                myItemBox.remove()
            }
        })();
    })



    myHeartBtn.appendChild(myHeartImg);
    myItemBox.appendChild(mySongP);
    myItemBox.appendChild(myArtistP);
    myItemBox.appendChild(myHeartBtn);
    myItemBox.appendChild(myPlayBtn)
    myListContainer.appendChild(myItemBox)
}

//進網頁驗證 
const nav = document.querySelector("nav")
let valid = async () => {
    let res = await fetch("/user/api")
    let myjson = await res.json()
    let login = nav.children[2]
    let logout = nav.children[3]
    console.log(myjson["status"])
    if (myjson["status"] === "ok") {
        login.style.display = "none";
        logout.style.display = "inline-block";
        listWrap.classList.remove("hideiframe")
        // 顯示個人清單....
        let res = await fetch("/list/api")
        let myjson = await res.json()
        myjson.forEach(item => {
            let song = item["song"];
            let artist = item["artist"]
            personList(song, artist,myListContainer)
        })
    }
    else {
        login.style.display = "inline-block";
        logout.style.display = "none";
        listWrap.classList.add("hideiframe")
        console.log("Not Login")
    }
}
valid()

// 登出
let logout = nav.children[3]
logout.addEventListener("click", () => {
    (async () => {
        await fetch("/user/api", { method: "DELETE" })
        location.reload()
    })();
})

listBtn.addEventListener("click",function(){
    myPlayList.classList.toggle("myListHide")
    listWrap.classList.toggle("myListHide")
})

const menu=document.querySelector("header .menu")
menu.addEventListener("click",()=>{
    nav.classList.toggle("show")
})

// 撥歌
let playSong = (song, artist) => {
    let embedContainer = document.querySelector("#embed-container")
    embedContainer.classList.remove("hideiframe")
    let sessionVideo = sessionStorage.getItem(song)
    let player = document.querySelector("#embed-container").children[0]
    let videoId
    console.log(sessionVideo !== null)
    // 檢查storage是否點擊過
    if (sessionVideo !== null) {
        videoId = sessionVideo
        // videoId = "UPASPeYYtHs"
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`
    } else {
        let playVideo = async function () {
            try {
                let res = await fetch("/ytb", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "song": song, "artist": artist })
                })
                let myjson = await res.json()
                videoId = myjson["videoId"]
                // videoId = "UPASPeYYtHs"
                sessionStorage.setItem(song, videoId)
                player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`
            }
            catch (e) {
                console.error("play button fetch error")
            }
        }
        playVideo()
    }
}


// nav bar 搜尋
function getData(year){
   fetch("/billboard")
   .then(res=>res.json())
   .then(data=>{
    let mainGenres=data[year]['mainGenres'];
    let subGenres=data[year]['subGenres'];
    mainGenres=JSON.stringify(mainGenres)   
    subGenres=JSON.stringify(subGenres);
    sessionStorage.setItem("year",year);
    sessionStorage.setItem("mainGenres",mainGenres);
    sessionStorage.setItem("subGenres",subGenres);
    location.href="/main"
   })
}

const searchBtn = document.querySelector("nav div button")
const navInput = document.querySelector("nav input")
searchBtn.addEventListener("click",()=>{
    const year = navInput.value
    if (year===""){
        alert("選擇年分")
    }
    getData(year)
})
    navInput.addEventListener("keydown",function(e){
    if (e.which == 13) {
        const year = this.value
        if (year===""){
            alert("選擇年分")
        }
        getData(year)
    }
})

// 關閉YTB畫面
let closeBtn = document.querySelector("#ytbClose")
closeBtn.addEventListener("click", () => {
    let embedContainer = document.querySelector("#embed-container")
    let player = document.querySelector("#embed-container").children[0]
    player.src = `https://www.youtube.com/embed/`
    embedContainer.classList.add("hideiframe")
})

function debounce(method, delay) {
    clearTimeout(method._tId);
    method._tId = setTimeout(function () {
        method();
    }, delay);
}
window.addEventListener("scroll", (e) => {
    debounce(function () {
        let h = document.documentElement.clientHeight
        let scroll = document.body.scrollHeight - window.scrollY
        let embedContainer = document.querySelector("#embed-container")
        if (scroll - 120 < h) {
            embedContainer.classList.add("move");
        }
        if (scroll - 125 > h) {
            embedContainer.classList.remove("move");
        }
    }, 100);
})