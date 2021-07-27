const genre=sessionStorage.getItem("genre")
let drawSubChart = (genres) => {
    fetch("/billboard")
        .then(res => res.json())
        .then(myjson => {
            let subDataList = []
            console.log(myjson)
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

let getSubSong=(genres)=>{

}

let title=document.querySelector("section h1")
title.textContent=genre;



let subSongContainer=document.querySelector(".playList .listContainer")
fetch("/billboard/genre",{
    method:"PATCH",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ genre: genre })
})
.then(res=>res.json())
.then(myjson=>{
    console.log(myjson)
    let data=myjson["data"]
    data.forEach(item => {
        let song=item["song"]
        let artist=item["artist"]
        personList(song,artist,subSongContainer)
    });
})
.catch(e=>{
    console.log("somethingWrong"+e)
})

