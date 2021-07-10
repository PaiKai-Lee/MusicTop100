google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

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
        let titleYear = make100.parentElement.children[0].children[0]
        let hotListContainer = make100.parentElement.parentElement.children[1]

        titleYear.innerText = year
        let songs = myjson["songs"]
        songs.forEach((song, index) => {
            let itemBox = document.createElement("div")
            itemBox.classList.add("items")
            let rankP = document.createElement("p")
            let songP = document.createElement("p")
            let artistP = document.createElement("p")
            let checkInput = document.createElement("input")
            checkInput.type = "checkbox"
            let playBtn = document.createElement("button")
            rankP.innerText = `NO.${index + 1}`
            songP.innerText = song["song"]
            artistP.innerText = song["artist"]
            playBtn.innerText = "BTN"

            // 歌曲播放youtube
            playBtn.addEventListener("click", () => {
                let song = playBtn.parentElement.children[1].innerText
                let artist = playBtn.parentElement.children[2].innerText
                let sessionVideo = sessionStorage.getItem(song)
                let player=document.querySelector("#player").children[0]
                let videoId
                console.log(sessionVideo!== null)

                // 檢查storage是否點擊過
                if (sessionVideo !== null) {
                    videoId = sessionVideo
                    player.src=`https://www.youtube.com/embed/${videoId}`
                    console.log(videoId)
                } else {
                    let playVideo = async function () {
                        let res = await fetch("/ytb", {
                            method: "POST",
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ "song": song, "artist": artist })
                        })
                        let myjson = await res.json()
                        videoId = myjson["videoId"]
                        sessionStorage.setItem(song, videoId)
                        player.src=`https://www.youtube.com/embed/${videoId}`
                        console.log(videoId)
                    }
                    playVideo()
                }
                
            })

            itemBox.appendChild(rankP)
            itemBox.appendChild(songP)
            itemBox.appendChild(artistP)
            itemBox.appendChild(checkInput)
            itemBox.appendChild(playBtn)
            hotListContainer.appendChild(itemBox)
        })

    }
    getList(year)
})









