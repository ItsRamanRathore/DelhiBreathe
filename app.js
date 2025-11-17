// DelhiBreathe - Single Page Air Quality Monitor

// Health levels configuration
const pmLevels = {
    pm1: [
        { max: 12, label: 'Good', color: '#00d4aa', description: 'Air quality is satisfactory' },
        { max: 35, label: 'Moderate', color: '#feca57', description: 'Acceptable for most people' },
        { max: 55, label: 'Unhealthy for Sensitive', color: '#ff9f43', description: 'Sensitive groups may experience effects' },
        { max: 150, label: 'Unhealthy', color: '#ff6b6b', description: 'Everyone may experience effects' },
        { max: 999, label: 'Very Unhealthy', color: '#a29bfe', description: 'Health alert: everyone may experience serious effects' }
    ],
    pm25: [
        { max: 12, label: 'Good', color: '#00d4aa', description: 'Air quality is satisfactory' },
        { max: 35, label: 'Moderate', color: '#feca57', description: 'Acceptable for most people' },
        { max: 55, label: 'Unhealthy for Sensitive', color: '#ff9f43', description: 'Sensitive groups may experience effects' },
        { max: 150, label: 'Unhealthy', color: '#ff6b6b', description: 'Everyone may experience effects' },
        { max: 999, label: 'Very Unhealthy', color: '#a29bfe', description: 'Health alert: everyone may experience serious effects' }
    ],
    pm10: [
        { max: 54, label: 'Good', color: '#00d4aa', description: 'Air quality is satisfactory' },
        { max: 154, label: 'Moderate', color: '#feca57', description: 'Acceptable for most people' },
        { max: 254, label: 'Unhealthy for Sensitive', color: '#ff9f43', description: 'Sensitive groups may experience effects' },
        { max: 354, label: 'Unhealthy', color: '#ff6b6b', description: 'Everyone may experience effects' },
        { max: 999, label: 'Very Unhealthy', color: '#a29bfe', description: 'Health alert: everyone may experience serious effects' }
    ]
};

const gasLevels = {
    co: [
        { max: 4.4, label: 'Good', color: '#00d4aa' },
        { max: 9.4, label: 'Moderate', color: '#feca57' },
        { max: 12.4, label: 'Unhealthy for Sensitive', color: '#ff9f43' },
        { max: 15.4, label: 'Unhealthy', color: '#ff6b6b' },
        { max: 999, label: 'Very Unhealthy', color: '#a29bfe' }
    ],
    so2: [
        { max: 35, label: 'Good', color: '#00d4aa' },
        { max: 75, label: 'Moderate', color: '#feca57' },
        { max: 185, label: 'Unhealthy for Sensitive', color: '#ff9f43' },
        { max: 304, label: 'Unhealthy', color: '#ff6b6b' },
        { max: 9999, label: 'Very Unhealthy', color: '#a29bfe' }
    ],
    no2: [
        { max: 53, label: 'Good', color: '#00d4aa' },
        { max: 100, label: 'Moderate', color: '#feca57' },
        { max: 360, label: 'Unhealthy for Sensitive', color: '#ff9f43' },
        { max: 649, label: 'Unhealthy', color: '#ff6b6b' },
        { max: 9999, label: 'Very Unhealthy', color: '#a29bfe' }
    ],
    voc: [
        { max: 220, label: 'Good', color: '#00d4aa' },
        { max: 660, label: 'Moderate', color: '#feca57' },
        { max: 2200, label: 'Unhealthy for Sensitive', color: '#ff9f43' },
        { max: 5500, label: 'Unhealthy', color: '#ff6b6b' },
        { max: 99999, label: 'Very Unhealthy', color: '#a29bfe' }
    ]
};

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 60 + 20;
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Fetch data from API using polling
function startPolling() {
    // Initial fetch
    fetchData();
    
    // Poll every 3 seconds
    setInterval(fetchData, 3000);
}

async function fetchData() {
    try {
        const response = await fetch('/api/latest');
        if (response.ok) {
            const data = await response.json();
            updateDashboard(data);
            updateConnectionStatus(true);
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        updateConnectionStatus(false);
    }
}



// Fallback: Poll API for data
function startPolling() {
    setInterval(async () => {
        try {
            const response = await fetch('http://localhost:3000/api/latest');
            const data = await response.json();
            updateDashboard(data);
            updateConnectionStatus(true);
        } catch (error) {
            console.error('Polling error:', error);
            updateConnectionStatus(false);
        }
    }, 2000);
}

// Update connection status
function updateConnectionStatus(connected) {
    const indicator = document.getElementById('connectionStatus');
    const text = document.getElementById('connectionText');
    
    if (connected) {
        indicator.classList.add('connected');
        indicator.classList.remove('disconnected');
        text.textContent = 'Connected';
    } else {
        indicator.classList.remove('connected');
        indicator.classList.add('disconnected');
        text.textContent = 'Disconnected';
    }
}

// Get AQI category
function getAQICategory(aqi) {
    if (aqi <= 50) return { label: 'Good', color: '#00d4aa' };
    if (aqi <= 100) return { label: 'Moderate', color: '#feca57' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#ff9f43' };
    if (aqi <= 200) return { label: 'Unhealthy', color: '#ff6b6b' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: '#a29bfe' };
    return { label: 'Hazardous', color: '#6c5ce7' };
}

// Get health level for pollutant
function getHealthLevel(value, type) {
    const levels = type.startsWith('pm') ? pmLevels[type] : gasLevels[type];
    if (!levels) return levels[0];
    
    for (let level of levels) {
        if (value <= level.max) {
            return level;
        }
    }
    return levels[levels.length - 1];
}

// Update all dashboard elements
function updateDashboard(data) {
    // Update timestamp
    const time = new Date(data.timestamp || new Date());
    document.getElementById('lastUpdate').textContent = `Last updated: ${time.toLocaleTimeString()}`;
    
    // Update main AQI
    if (data.aqi !== undefined) {
        const aqiCategory = getAQICategory(data.aqi);
        document.getElementById('mainAqi').textContent = data.aqi;
        document.getElementById('mainAqiStatus').textContent = aqiCategory.label;
        
        // Update AQI value color
        const aqiElement = document.getElementById('mainAqi');
        aqiElement.style.background = `linear-gradient(135deg, ${aqiCategory.color} 0%, ${aqiCategory.color}CC 100%)`;
        aqiElement.style.webkitBackgroundClip = 'text';
        aqiElement.style.webkitTextFillColor = 'transparent';
        aqiElement.style.backgroundClip = 'text';
        
        // Update AQI bar
        const aqiPercent = Math.min((data.aqi / 300) * 100, 100);
        document.getElementById('aqiBarFill').style.width = `${aqiPercent}%`;
    }
    
    // Update PM values
    updatePMValue('pm1', data.pm1 || 0);
    updatePMValue('pm25', data.pm25 || 0);
    updatePMValue('pm10', data.pm10 || 0);
    
    // Update gas values
    updateGasValue('co', data.co || 0);
    updateGasValue('so2', data.so2 || 0);
    updateGasValue('no2', data.no2 || 0);
    updateGasValue('voc', data.voc || 0);
}

// Update particulate matter display
function updatePMValue(type, value) {
    const health = getHealthLevel(value, type);
    
    // Update value
    document.getElementById(type).textContent = value.toFixed(1);
    
    // Update health bar
    const maxValue = type === 'pm10' ? 300 : 100;
    const percent = Math.min((value / maxValue) * 100, 100);
    document.getElementById(`${type}Fill`).style.width = `${percent}%`;
    
    // Update status
    const statusElement = document.getElementById(`${type}Status`);
    statusElement.textContent = health.label;
    statusElement.style.color = health.color;
}

// Update gas concentration display
function updateGasValue(type, value) {
    const health = getHealthLevel(value, type);
    
    // Update value
    const valueElement = document.getElementById(type);
    valueElement.textContent = value.toFixed(1);
    valueElement.style.color = health.color;
    
    // Update level bar
    const maxValue = type === 'co' ? 20 : (type === 'so2' ? 400 : (type === 'no2' ? 700 : 6000));
    const percent = Math.min((value / maxValue) * 100, 100);
    document.getElementById(`${type}Bar`).style.width = `${percent}%`;
    
    // Update status
    const statusElement = document.getElementById(`${type}Status`);
    statusElement.textContent = health.label;
    statusElement.style.backgroundColor = health.color + '33';
    statusElement.style.color = health.color;
    statusElement.style.border = `1px solid ${health.color}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    startPolling();
    console.log('DelhiBreathe initialized');
});
