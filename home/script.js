
const logCtx = $("#logChart");
let token = localStorage.getItem("token");
let host = localStorage.getItem("host");
const logout = $('.logout-btn');
const getDataBtn = $(".get-data-btn");
const csvExport = $('.csv-btn')
const deviceName= $('.device');
const keyInput = $('.key');
const startTime = $('.startTime');
const stopTime = $('.stopTime');
const interval = $('.interval');
let startTs, stopTs;
let logChart;
let plotData =[];
let csvData = []
const Data = {
    datasets: [{
        label: 'Data key',
        backgroundColor:
            [
                'rgb(11, 142, 11)',

            ],
        borderColor: [
            '#000',

        ],
        data: [],
        borderWidth: 2,
        borderColor: 'rgb(11, 142, 11)'
    },
    ]
};

const logConfig = {
    type: 'line',
    data: Data,

    options: {
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#ccc' }
            },
            x: {
                grid: { color: '#ccc' }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
    }
};
// LOGOUT
logout.click(function(){
    let logOutApi = host.concat("/api/auth/logout");
    postData(logOutApi, {})
    location.href ="../index.html";
})



// DATE PICKER

$(function() {
    // Start time config
    $("#startTs").datetimepicker({
        useCurrent: true,
        showTodayButton: true,
        icons:{
            time: "glyphicon glyphicon-time",
            date:'glyphicon glyphicon-calendar',
        },

        
        collapse: true
    });
    $("#startTs").on("dp.change", function(e){
        startTs = Date.parse(e.date._d);
        
    })
    // Stop time config
    $("#stopTs").datetimepicker({
        useCurrent: false,
        showTodayButton: true,
        icons:{
            time: "glyphicon glyphicon-time",
            date:'glyphicon glyphicon-calendar',
        },
        collapse: true
    });
    $("#stopTs").on("dp.change", function(e){
        stopTs = Date.parse(e.date._d);

    })
    logChart = new Chart(logCtx, logConfig );

})
// GET DATA 
getDataBtn.click(function(){
    let dvcEndpoint = `/api/tenant/devices?deviceName=${deviceName.val()}`;
    let deviceAPI = host.concat(dvcEndpoint);
    let keyValue = keyInput.val();
    let intervalValue = interval.val();
    let entityType, entityId;
    console.log(keyValue)
    plotData = [];
    csvData = [["temperature", "humidity"]];
    getData(deviceAPI)
    .then(data=>{
        if(data.status){
            graphData(plotData)
            alert(data.message)
        }
        else {
            entityType = data.id.entityType;
            entityId = data.id.id;
            console.log("type", entityType, "id", entityId)
            console.log(startTs)
            console.log(stopTs)
            let endPoint = `/api/plugins/telemetry/${entityType}/${entityId}/values/timeseries?keys=${keyValue}&startTs=${startTs}&endTs=${stopTs}&interval=${intervalValue}&limit=50000&agg=AVG&orderBy=ASC&useStrickDataTypes=true`;
            let teleApi = host.concat(endPoint);
            getData(teleApi)
            .then(data =>{
                console.log(data)
                if(data.status ==400){
                    graphData(plotData)
                    alert(data.message)
                }
                else{
                    console.log("Success")
                    let resData = data[keyValue]
                    if(resData){
                        resData.forEach(function(each){
                            let date = new Date(each.ts)
                            let dateTime = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                            let savedData = each.value
                            plotData.push({x: String(dateTime), y: savedData})
                            csvData.push([String(dateTime), savedData])
                        })
                    }
                }
            })
            .then(data=>{
                graphData(plotData);
                
            })
            .catch(error=>{
                alert(error)
                graphData(plotData)
            })
        }
    })
    
})
// CSV export
csvExport.click(function(){
    if(plotData.length > 0){
        console.log(csvData)
        exportToCsv(csvData);
    }
    else {
        alert('Data is not available')
    }
})
// FUNCTIONS
async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(data)
    });
    return response.json()
}
async function getData(url){
    const response = await fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Authorization': 'Bearer ' + token
        }
    });
    return response.json();
}

// Graph data
function graphData(inputData) {
    
    let Data1 = {
        datasets: [{
            label: 'Data key',
            backgroundColor:
                [
                    'rgb(11, 142, 11)',
    
                ],
            borderColor: [
                '#000',
    
            ],
            data: inputData,
            borderWidth: 2,
            borderColor: 'rgb(11, 142, 11)'
        },
        ]
    };
    let logConfig1 = {
        type: 'line',
        data: Data1,
    
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#ccc' }
                },
                x: {
                    grid: { color: '#ccc' }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
        }
    };
    logChart.destroy();
    logChart = new Chart(logCtx, logConfig1 );

}
function exportToCsv(data) {
    var CsvString = "";
    data.forEach(function(RowItem, RowIndex) {
      RowItem.forEach(function(ColItem, ColIndex) {
        CsvString += ColItem + ",";
      });
      CsvString += "\r\n";
    });
    CsvString = "data:application/csv," + encodeURIComponent(CsvString);
    var x = document.createElement("A");
    x.setAttribute("href", CsvString);
    x.setAttribute("download", "dataLog.csv");
    document.body.appendChild(x);
    x.click();
  };