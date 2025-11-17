const admin = require('firebase-admin');

// Initialize Firebase Admin only once
if (!admin.apps.length) {
    try {
        let serviceAccount;
        
        // Try to get credentials from environment variable (for Vercel)
        if (process.env.FIREBASE_CONFIG) {
            serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
        } else {
            // Fallback to local file (for local development)
            serviceAccount = require('../firebase-credentials.json');
        }
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://delhibreathe-default-rtdb.firebaseio.com"
        });
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
}

const db = admin.database();

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Get latest sensor data from Firebase
        const snapshot = await db.ref('sensors/readings').once('value');
        const data = snapshot.val();

        if (data) {
            // Return the sensor data
            res.status(200).json({
                aqi: data.aqi || 0,
                pm1: data.pm1 || 0,
                pm25: data.pm25 || 0,
                pm10: data.pm10 || 0,
                co: data.co || 0,
                so2: data.so2 || 0,
                no2: data.no2 || 0,
                voc: data.voc || 0,
                timestamp: data.timestamp || new Date().toISOString()
            });
        } else {
            // Return demo data if no Firebase data
            res.status(200).json({
                aqi: 45,
                pm1: 8.5,
                pm25: 12.3,
                pm10: 25.8,
                co: 2.1,
                so2: 35,
                no2: 15,
                voc: 250,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch sensor data',
            message: error.message 
        });
    }
};
