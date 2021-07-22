const year = sessionStorage.getItem("year")
const mainGenres = JSON.parse(sessionStorage.getItem("mainGenres"))
const subGenres = JSON.parse(sessionStorage.getItem("subGenres"))
console.log(subGenres)
// 撥歌
// let playSong = (song, artist) => {
//     let embedContainer = document.querySelector("#embed-container")
//     embedContainer.classList.remove("hideiframe")
//     let sessionVideo = sessionStorage.getItem(song)
//     let player = document.querySelector("#embed-container").children[0]
//     let videoId
//     console.log(sessionVideo !== null)
//     // 檢查storage是否點擊過
//     if (sessionVideo !== null) {
//         videoId = sessionVideo
//         // videoId = "UPASPeYYtHs"
//         player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`
//     } else {
//         let playVideo = async function () {
//             try {
//                 let res = await fetch("/ytb", {
//                     method: "POST",
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ "song": song, "artist": artist })
//                 })
//                 let myjson = await res.json()
//                 videoId = myjson["videoId"]
//                 // videoId = "UPASPeYYtHs"
//                 sessionStorage.setItem(song, videoId)
//                 player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`
//             }
//             catch (e) {
//                 console.error("play button fetch error")
//             }
//         }
//         playVideo()
//     }
// }

// subGenres處理
let getsubGenres = (subGenres) => {
    console.log(subGenres)
    let genresBox = document.querySelector("#subGenres")
    let oldGenres = document.querySelectorAll(".subDiv")
    // 清除舊subGenres
    oldGenres.forEach((n) => {
        n.parentElement.removeChild(n)
    })
    // 由多到少,排列該年度sub_genres
    subGenres.sort((a, b) => {
        return Object.values(b) - Object.values(a)
    })
    let subTotal = 0;
    subGenres.forEach(n => {
        let number = Object.values(n)[0]
        subTotal += number
    })
    subGenres.forEach(subGenre => {
        let subTitle = document.createElement("h5")
        subTitle.innerText = Object.keys(subGenre);
        let subPercent = document.createElement("p")
        let number = Object.values(subGenre)[0] / subTotal;
        subPercent.innerText = `${Math.round(number * 1000) / 10}%`
        let subDiv = document.createElement("div")
        subDiv.classList.add("subDiv")
        subDiv.appendChild(subTitle);
        subDiv.appendChild(subPercent);
        genresBox.appendChild(subDiv);
    })
}
getsubGenres(subGenres)

// Hot 100 list 處理
let hotListContainer = document.querySelector("#hot100 .listContainer")
hotListContainer.innerHTML = ""
let getList = async function (year,container) {
    let res = await fetch("/billboard", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: year })
    })
    let myjson = await res.json()
    
    let titleYear = container.parentElement.children[0].children[0].children[0];
    titleYear.innerText = year
    let songs = myjson["songs"];

    (async () => {
        try {
            let res = await fetch("/list/api");
            let jsonList = await res.json();
            console.log(jsonList)
            songs.forEach((song, index) => {
                let itemBox = document.createElement("div")
                itemBox.classList.add("items")
                let rankP = document.createElement("p")
                let songP = document.createElement("p")
                let artistP = document.createElement("p")
                let heartBtn = document.createElement("button")
                let heartImg = document.createElement("img")
                let ytbImg = document.createElement("img")
                let playBtn = document.createElement("button")

                ytbImg.src = "/img/ytb.png";
                heartBtn.classList.add("heartBtn");
                heartImg.src = "/img/heart.svg"
                // 登入時判斷是否已加入清單
                if (Array.isArray(jsonList)) {
                    let checkList = jsonList.some(item => item["song"] === song["song"]);
                    if (checkList === true) {
                        heartImg.src = "/img/fullheart.svg"
                    } else {
                        heartImg.src = "/img/heart.svg"
                    }
                }
                rankP.innerText = `NO.${index + 1}`
                songP.innerText = song["song"]
                artistP.innerText = song["artist"]
                playBtn.appendChild(ytbImg)
                heartBtn.appendChild(heartImg)

                // 收藏list處理 
                heartBtn.addEventListener("click", () => {
                    let makeFavor = async () => {
                        let res = await fetch("/user/api")
                        let myjson = await res.json()
                        // 判斷是否登入
                        if (myjson["status"] === "ok") {
                            heartImg.src = "/img/fullheart.svg"
                            let song = playBtn.parentElement.children[1].innerText
                            let artist = playBtn.parentElement.children[2].innerText
                            console.log(song, artist)

                            let insertFavorDB = async () => {
                                let res = await fetch("/list/api", {
                                    method: "POST",
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ "song": song, "artist": artist })
                                })
                                let myjson = await res.json()
                                // 無重複且存入資料庫回復"ok"
                                if (myjson["status"] === "ok") {
                                    // 產生list item函式
                                    personList(song, artist)
                                }
                            }
                            insertFavorDB()
                        }
                        else {
                            alert("加入會員，建立個人清單")
                        }
                    }
                    makeFavor()
                })

                // Hot100歌曲播放youtube
                playBtn.addEventListener("click", () => {
                    let song = playBtn.parentElement.children[1].innerText
                    let artist = playBtn.parentElement.children[2].innerText
                    playSong(song, artist)
                })

                itemBox.appendChild(rankP)
                itemBox.appendChild(songP)
                itemBox.appendChild(artistP)
                itemBox.appendChild(heartBtn)
                itemBox.appendChild(playBtn)
                hotListContainer.appendChild(itemBox)
            })
        } catch (e) {
            console.log("錯誤: " + e)
        }
    })();
}
getList(year,hotListContainer)

// 關閉YTB畫面
// let closeBtn = document.querySelector("#ytbClose")
// closeBtn.addEventListener("click", () => {
//     let embedContainer = document.querySelector("#embed-container")
//     let player = document.querySelector("#embed-container").children[0]
//     player.src = `https://www.youtube.com/embed/`
//     embedContainer.classList.add("hideiframe")
// })

// function debounce(method, delay) {
//     clearTimeout(method._tId);
//     method._tId = setTimeout(function () {
//         method();
//     }, delay);
// }
// window.addEventListener("scroll", (e) => {
//     debounce(function () {
//         let h = document.documentElement.clientHeight
//         let scroll = document.body.scrollHeight - window.scrollY
//         let embedContainer = document.querySelector("#embed-container")
//         if (scroll - 120 < h) {
//             embedContainer.classList.add("move");
//         }
//         if (scroll - 125 > h) {
//             embedContainer.classList.remove("move");
//         }
//     }, 100);
// })


