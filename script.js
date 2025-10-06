// Parse input data from various formats
function parseData(input) {
    if (!input.trim()) return [];
    
    // Split dengan berbagai delimiter
    const numbers = input.split(/[,\s\n\r]+/)
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(s => parseFloat(s))
        .filter(n => !isNaN(n));
    
    return numbers;
}

// Calculate all statistical measures
function calculateStatistics(data) {
    if (data.length === 0) return null;

    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    
    // Mean
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    
    // Median
    const median = n % 2 === 0 
        ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
        : sorted[Math.floor(n/2)];
    
    // Mode
    const frequency = {};
    data.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency).filter(key => frequency[key] === maxFreq);
    const mode = modes.length === n ? 'Tidak ada' : modes.join(', ');
    
    // Min, Max, Range
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // Variance and Standard Deviation
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stddev = Math.sqrt(variance);
    
    // Percentiles
    const percentiles = {};
    for (let p = 5; p <= 95; p += 5) {
        const index = (p / 100) * (n - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        
        percentiles[p] = lower === upper 
            ? sorted[lower]
            : sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
    
    return {
        count: n,
        mean: mean,
        median: median,
        mode: mode,
        min: min,
        max: max,
        range: range,
        variance: variance,
        stddev: stddev,
        percentiles: percentiles,
        sorted: sorted
    };
}

// Display calculated results
function displayResults(stats) {
    document.getElementById('count').textContent = stats.count;
    document.getElementById('mean').textContent = stats.mean.toFixed(2);
    document.getElementById('median').textContent = stats.median.toFixed(2);
    document.getElementById('mode').textContent = stats.mode;
    document.getElementById('min').textContent = stats.min.toFixed(2);
    document.getElementById('max').textContent = stats.max.toFixed(2);
    document.getElementById('range').textContent = stats.range.toFixed(2);
    document.getElementById('stddev').textContent = stats.stddev.toFixed(2);
    document.getElementById('variance').textContent = stats.variance.toFixed(2);
    
    // Display percentiles
    const percentilesGrid = document.getElementById('percentilesGrid');
    percentilesGrid.innerHTML = '';
    
    Object.entries(stats.percentiles).forEach(([percentile, value]) => {
        const item = document.createElement('div');
        item.className = 'percentile-item';
        item.innerHTML = `
            <div class="percentile-label">P${percentile}</div>
            <div class="percentile-value">${value.toFixed(2)}</div>
        `;
        percentilesGrid.appendChild(item);
    });
}

// Create histogram chart
function createHistogram(data) {
    const canvas = document.getElementById('barChart');
    const ctx = canvas.getContext('2d');
    
    if (barChart) {
        barChart.destroy();
    }
    
    // Create bins for histogram
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binCount = Math.min(10, Math.ceil(Math.sqrt(data.length)));
    const binWidth = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0);
    const binLabels = [];
    
    for (let i = 0; i < binCount; i++) {
        const start = min + i * binWidth;
        const end = start + binWidth;
        binLabels.push(`${start.toFixed(1)}-${end.toFixed(1)}`);
    }
    
    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
        bins[binIndex]++;
    });
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Frekuensi',
                data: bins,
                backgroundColor: 'rgba(79, 172, 254, 0.7)',
                borderColor: 'rgba(79, 172, 254, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<div class="error">${message}</div>`;
}

// Clear error message
function clearError() {
    document.getElementById('errorMessage').innerHTML = '';
}

// Main calculation function
function calculateStats() {
    clearError();
    
    const input = document.getElementById('dataInput').value;
    const data = parseData(input);
    
    if (data.length === 0) {
        showError('Silakan masukkan data yang valid. Pastikan data berupa angka.');
        return;
    }
    
    if (data.length < 2) {
        showError('Minimal 2 data diperlukan untuk perhitungan statistik.');
        return;
    }
    
    const stats = calculateStatistics(data);
    displayResults(stats);
    createHistogram(data);
    createPieChart(data);
    
    // Show success notification
    showNotification('Statistik berhasil dihitung!', 'success');
}

// Clear all data and reset interface
function clearData() {
    // Check if there's data to clear
    const input = document.getElementById('dataInput').value.trim();
    
    if (!input) {
        showNotification('Tidak ada data untuk dihapus.', 'info');
        return;
    }
    
    // Show confirmation dialog
    if (!confirm('Apakah Anda yakin ingin menghapus semua data dan hasil perhitungan?')) {
        return;
    }
    
    // Clear input and errors
    document.getElementById('dataInput').value = '';
    clearError();
    
    // Reset all stat values
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(el => el.textContent = '-');
    
    document.getElementById('percentilesGrid').innerHTML = '';
    
    // Destroy existing charts
    if (barChart) {
        barChart.destroy();
        barChart = null;
    }
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
    
    // Show success notification
    showNotification('Data berhasil dihapus!', 'success');
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Insert notification at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(notification, container.firstChild);
    
    // Auto remove notification after 3 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Initialize application with sample data
function initializeApp() {
    // Sample data untuk demo
    document.getElementById('dataInput').value = '12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48';
    
    // Auto calculate pada load
    calculateStats();
}

// Event listeners
window.addEventListener('load', initializeApp);

// Make functions available globally
window.calculateStats = calculateStats;
window.clearData = clearData;
