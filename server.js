const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const PORT = 3000;

// Initialize Firebase Admin
const serviceAccount = require('./firebase-credentials.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://delhibreathe-default-rtdb.firebaseio.com"
});

const db = admin.database();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Store latest sensor data
let latestData = {
    aqi: 0,
    pm1: 0,
    pm25: 0,
    pm10: 0,
    co: 0,
    so2: 0,
    no2: 0,
    voc: 0,
    timestamp: new Date().toISOString()
};

// Create HTTP server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    
    // Send latest data to new client
    ws.send(JSON.stringify(latestData));
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast data to all connected WebSocket clients
function broadcastData(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// API endpoint to get latest data
app.get('/api/latest', (req, res) => {
    res.json(latestData);
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Listen to Firebase Realtime Database for sensor data
function startFirebaseListener() {
    console.log('Starting Firebase listener...');
    
    const sensorRef = db.ref('sensors/readings');
    
    sensorRef.on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            console.log('Received data from Firebase:', data);
            
            // Update latest data with Firebase data
            latestData = {
                aqi: data.aqi || 0,
                pm1: data.pm1 || 0,
                pm25: data.pm25 || 0,
                pm10: data.pm10 || 0,
                co: data.co || 0,
                so2: data.so2 || 0,
                no2: data.no2 || 0,
                voc: data.voc || 0,
                timestamp: data.timestamp || new Date().toISOString()
            };
            
            // Broadcast to all WebSocket clients
            broadcastData(latestData);
        }
    }, (error) => {
        console.error('Firebase listener error:', error);
    });
    
    console.log('Firebase listener started - listening for real-time updates');
}

// Generate demo data for testing (when Firebase is not available)
function generateDemoData() {
    const demoData = {
        aqi: Math.floor(Math.random() * 100) + 30,
        pm1: parseFloat((Math.random() * 20 + 5).toFixed(1)),
        pm25: parseFloat((Math.random() * 40 + 10).toFixed(1)),
        pm10: parseFloat((Math.random() * 80 + 20).toFixed(1)),
        co: parseFloat((Math.random() * 8 + 1).toFixed(1)),
        so2: parseFloat((Math.random() * 60 + 10).toFixed(1)),
        no2: parseFloat((Math.random() * 80 + 15).toFixed(1)),
        voc: parseFloat((Math.random() * 400 + 100).toFixed(1)),
        timestamp: new Date().toISOString()
    };
    
    latestData = demoData;
    broadcastData(demoData);
}

// Choose mode: Firebase or Demo
const USE_FIREBASE = true;
if (USE_FIREBASE) {
    console.log('Running in FIREBASE mode - listening to Firebase Realtime Database');
    startFirebaseListener();
} else {
    console.log('Running in DEMO mode - generating random data');
    setInterval(generateDemoData, 2000);
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
