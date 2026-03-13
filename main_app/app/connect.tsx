import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';

const ESP32_IP = "http://192.168.4.1/vitals"; // Update '/vitals' to match your ESP32 route

export default function Connect() {
  const router = useRouter();
  const { setBleConnected, setVitals } = useApp();
  const [isConnecting, setIsConnecting] = useState(false);

  const startMonitoring = async () => {
    setIsConnecting(true);

    try {
      // Test the connection once
      const response = await fetch(ESP32_IP);
      
      if (response.ok) {
        setBleConnected(true);
        Alert.alert("Connected!", "Successfully reached ESP32 over Wi-Fi.");
        
        // Start a background loop to fetch data every 2 seconds
        const interval = setInterval(async () => {
          try {
            const res = await fetch(ESP32_IP);
            const data = await res.json();
            
            // Map ESP32 JSON to your App Vitals
            setVitals({
              hr: data.bpm || data.hr || '--',
              spo2: data.spo2 || '--',
              temp: data.temp || '--',
              humidity: data.hum || '--',
              airQuality: data.aq || 'Healthy'
            });
          } catch (e) {
            console.log("Polling error:", e);
          }
        }, 2000);

        // Save interval to clear later if needed or just navigate
        router.replace('/');
      } else {
        throw new Error("ESP32 responded but with an error.");
      }
    } catch (err) {
      Alert.alert(
        "Connection Failed",
        "Could not reach 192.168.4.1. \n\n1. Connect phone to ESP32 Wi-Fi.\n2. Ensure ESP32 is running a Web Server."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wi-Fi Data Hub</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.label}>Server Address:</Text>
        <Text style={styles.ipText}>192.168.4.1</Text>
        
        <TouchableOpacity 
          style={[styles.connectBtn, isConnecting && styles.disabledBtn]} 
          onPress={startMonitoring}
          disabled={isConnecting}
        >
          {isConnecting ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Connect via Wi-Fi</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 25, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1E293B', marginBottom: 30, textAlign: 'center' },
  statusCard: { backgroundColor: 'white', padding: 30, borderRadius: 20, elevation: 4, alignItems: 'center' },
  label: { color: '#94A3B8', fontSize: 14 },
  ipText: { fontSize: 22, fontWeight: '800', color: '#2563EB', marginVertical: 15 },
  connectBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' },
  disabledBtn: { backgroundColor: '#CBD5E1' },
  btnText: { color: 'white', fontWeight: 'bold' },
  backLink: { marginTop: 20, alignSelf: 'center' },
  backText: { color: '#64748B' }
});