google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
    let test = async function () {
        let dList = []
        let res = await fetch("/billboard")
        let myjson = await res.json()
        let slideYear = document.querySelector("#slideYear");

        let x = 0
        for (let i in myjson[1960]) {
            x += myjson[1960][i]
        }
        for (let i in myjson[1960]) {
            let percent = Math.round((myjson[1960][i] / x) * 100)
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
            for (let i in myjson[year]) {
                x += myjson[year][i]
            }
            for (let i in myjson[year]) {
                let percent = Math.round((myjson[year][i] / x) * 100)
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
    test()
}









