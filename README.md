# DelhiBreathe - Air Quality Monitoring System

Real-time air quality monitoring website displaying ESP32 sensor data from Firebase with beautiful visualizations.

## 🌟 Features

- **Single-Page Website** with animations and particle effects
- **Real-time Updates** via Firebase and WebSocket
- **Air Quality Metrics**:
  - AQI - large prominent display
  - PM1, PM2.5, PM10 with health levels
  - CO, SO₂, NO₂, VOC gas levels
- **Mobile-friendly** compact design

## 🚀 Quick Start

```powershell
npm install
npm start
```

Open `http://localhost:3000`

## 🔧 Configuration

**Firebase:** Place `firebase-credentials.json` in project root

**Server:** Edit `USE_FIREBASE` in `server.js` (true/false for demo mode)

**ESP32:** Configure WiFi and Firebase in `esp32_firebase.ino`

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

## 📊 Files

- `index.html` - Main website
- `app.js` - Frontend logic
- `styles.css` - Responsive styling
- `server.js` - Backend server
- `esp32_firebase.ino` - ESP32 code

## 📄 License

MIT License

---

**Built for cleaner air monitoring**
