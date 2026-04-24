// --- GLOBAL INSTANCES ---
let myChartInstance = null;         // Doughnut Chart (Summary)
let timelineChartInstance = null;   // Bar Chart (Timeline)
let currentView = 'today';          // Tracks the current state

// 1. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Button Listeners
    document.getElementById('btn-today').addEventListener('click', () => loadChart('today'));
    document.getElementById('btn-all').addEventListener('click', () => loadChart('all'));
    document.getElementById('refresh-btn').addEventListener('click', refreshCurrentView);
    
    // Calendar Picker Listener
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
        // Formats the call as 'date/2026-03-21' for the backend
        loadChart(`date/${dateVal}`);
    }
}

/**
 * Helper: Converts raw seconds into human-readable H/M/S
 */
function formatSeconds(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    let parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    
    return parts.length > 0 ? parts.join(' ') : "0s";
}


async function loadTimeline(selectedDomain = null, selectedDate = null) {
    const storageData = await chrome.storage.sync.get(['apiBaseUrl']);
    const backendUrl = storageData.apiBaseUrl;

    if (!backendUrl) {
        console.error("No API URL configured. Please check extension options.");
        return;
    }
    const ctx = document.getElementById('timelineChart').getContext('2d');
    const url = new URL(`${backendUrl}/timeline`);
    if (selectedDate) url.searchParams.append('target_date', selectedDate);
    if (selectedDomain) url.searchParams.append('domain', selectedDomain);

    try {
        const response = await fetch(url);
        const result = await response.json(); 

        let hourlyBuckets = new Array(24).fill(0);
        if (result.events) {
            result.events.forEach(event => {
                const localDate = new Date(event.timestamp);
                const hour = localDate.getHours(); 
                hourlyBuckets[hour] += (event.duration / 60);
            });
        }
        const roundedBuckets = hourlyBuckets.map(minutes => Math.floor(minutes));
        const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

        // --- UPDATE LOGIC ---
        if (timelineChartInstance) {
            timelineChartInstance.data.labels = labels;
            timelineChartInstance.data.datasets[0].data = roundedBuckets;
            timelineChartInstance.data.datasets[0].label = selectedDomain ? `Minutes on ${selectedDomain}` : 'Total Minutes Active';
            timelineChartInstance.data.datasets[0].backgroundColor = selectedDomain ? '#FF6384' : '#36A2EB';
            timelineChartInstance.update(); // Smooth transition
        } else {
            timelineChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: selectedDomain ? `Minutes on ${selectedDomain}` : 'Total Minutes Active',
                        data: roundedBuckets,
                        backgroundColor: selectedDomain ? '#FF6384' : '#36A2EB',
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, max: 60 } }
                }
            });
        }
    } catch (e) {
        console.error("Timeline Error:", e);
    }
}

async function loadChart(type = 'today') {
    currentView = type;
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const title = document.getElementById('chart-title');
    const totalDisplay = document.getElementById('total-time-display');
    const noDataMsg = document.getElementById('no-data-msg');
    const chartCanvas = document.getElementById('myChart');
    const refreshBtn = document.getElementById('refresh-btn');
    const datePicker = document.getElementById('date-picker');

    refreshBtn.innerText = "🔄 Syncing...";

    let dateForTimeline = null;
    if (type === 'today' || type === 'all') {
        datePicker.value = "";
    } else if (type.startsWith('date/')) {
        dateForTimeline = type.split('/')[1];
        datePicker.value = dateForTimeline;
    }

    if (type === 'today') title.innerText = "Today's Activity";
    else if (type === 'all') title.innerText = "All-Time History";
    else title.innerText = `Activity for ${dateForTimeline}`;

    const storageData = await chrome.storage.sync.get(['apiBaseUrl']);
    const backendUrl = storageData.apiBaseUrl;

    if (!backendUrl) {
        statusDot.className = 'offline';
        statusText.innerText = 'Setup Required in Options';
        refreshBtn.innerText = "🔄 Refresh";
        return; 
    }


    try {
        const response = await fetch(`${backendUrl}/summary/${type}`);
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        statusDot.className = 'online';
        statusText.innerText = 'Server Online';

        const labels = Object.keys(data);
        if (labels.length === 0) {
            noDataMsg.style.display = 'block';
            chartCanvas.style.display = 'none';
            totalDisplay.innerText = "Total: 0s";
            if (myChartInstance) {
                myChartInstance.destroy();
                myChartInstance = null;
            }
            loadTimeline(null, dateForTimeline);
            return;
        }

        noDataMsg.style.display = 'none';
        chartCanvas.style.display = 'block';

        const values = Object.values(data).map(v => parseFloat(v) || 0);
        const grandTotalSeconds = values.reduce((acc, curr) => acc + curr, 0);
        totalDisplay.innerText = `Total: ${formatSeconds(grandTotalSeconds)}`;

        const ctx = chartCanvas.getContext('2d');

        // --- UPDATE LOGIC ---
        if (myChartInstance) {
            myChartInstance.data.labels = labels;
            myChartInstance.data.datasets[0].data = values;
            myChartInstance.update(); // Updates colors and slices smoothly
        } else {
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
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            const domain = myChartInstance.data.labels[index];
                            loadTimeline(domain, dateForTimeline);
                        } else {
                            loadTimeline(null, dateForTimeline);
                        }
                    },
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `${ctx.label}: ${formatSeconds(ctx.raw)}`
                            }
                        }
                    }
                }
            });
        }

        loadTimeline(null, dateForTimeline);

    } catch (e) {
        console.error("Dashboard Error:", e);
        statusDot.className = 'offline';
        statusText.innerText = 'Server Offline';
    } finally {
        refreshBtn.innerText = "🔄 Refresh";
    }
}