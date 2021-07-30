const genre = sessionStorage.getItem("genre")
let drawSubChart = (genres) => {
    fetch("/billboard")
        .then(res => res.json())
        .then(myjson => {
            let subDataList = []
            for (year in myjson) {
                let data = {}
                data["year"] = year;
                data["genres"] = genres
                data["value"] = myjson[year]['mainGenres'][genres]
                subDataList.push(data)
            }
            // console.log(subDataList)
            let chart = c3.generate({
                data: {
                    json: subDataList,
                    keys: {
                        x: 'year',
                        value: ['value']
                    },
                    type: 'line',
                },
                axis: {
                    x: {
                        type: 'year',
                        label: {
                            text: 'year',
                            position: 'outer-center'
                        }
                    }
                },
                legend: {
                    show: false
                }
            });
        })
        .catch(e => {
            console.log(e)
        })
}
drawSubChart(genre)

let getSubSong = (genres) => {

}

let title = document.querySelector("section h1")
title.textContent = genre;


let subSongContainer = document.querySelector(".playList .listContainer")
let loader =document.querySelector(".loader")
window.addEventListener("load",()=>{
    loader.remove()
})
fetch("/billboard/genre", {
    method: "PATCH",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ genre: genre })
})
    .then(res => res.json())
    .then(myjson => {
        let data = myjson["data"]
        // 隨機陣列排序
        function fisherYatesShuffle(arr){
            for(let i =arr.length-1 ; i>0 ;i--){
                let j = Math.floor( Math.random() * (i + 1) ); //random index
                [arr[i],arr[j]]=[arr[j],arr[i]]; // swap
            }
        }
        fisherYatesShuffle(data)
        let randomData=[]
        for (let i=0;i<data.length;i++){
            if (i>99){
                break
            }
            randomData.push(data[i])
        }
        randomData.forEach(item => {
            let song = item["song"]
            let artist = item["artist"];

            (async () => {
                try {
                    let res = await fetch("/list/api");
                    let jsonList = await res.json();
                    let itemBox = document.createElement("div")
                    itemBox.classList.add("items")
                    
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
                        let checkList = jsonList.some(item => item["song"] === song);
                        if (checkList === true) {
                            heartImg.src = "/img/fullheart.svg"
                        } else {
                            heartImg.src = "/img/heart.svg"
                        }
                    }
                  
                    songP.innerText = song
                    artistP.innerText = artist
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
                                let song = playBtn.parentElement.children[0].innerText
                                let artist = playBtn.parentElement.children[1].innerText
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
                                        personList(song, artist,myListContainer)
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
                        let song = playBtn.parentElement.children[0].innerText
                        let artist = playBtn.parentElement.children[1].innerText
                        playSong(song, artist)
                    })

                    itemBox.appendChild(songP)
                    itemBox.appendChild(artistP)
                    itemBox.appendChild(heartBtn)
                    itemBox.appendChild(playBtn)
                    subSongContainer.appendChild(itemBox)
                } catch (e) {
                    console.log("錯誤: " + e)
                }
            })();



        });
    })
    .catch(e => {
        console.log("somethingWrong" + e)
    })

// 曲風點擊
let typeBtns=document.querySelectorAll(".types .type")
typeBtns.forEach(btn=>{
    btn.addEventListener("click",function(){
        let genre=this.innerText;
        sessionStorage.setItem("genre",genre)
        location.href="/sub"
    })
})

