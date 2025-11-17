import admin from 'firebase-admin';

// Initialize Firebase Admin
let db;

function initFirebase() {
    if (!admin.apps.length) {
        try {
            let serviceAccount;
            
            if (process.env.FIREBASE_CONFIG) {
                serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
            } else if (process.env.FIREBASE_PROJECT_ID) {
                // Use individual environment variables
                serviceAccount = {
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                };
            }
            
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://delhibreathe-default-rtdb.firebaseio.com"
            });
            
            db = admin.database();
        } catch (error) {
            console.error('Firebase init error:', error);
        }
    } else {
        db = admin.database();
    }
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        initFirebase();
        
        if (!db) {
            throw new Error('Firebase not initialized');
        }

        const snapshot = await db.ref('sensors/readings').once('value');
        const data = snapshot.val();

        if (data) {
            return res.status(200).json({
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
            // Demo data
            return res.status(200).json({
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
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch data',
            message: error.message 
        });
    }
}
