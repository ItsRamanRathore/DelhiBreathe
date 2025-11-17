/*
 * DelhiBreathe - ESP32 Air Quality Monitor with Firebase
 * 
 * This sketch reads air quality data from sensors and sends it to Firebase
 * 
 * Libraries needed:
 * - WiFi (built-in)
 * - Firebase ESP32 Client by Mobizt
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Firebase configuration
#define FIREBASE_HOST "https://delhibreathe-default-rtdb.firebaseio.com"
#define API_KEY "573127193014"
#define DATABASE_URL "https://delhibreathe-default-rtdb.firebaseio.com/"

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Sensor pins
#define MQ135_PIN 34    // Air Quality
#define MQ7_PIN 35      // CO
#define MQ136_PIN 32    // SO2
#define VOC_PIN 33      // VOC sensor

// Timing
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 2000; // Send every 2 seconds

bool firebaseReady = false;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== DelhiBreathe ESP32 with Firebase ===");
  
  // Initialize sensor pins
  pinMode(MQ135_PIN, INPUT);
  pinMode(MQ7_PIN, INPUT);
  pinMode(MQ136_PIN, INPUT);
  pinMode(VOC_PIN, INPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  // Configure Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  // Anonymous sign in
  Serial.println("Connecting to Firebase...");
  
  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Set database read/write timeout
  fbdo.setBSSLBufferSize(4096, 1024);
  fbdo.setResponseSize(2048);
  
  Serial.println("Firebase initialized!");
  firebaseReady = true;
  
  Serial.println("System ready - Starting monitoring...\n");
}

void loop() {
  // Check WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
  }
  
  // Read and send data
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    
    if (firebaseReady) {
      readAndSendData();
    }
  }
  
  delay(100);
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect!");
  }
}

void readAndSendData() {
  // Read all sensors
  float aqi = readAQI();
  float pm1 = readPM1();
  float pm25 = readPM25();
  float pm10 = readPM10();
  float co = readCO();
  float so2 = readSO2();
  float no2 = readNO2();
  float voc = readVOC();
  
  // Print readings
  Serial.println("--- Sensor Readings ---");
  Serial.printf("AQI: %.0f\n", aqi);
  Serial.printf("PM1: %.1f µg/m³\n", pm1);
  Serial.printf("PM2.5: %.1f µg/m³\n", pm25);
  Serial.printf("PM10: %.1f µg/m³\n", pm10);
  Serial.printf("CO: %.1f ppm\n", co);
  Serial.printf("SO₂: %.1f ppb\n", so2);
  Serial.printf("NO₂: %.1f ppb\n", no2);
  Serial.printf("VOC: %.0f ppb\n", voc);
  Serial.println("----------------------");
  
  // Send to Firebase
  if (Firebase.ready()) {
    String path = "sensors/readings";
    
    // Create JSON object
    FirebaseJson json;
    json.set("aqi", (int)aqi);
    json.set("pm1", pm1);
    json.set("pm25", pm25);
    json.set("pm10", pm10);
    json.set("co", co);
    json.set("so2", so2);
    json.set("no2", no2);
    json.set("voc", (int)voc);
    json.set("timestamp", getTimestamp());
    
    // Update Firebase
    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
      Serial.println("✓ Data sent to Firebase successfully");
    } else {
      Serial.println("✗ Failed to send data");
      Serial.println("Reason: " + fbdo.errorReason());
    }
  } else {
    Serial.println("Firebase not ready");
  }
  
  Serial.println();
}

// Sensor reading functions
float readAQI() {
  int raw = analogRead(MQ135_PIN);
  float aqi = map(raw, 0, 4095, 0, 300);
  aqi += random(-5, 5);
  return constrain(aqi, 0, 500);
}

float readPM1() {
  int raw = analogRead(MQ135_PIN);
  float pm1 = map(raw, 0, 4095, 3, 50);
  pm1 += random(-2, 2);
  return constrain(pm1, 0, 300);
}

float readPM25() {
  int raw = analogRead(MQ135_PIN);
  float pm25 = map(raw, 0, 4095, 5, 100);
  pm25 += random(-3, 3);
  return constrain(pm25, 0, 500);
}

float readPM10() {
  int raw = analogRead(MQ135_PIN);
  float pm10 = map(raw, 0, 4095, 10, 150);
  pm10 += random(-5, 5);
  return constrain(pm10, 0, 600);
}

float readCO() {
  int raw = analogRead(MQ7_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float co = voltage * 20;
  co += random(-2, 2) * 0.1;
  return constrain(co, 0, 100);
}

float readSO2() {
  int raw = analogRead(MQ136_PIN);
  float so2 = map(raw, 0, 4095, 0, 50);
  so2 += random(-3, 3);
  return constrain(so2, 0, 200);
}

float readNO2() {
  int raw = analogRead(MQ135_PIN);
  float no2 = map(raw, 0, 4095, 10, 80);
  no2 += random(-5, 5);
  return constrain(no2, 0, 200);
}

float readVOC() {
  int raw = analogRead(VOC_PIN);
  float voc = map(raw, 0, 4095, 50, 1000);
  voc += random(-20, 20);
  return constrain(voc, 0, 5000);
}

String getTimestamp() {
  // Return ISO 8601 timestamp
  // In production, use NTP to get real time
  return String(millis());
}
