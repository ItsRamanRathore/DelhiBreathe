# DelhiBreathe - Air Quality Monitoring

Mobile-optimized air quality monitoring web app displaying ESP32 sensor data from Firebase.

## 🌟 Features

- Single-page mobile web app (Galaxy S24 optimized)
- Real-time Firebase data updates
- AQI, PM1/2.5/10, CO, SO₂, NO₂, VOC monitoring
- Serverless deployment on Vercel

## 🚀 Deploy to Vercel

1. Import repository to Vercel
2. Add environment variable: `FIREBASE_CONFIG` (paste firebase-credentials.json content)
3. Deploy

## 🔧 Local Development

```bash
npm install
npx vercel dev
```

## 📡 Firebase Structure

Path: `/sensors/readings`

```json
{
  "aqi": 47,
  "pm1": 8.5,
  "pm25": 12.3,
  "pm10": 25.8,
  "co": 2.1,
  "so2": 35,
  "no2": 15,
  "voc": 250,
  "timestamp": "2025-11-17T09:30:00.000Z"
}
```

## 📱 Files

- `index.html` - Mobile web app
- `app.js` - Frontend with polling
- `styles.css` - Mobile-optimized styles
- `api/latest.js` - Serverless API
- `esp32_firebase.ino` - ESP32 sensor code

## 📄 License

MIT
