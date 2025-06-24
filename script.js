const channelId = '2993001';
const readApiKey = 'QKA7CTLL8KP27QBU';
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
            plugins: {
                legend: { display: true },
                tooltip: { enabled: true }
            },
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
            plugins: {
                legend: { display: true },
                tooltip: { enabled: true }
            },
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
            plugins: {
                legend: { display: true },
                tooltip: { enabled: true }
            },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: 'Nivel' } },
                x: { title: { display: true, text: 'Hora' } }
            }
        }
    });
}

function closeAlert() {
    document.getElementById('alert').classList.add('hidden');
}

function updateData() {
    fetch(`https://api.thingspeak.com/channels/2993001/feeds.json?api_key=QKA7CTLL8KP27QBU&results=10`)
        .then(response => response.json())
        .then(data => {
            const feeds = data.feeds;
            if (feeds.length > 0) {
                const latest = feeds[feeds.length - 1] || {};

                const temperatura = parseFloat(latest.field1) || 0;
                const humedad = parseFloat(latest.field2) || 0;
                const humo = parseFloat(latest.field3) || 0;

                document.getElementById('temp').innerText = temperatura.toFixed(2);
                document.getElementById('hum').innerText = humedad.toFixed(2);
                document.getElementById('humo').innerText = humo.toFixed(2);

                let estado = 'Desconocido';
                let estadoClass = 'desconocido';

                if (humo < 150 && temperatura >= 22 && temperatura <= 28 && humedad >= 40 && humedad <= 70) {
                    estado = 'Bueno';
                    estadoClass = 'bueno';
                } else if (humo >= 150 && humo < 250 && temperatura >= 20 && temperatura <= 30 && humedad >= 30 && humedad <= 80) {
                    estado = 'Moderado';
                    estadoClass = 'moderado';
                } else {
                    estado = 'Malo';
                    estadoClass = 'malo';
                }

                const estadoSpan = document.getElementById('estado');
                estadoSpan.innerText = estado;
                estadoSpan.className = estadoClass;

                if (estado === 'Malo') {
                    document.getElementById('alert').classList.remove('hidden');
                } else {
                    document.getElementById('alert').classList.add('hidden');
                }

                document.getElementById('last-update').innerText = new Date(latest.created_at).toLocaleString();

                const labels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
                const temps = feeds.map(feed => parseFloat(feed.field1) || 0);
                const hums = feeds.map(feed => parseFloat(feed.field2) || 0);
                const humos = feeds.map(feed => parseFloat(feed.field3) || 0);

                tempChart.data.labels = labels;
                tempChart.data.datasets[0].data = temps;
                tempChart.update();

                humChart.data.labels = labels;
                humChart.data.datasets[0].data = hums;
                humChart.update();

                humoChart.data.labels = labels;
                humoChart.data.datasets[0].data = humos;
                humoChart.update();
                document.getElementById('download-report').onclick = () => {
    descargarReporteCSV(feeds);
};

            }
        })
        .catch(error => {
            console.error('Error:', error);
            const estadoSpan = document.getElementById('estado');
            estadoSpan.innerText = 'Error';
            estadoSpan.className = 'desconocido';
            document.getElementById('last-update').innerText = 'Error al cargar';
        });
}
function descargarReporteCSV(feeds) {
    const encabezado = ['Fecha y Hora', 'Temperatura (°C)', 'Humedad (%)', 'Humo'];
    const filas = feeds.map(feed => [
        new Date(feed.created_at).toLocaleString(),
        parseFloat(feed.field1) || 0,
        parseFloat(feed.field2) || 0,
        parseFloat(feed.field3) || 0
    ]);

    const csvContent = [encabezado, ...filas]
        .map(e => e.join(','))
        .join('\n');

}
function descargarReporteCSV(feeds) {
    const ahora = new Date();
    const fechaArchivo = ahora.toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const nombreArchivo = `reporte_calidad_aire_${fechaArchivo}.csv`;

    const encabezado = ['Fecha y Hora', 'Temperatura (°C)', 'Humedad (%)', 'Humo'];
    const filas = feeds.map(feed => [
        new Date(feed.created_at).toLocaleString(),
        feed.field1 ? parseFloat(feed.field1).toFixed(2) : 'N/A',
        feed.field2 ? parseFloat(feed.field2).toFixed(2) : 'N/A',
        feed.field3 ? parseFloat(feed.field3).toFixed(2) : 'N/A'
    ]);

    const contenidoCSV = [encabezado, ...filas]
        .map(fila => fila.join(','))
        .join('\n');

    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.setAttribute('download', nombreArchivo);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

window.onload = () => {
    initializeCharts();
    updateData();

    document.getElementById('refresh-btn').addEventListener('click', updateData);

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        const icon = document.getElementById('theme-toggle').querySelector('i');
        icon.className = document.body.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('theme-toggle').querySelector('i').className = 'fas fa-sun';
    }

    setInterval(updateData, 15000);
};
