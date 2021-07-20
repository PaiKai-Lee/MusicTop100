google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

// 撥歌
let playSong = (song, artist) => {
    let embedContainer=document.querySelector("#embed-container")
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
// 產生個人清單
let personList = (song, artist) => {
    let myListContainer = document.querySelector("#myList").children[1]
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


    myHeartBtn.addEventListener("click",()=>{
        let song = myHeartBtn.parentElement.children[0].innerText;
        (async()=>{
            let res = await fetch('/list/api',{
                method:"DELETE",
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify({"song":song})
            })
            let myjson=await res.json()
            if (myjson["status"]==="ok"){
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
    let login = nav.children[1]
    let logout = nav.children[2]
    console.log(myjson["status"])
    if (myjson["status"] === "ok") {
        login.style.display = "none";
        logout.style.display = "inline-block";
        // 顯示個人清單....
        let res = await fetch("/list/api")
        let myjson = await res.json()
        myjson.forEach(item => {
            let song = item["song"];
            let artist = item["artist"]
            personList(song, artist)
        })
    }
    else {
        login.style.display = "inline-block";
        logout.style.display = "none";
        console.log("bad")
    }
}
valid()

let logout = nav.children[2]
logout.addEventListener("click", () => {
    (async () => {
        await fetch("/user/api", { method: "DELETE" })
        location.reload()
    })();
})

// subGenres處理
let getsubGenres = (myjson, year = 1960) => {
    let subGenres = myjson[year]["subGenres"]
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

// barchart 處理
function drawChart() {
    let loadData = async function () {
        let dList = []
        let res = await fetch("/billboard")
        let myjson = await res.json()
        let slideYear = document.querySelector("#slideYear");

        let x = 0
        for (let i in myjson[1960]["mainGenres"]) {
            x += myjson[1960]["mainGenres"][i]
        }
        for (let i in myjson[1960]["mainGenres"]) {
            let percent = Math.round((myjson[1960]["mainGenres"][i] / x) * 100)
            dList.push([i, percent, i])
        }
        getsubGenres(myjson)
        console.log(x)
        let chart = new google.visualization.BarChart(document.getElementById('BarChart'));
        let data = new google.visualization.DataTable();
        data.addColumn('string', 'Genres');
        data.addColumn('number', 'percent');
        data.addColumn({ type: 'string', role: 'annotation' })
        data.addRows(dList);

        // Set chart options
        let options = {
            title: `1960 Billboard Hot 100`,
            titleTextStyle: {
                fontSize: 30
            },
            legend: { position: 'none' },
            chartArea: { height: '75%' },
            hAxis: {
                title: 'percent',
                format: '#\'%\'',
                minValue: 0,
                maxValue: 50,
                gridlines: { minSpacing: 100 }
            }
        };
        chart.draw(data, options);

        //滑動slide產生變化 
        slideYear.addEventListener("input", (year = 1960) => {
            dList = []
            year = slideYear.value
            let x = 0
            for (let i in myjson[year]["mainGenres"]) {
                x += myjson[year]["mainGenres"][i]
            }
            for (let i in myjson[year]["mainGenres"]) {
                let percent = Math.round((myjson[year]["mainGenres"][i] / x) * 100)
                dList.push([i, percent, i])
            }
            getsubGenres(myjson, year)
            // console.log(dList)
            let data = new google.visualization.DataTable();
            data.addColumn('string', 'Genres');
            data.addColumn('number', 'percent');
            data.addColumn({ type: 'string', role: 'annotation' })
            data.addRows(dList);

            // Set chart options
            let options = {
                title: `${year} Billboard Hot 100`,
                titleTextStyle: {
                    fontSize: 30
                },
                legend: { position: 'none' },
                chartArea: { height: '75%' },
                hAxis: {
                    title: 'percent',
                    format: '#\'%\'',
                    minValue: 0,
                    maxValue: 50,
                    gridlines: { minSpacing: 100 }
                }
            };
            // Instantiate and draw our chart, passing in some options.
            let chart = new google.visualization.BarChart(document.getElementById('BarChart'));
            chart.draw(data, options);
        })
    }
    loadData()
}

// Hot 100 list 處理
let make100 = document.querySelector("#make100")
make100.addEventListener("click", () => {
    let year = document.querySelector("#slideYear").value
    let hotListContainer = make100.parentElement.parentElement.children[1]
    hotListContainer.innerHTML = ""
    let getList = async function (year) {
        let res = await fetch("/billboard", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year: year })
        })
        let myjson = await res.json()
        let titleYear = make100.parentElement.children[0].children[0];
        let hotListContainer = make100.parentElement.parentElement.children[1];
        titleYear.innerText = year
        let songs = myjson["songs"];

        (async () => {
            try{
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
                    if (Array.isArray(jsonList)){
                        let checkList = jsonList.some(item=>item["song"] === song["song"]);
                        if (checkList===true){
                            heartImg.src = "/img/fullheart.svg"
                        }else{
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
            }catch(e){
                console.log("錯誤: "+e)
            }
        })();
    }
    getList(year)
})

let closeBtn=document.querySelector("#ytbClose")
closeBtn.addEventListener("click",()=>{
    let embedContainer=document.querySelector("#embed-container")
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
        let embedContainer=document.querySelector("#embed-container")
        if (scroll - 120 < h) {
            embedContainer.classList.add("move");
        }
        if (scroll - 125 > h) {
            embedContainer.classList.remove("move");
        }
    }, 100);
})


