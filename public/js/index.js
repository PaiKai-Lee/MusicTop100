google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);
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
        // Instantiate and draw our chart, passing in some options.
        chart.draw(data, options);
        slideYear.addEventListener("input", () => {
            dList = []
            let year = slideYear.value
            let x = 0
            for (let i in myjson[year]["mainGenres"]) {
                x += myjson[year]["mainGenres"][i]
            }
            for (let i in myjson[year]["mainGenres"]) {
                let percent = Math.round((myjson[year]["mainGenres"][i] / x) * 100)
                dList.push([i, percent, i])
            }
            console.log(dList)
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
let t2 = async function () {
    let res = await fetch("/billboard")
    let myjson = await res.json()
    let subGenres = myjson["1983"]["subGenres"]
    let genresBox = document.querySelector("#subGenres")
    subGenres.sort((a, b) => {
        return Object.values(b) - Object.values(a)
    })
    let subTotal = 0;
    subGenres.forEach(n => {
        let number = Object.values(n)[0]
        subTotal += number
    })
    console.log(subTotal)

    subGenres.forEach(subGenre => {
    
        let subTitle = document.createElement("h5")
        subTitle.innerText = Object.keys(subGenre);
        let subPercent = document.createElement("p")
        let number=Object.values(subGenre)[0]/subTotal;
        subPercent.innerText = `${Math.round(number*1000)/10}%`
        let subDiv = document.createElement("div")
        subDiv.classList.add("subDiv")
        subDiv.appendChild(subTitle);
        subDiv.appendChild(subPercent);
        genresBox.appendChild(subDiv);

    })
}
t2()










