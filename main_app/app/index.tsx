import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

function VitalBox({ label, value, unit, icon, color }: any) {
  return (
    <View style={styles.vitalBox}>
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.vitalLabel}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.vitalValue}>{value}</Text>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </View>
  );
}

export default function Dashboard() {
  const { bleConnected, vitals, userProfile } = useApp();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with Profile Link */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Health Monitor</Text>
          <Text style={styles.subText}>{userProfile?.name || 'Patient Overview'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
          <Ionicons name="person-circle-outline" size={45} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Bluetooth Connection Bar */}
      <TouchableOpacity 
        style={[styles.bleBar, { backgroundColor: bleConnected ? '#ECFDF5' : '#FFF1F2' }]} 
        onPress={() => router.push('/connect')}
      >
        <Ionicons name="bluetooth" size={20} color={bleConnected ? '#10B981' : '#EF4444'} />
        <Text style={[styles.bleText, { color: bleConnected ? '#065F46' : '#991B1B' }]}>
          {bleConnected ? 'ESP32 Connected' : 'Tap to Connect Device'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={bleConnected ? '#10B981' : '#EF4444'} />
      </TouchableOpacity>

      {/* The 4 Vital Boxes Grid */}
      <View style={styles.grid}>
        <VitalBox label="Heart Rate" value={vitals.hr} unit="bpm" icon="heart-pulse" color="#EF4444" />
        <VitalBox label="Oxygen (SpO2)" value={vitals.spo2} unit="%" icon="water" color="#3B82F6" />
        <VitalBox label="Body Temp" value={vitals.temp} unit="°C" icon="thermometer" color="#F59E0B" />
        <VitalBox label="Humidity" value={vitals.humidity} unit="%" icon="cloud-percent" color="#8B5CF6" />
      </View>

      {/* Air Quality Index Bar */}
      <View style={styles.airCard}>
        <View style={styles.airInfo}>
          <MaterialCommunityIcons name="weather-windy" size={20} color="#64748B" />
          <Text style={styles.airLabel}>Air Quality Status</Text>
        </View>
        <Text style={[styles.airValue, { color: vitals.airQuality === 'Good' ? '#10B981' : '#F59E0B' }]}>
          {vitals.airQuality}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#1E293B' },
  subText: { fontSize: 14, color: '#64748B' },
  profileBtn: { padding: 2 },
  bleBar: { flexDirection: 'row', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 25, gap: 10, elevation: 1 },
  bleText: { flex: 1, fontWeight: '700', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  vitalBox: { width: (width - 55) / 2, backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 15, elevation: 2 },
  iconCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  vitalLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 5, gap: 3 },
  vitalValue: { fontSize: 26, fontWeight: '800', color: '#1E293B' },
  unitText: { fontSize: 12, color: '#94A3B8' },
  airCard: { backgroundColor: 'white', padding: 20, borderRadius: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, elevation: 1 },
  airInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  airLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  airValue: { fontSize: 16, fontWeight: '800' }
});