import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext'; // Ensure diagnosisResult is stored here
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResultScreen() {
  const { diagnosisResult, loading } = useApp();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Analyzing your personal baseline...</Text>
      </View>
    );
  }

  if (!diagnosisResult) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No analysis data found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const severityColor = 
    diagnosisResult.severity === 'severe' ? '#EF4444' : 
    diagnosisResult.severity === 'moderate' ? '#F59E0B' : '#10B981';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Analysis</Text>
          <View style={[styles.badge, { backgroundColor: severityColor + '20' }]}>
            <Text style={[styles.badgeText, { color: severityColor }]}>
              {diagnosisResult.severity?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.mainCard, { borderLeftColor: severityColor }]}>
          <Text style={styles.cardLabel}>ASSESSMENT</Text>
          <Text style={styles.diagnosisText}>{diagnosisResult.diagnosis}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={20} color="#2563EB" />
            <Text style={styles.cardTitle}>Recommended Action</Text>
          </View>
          <Text style={styles.actionText}>{diagnosisResult.action}</Text>
        </View>

        <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/')}>
          <LinearGradient colors={['#2563EB', '#3B82F6']} style={styles.gradient}>
            <Text style={styles.doneBtnText}>Return Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  mainCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, borderLeftWidth: 6, marginBottom: 20, elevation: 3 },
  cardLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 8 },
  diagnosisText: { fontSize: 18, color: '#1E293B', lineHeight: 26, fontWeight: '600' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  actionText: { fontSize: 15, color: '#64748B', lineHeight: 22 },
  doneBtn: { borderRadius: 15, overflow: 'hidden', marginTop: 10 },
  gradient: { paddingVertical: 18, alignItems: 'center' },
  doneBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  loadingText: { marginTop: 15, color: '#64748B' },
  emptyText: { color: '#94A3B8', marginBottom: 20 },
  backBtn: { backgroundColor: '#2563EB', padding: 12, borderRadius: 10 },
  backBtnText: { color: 'white' }
});