const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const logCtx = $("#logChart");
let token = localStorage.getItem("token");
let host = "https://ac20-2402-800-6205-8bdb-c4e5-ddf8-1c4d-11ef.ap.ngrok.io:443/";
const logout = $('.logout-btn');
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
        data: [{ x: '2016-12-25', y: 20 }, { x: '2016-12-26', y: 15 }, { x: '2016-12-27', y: 30 }, { x: '2016-12-28', y: 28 }, { x: '2016-12-29', y: 35 }],
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
logout.onclick = function(){
    location.href ="../login/index.html";
}
const logChart = new Chart(logCtx, logConfig );
async function getData(url, data) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer' + token
        },
        body: JSON.stringify(data)
    });
    return response.json()
}