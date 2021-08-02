const indexColors = ['#1abc9c', '#3498db', '#f1c40f', '#636e72', '#27ae60', '#fd79a8', '#e17055', '#c5b0d5', '#8c564b','#2d3436','#F8EFBA','#4bcffa','#f53b57','#808e9b','#27ae60']
const yearH1 = document.querySelector("section h1")
fetch("/billboard",)
    .then(res=>res.json())
    .then(myjson=>{
        let genresList=[]
        for ( genreKey in  myjson["1960"]["mainGenres"]){
            let data = {genres:genreKey,value: myjson["1960"]["mainGenres"][genreKey]}
            genresList.push(data)
        }
        // c3繪圖
        let chart = c3.generate({
            data: {
                json: genresList,
                keys: {
                    x: "genres",
                    value: ["value"]
                },
                type: 'bar',
                color: function (color, d) {
                    return indexColors[d.x];
                },
            },
            legend:{
                show:false
            },
            bar: {
                space: 2
            },
            axis: {
                rotated: true,
                x: {
                    type: 'category'
                },
            },
            transition: {
                duration: 500
            },
        });

        let yearCount= Object.keys(myjson).length
        let count=0
        let yearList = Object.keys(myjson)
        // 年代bar動畫
        setInterval(()=>{
            let genresList=[]
            year=yearList[count]
            yearH1.innerText=year;
            let genresObj=myjson[year]["mainGenres"]
            for ( genreKey in genresObj){
                let data = {genres:genreKey,value:genresObj[genreKey]}
                genresList.push(data)
            }
            chart.load({
                json: genresList,
                keys: {
                    x: "genres",
                    value: ["value"]
                },
            });
            count++
            if (count>=yearCount){
                count=0;
            }
        },1000);
        return myjson
    })
    .then(data=>{
        const backToBtn = document.querySelector(".backToBtn")
        const yearInput = document.querySelector(".backTo input")
        backToBtn.addEventListener("click",()=>{
            const year = yearInput.value
            if (year===""){
                alert("請輸入年分")
            }
            let mainGenres=data[year]['mainGenres'];
            let subGenres=data[year]['subGenres'];
            mainGenres=JSON.stringify(mainGenres)   
            subGenres=JSON.stringify(subGenres);
            sessionStorage.setItem("year",year);
            sessionStorage.setItem("mainGenres",mainGenres);
            sessionStorage.setItem("subGenres",subGenres);
            location.href="/main"
        })
        yearInput.addEventListener("keydown",function(e){
            if (e.which == 13) {
                const year = this.value
                if (year===""){
                    alert("選擇年分")
                }
                let mainGenres=data[year]['mainGenres'];
                let subGenres=data[year]['subGenres'];
                mainGenres=JSON.stringify(mainGenres)   
                subGenres=JSON.stringify(subGenres);
                sessionStorage.setItem("year",year);
                sessionStorage.setItem("mainGenres",mainGenres);
                sessionStorage.setItem("subGenres",subGenres);
                location.href="/main"
            }
        })  
    })
    .catch(e=>{
        console.log(e)
    })

// 選擇年份傳出
// 由sessionStorage
// 增加年份次數後端

