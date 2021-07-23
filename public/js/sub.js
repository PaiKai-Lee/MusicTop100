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
drawSubChart("Rock")