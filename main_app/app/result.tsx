import React from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native'; 
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResultScreen() {
  const { diagnosisResult, loading, vitals } = useApp();
  const router = useRouter();

  // 1. Loading State
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Synthesizing AI Report...</Text>
      </View>
    );
  }

  // 2. Empty State (No result yet)
  if (!diagnosisResult) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyCircle}>
          <Ionicons name="flask-outline" size={40} color="#94A3B8" />
        </View>
        <Text style={styles.emptyTitle}>No Analysis Data</Text>
        <Text style={styles.emptySubtitle}>Run a symptom check to see AI diagnostics.</Text>
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => router.push('/symptoms')}
        >
          <Text style={styles.primaryBtnText}>Start New Analysis</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Logic for Severity Colors
  const severity = diagnosisResult.severity?.toLowerCase() || 'normal';
  const severityColor = 
    severity === 'severe' ? '#EF4444' : 
    severity === 'moderate' ? '#F59E0B' : '#10B981';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Diagnosis</Text>
        </View>

        {/* Status Card (Main Result) */}
        <View style={[styles.statusCard, { borderLeftColor: severityColor }]}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Condition Severity</Text>
            <View style={[styles.badge, { backgroundColor: severityColor + '20' }]}>
              <Text style={[styles.badgeText, { color: severityColor }]}>
                {severity.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.diagnosisTitle}>AI Assessment</Text>
          <Text style={styles.diagnosisBody}>{diagnosisResult.diagnosis}</Text>
        </View>

        {/* Action Card */}
        <View style={styles.whiteCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons name="medical" size={20} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>Recommended Action</Text>
          </View>
          <Text style={styles.actionBody}>{diagnosisResult.action}</Text>
        </View>

        {/* Vitals Snapshot Card */}
        <View style={styles.whiteCard}>
          <Text style={styles.cardTitleSmall}>Data used for analysis:</Text>
          <View style={styles.vitalsRow}>
            <View style={styles.vitalTag}>
              <Text style={styles.vitalTagText}>HR: {vitals.hr}bpm</Text>
            </View>
            <View style={styles.vitalTag}>
              <Text style={styles.vitalTagText}>SpO2: {vitals.spo2}%</Text>
            </View>
            <View style={styles.vitalTag}>
              <Text style={styles.vitalTagText}>Temp: {vitals.temp}°C</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="alert-circle" size={18} color="#64748B" />
          <Text style={styles.disclaimerText}>
            This is an AI-generated assessment. Please verify with a professional doctor.
          </Text>
        </View>

        {/* Return Button */}
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/')}>
          <LinearGradient colors={['#2563EB', '#3B82F6']} style={styles.gradientBtn}>
            <Text style={styles.doneBtnText}>Return to Dashboard</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { flex: 1 },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { marginRight: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  
  loadingText: { marginTop: 15, color: '#64748B', fontWeight: '600' },
  
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    borderLeftWidth: 6,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusLabel: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  diagnosisTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  diagnosisBody: { fontSize: 16, lineHeight: 24, color: '#475569' },

  whiteCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  cardTitleSmall: { fontSize: 14, fontWeight: '600', color: '#94A3B8', marginBottom: 10 },
  actionBody: { fontSize: 15, lineHeight: 22, color: '#475569' },

  vitalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vitalTag: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  vitalTagText: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  disclaimerBox: { flexDirection: 'row', gap: 10, padding: 15, marginBottom: 25 },
  disclaimerText: { flex: 1, fontSize: 12, color: '#64748B', lineHeight: 18 },

  doneBtn: { borderRadius: 18, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 18, alignItems: 'center' },
  doneBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  emptyCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 25 },
  primaryBtn: { backgroundColor: '#2563EB', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  primaryBtnText: { color: 'white', fontWeight: '700' }
});