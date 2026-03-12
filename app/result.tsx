import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, SectionTitle, Badge } from '../components/SharedComponents';
import { useApp } from '../context/AppContext';
import { COLORS, SEVERITY } from '../constants/theme';

export default function ResultScreen() {
  const { diagnosisResult, loading } = useApp();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Analyzing symptoms with AI...</Text>
      </View>
    );
  }

  if (!diagnosisResult) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🔬</Text>
        <Text style={styles.emptyTitle}>No Analysis Yet</Text>
        <Text style={styles.emptySubtitle}>Go to Symptoms tab to run an AI analysis.</Text>
        <TouchableOpacity style={styles.goBtn} onPress={() => router.push('/symptoms')}>
          <Text style={styles.goBtnText}>Go to Symptoms</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = SEVERITY[diagnosisResult.severity] || SEVERITY.normal;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={{ borderColor: cfg.color + '40', backgroundColor: cfg.bg }}>
        <View style={styles.resultHeader}>
          <SectionTitle>AI Diagnosis Result</SectionTitle>
          <Badge severity={diagnosisResult.severity} />
        </View>
        <Text style={styles.diagnosisText}>{diagnosisResult.diagnosis}</Text>
      </Card>

      <Card>
        <SectionTitle>Recommended Action</SectionTitle>
        <View style={styles.actionBox}>
          <Text style={styles.actionIcon}>
            {diagnosisResult.severity === 'severe' ? '🏥' : diagnosisResult.severity === 'moderate' ? '👨‍⚕️' : '🏠'}
          </Text>
          <Text style={styles.actionText}>{diagnosisResult.action}</Text>
        </View>
      </Card>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠ This is an AI-assisted assessment only. Always consult a qualified medical professional.
        </Text>
      </View>

      <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/symptoms')}>
        <Text style={styles.newBtnText}>+ New Analysis</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: COLORS.bg },
  loadingText: { marginTop: 16, fontSize: 15, color: COLORS.muted },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 24 },
  goBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
  goBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  diagnosisText: { fontSize: 15, color: COLORS.text, lineHeight: 24 },
  actionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  actionIcon: { fontSize: 28 },
  actionText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  disclaimer: {
    backgroundColor: COLORS.warningLight, borderRadius: 10,
    padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#F0C88040',
  },
  disclaimerText: { fontSize: 13, color: COLORS.warning, lineHeight: 20 },
  newBtn: { backgroundColor: COLORS.accent, padding: 14, borderRadius: 12, alignItems: 'center' },
  newBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
