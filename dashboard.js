let myChartInstance = null;
let currentView = 'today';

// Setup modern Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-today').addEventListener('click', () => loadChart('today'));
    document.getElementById('btn-all').addEventListener('click', () => loadChart('all'));
    document.getElementById('refresh-btn').addEventListener('click', refreshCurrentView);
    document.getElementById('date-picker').addEventListener('change', loadDateFromPicker);

    // Initial Load
    loadChart('today');
});

function refreshCurrentView() {
    loadChart(currentView);
}

function loadDateFromPicker() {
    const dateVal = document.getElementById('date-picker').value;
    if (dateVal) {
        loadChart(`date/${dateVal}`);
    }
}

function formatSeconds(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
}

async function loadChart(type = 'today') {
    currentView = type;
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const title = document.getElementById('chart-title');
    const totalDisplay = document.getElementById('total-time-display');
    const noDataMsg = document.getElementById('no-data-msg');
    const chartCanvas = document.getElementById('myChart');
    const datePicker = document.getElementById('date-picker');

    if (type === 'today' || type === 'all') {
        datePicker.value = ""; 
    } else if (type.startsWith('date/')) {
        datePicker.value = type.split('/')[1];
    }

    noDataMsg.style.display = 'none';
    chartCanvas.style.display = 'block';

    if (type === 'today') title.innerText = "Today's Activity";
    else if (type === 'all') title.innerText = "All-Time History";
    else title.innerText = `Activity for ${type.split('/')[1]}`;

    try {
        const response = await fetch(`http://127.0.0.1:8000/summary/${type}`);
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        statusDot.className = 'online';
        statusText.innerText = 'Server Online';

        const labels = Object.keys(data);

        if (labels.length === 0) {
            noDataMsg.style.display = 'block';
            chartCanvas.style.display = 'none';
            totalDisplay.innerText = "Total: 0h 0m 0s";
            if (myChartInstance) myChartInstance.destroy();
            return;
        }

        let grandTotalSeconds = 0;
        const values = labels.map(l => {
            const parts = data[l].match(/\d+/g);
            if (!parts || parts.length < 3) return 0;
            const seconds = (parseInt(parts[0]) * 3600) + (parseInt(parts[1]) * 60) + parseInt(parts[2]);
            grandTotalSeconds += seconds; 
            return seconds;
        });

        totalDisplay.innerText = `Total: ${formatSeconds(grandTotalSeconds)}`;

        const ctx = chartCanvas.getContext('2d');
        if (myChartInstance) myChartInstance.destroy();

        myChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#7BC225'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const valueInSeconds = context.raw;
                                return `${label}: ${formatSeconds(valueInSeconds)}`;
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Dashboard Error:", e);
        statusDot.className = 'offline';
        statusText.innerText = 'Server Offline';
    }
}