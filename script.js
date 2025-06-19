const channelId = '2993001';
const readApiKey = 'AD2VIFIDGRAD1RI6';
const results = 10;

let tempChart, humChart, humoChart;

function initializeCharts() {
    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    const ctxHum = document.getElementById('humChart').getContext('2d');
    const ctxHumo = document.getElementById('humoChart').getContext('2d');

    tempChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatura (°C)',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: '°C' } },
                x: { title: { display: true, text: 'Hora' } }
            }
        }
    });

    humChart = new Chart(ctxHum, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humedad (%)',
                data: [],
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: '%' } },
                x: { title: { display: true, text: 'Hora' } }
            }
        }
    });

    humoChart = new Chart(ctxHumo, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humo',
                data: [],
                borderColor: '#c0392b',
                backgroundColor: 'rgba(192, 57, 43, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: 'Nivel' } },
                x: { title: { display: true, text: 'Hora' } }
            }
        }
    });
}

function updateData() {
    fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=${results}`)
        .then(response => response.json())
        .then(data => {
            const feeds = data.feeds;
            if (feeds.length > 0) {
                const latest = feeds[feeds.length - 1];
                document.getElementById('temp').innerText = parseFloat(latest.field1).toFixed(2);
                document.getElementById('hum').innerText = parseFloat(latest.field2).toFixed(2);
                document.getElementById('humo').innerText = parseFloat(latest.field3).toFixed(2);

                const humo = parseFloat(latest.field3);
                const temp = parseFloat(latest.field1);
                const hum = parseFloat(latest.field2);
                let estado = 'Desconocido';
                let estadoClass = 'desconocido';
                if (humo < 150 && temp >= 22 && temp <= 28 && hum >= 40 && hum <= 70) {
                    estado = 'Bueno';
                    estadoClass = 'bueno';
                } else if (humo >= 150 && humo < 250 && temp >= 20 && temp <= 30 && hum >= 30 && hum <= 80) {
                    estado = 'Moderado';
                    estadoClass = 'moderado';
                } else {
                    estado = 'Malo';
                    estadoClass = 'malo';
                }
                const estadoSpan = document.getElementById('estado');
                estadoSpan.innerText = estado;
                estadoSpan.className = estadoClass;

                const labels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
                const temps = feeds.map(feed => parseFloat(feed.field1));
                const hums = feeds.map(feed => parseFloat(feed.field2));
                const humos = feeds.map(feed => parseFloat(feed.field3));

                tempChart.data.labels = labels;
                tempChart.data.datasets[0].data = temps;
                tempChart.update();

                humChart.data.labels = labels;
                humChart.data.datasets[0].data = hums;
                humChart.update();

                humoChart.data.labels = labels;
                humoChart.data.datasets[0].data = humos;
                humoChart.update();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const estadoSpan = document.getElementById('estado');
            estadoSpan.innerText = 'Error';
            estadoSpan.className = 'desconocido';
        });
}

window.onload = () => {
    initializeCharts();
    updateData();
    setInterval(updateData, 15000);
};