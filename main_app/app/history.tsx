import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, SectionTitle, RiskBadge } from '../components/SharedComponents';
import { COLORS, MOCK_HISTORY } from '../constants/theme';

function HistoryEntry({ entry }: { entry: typeof MOCK_HISTORY[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(v => !v)}
      style={[styles.entry, expanded && { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent }]}
      activeOpacity={0.8}
    >
      <View style={styles.entryHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.entryDate}>{entry.date} · {entry.time}</Text>
          <Text style={styles.entryDiagnosisPreview} numberOfLines={1}>{entry.diagnosis}</Text>
        </View>
        <View style={styles.entryRight}>
          <RiskBadge level={entry.riskLevel} />
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.entryBody}>
          <Text style={styles.entryDiagnosis}>{entry.diagnosis}</Text>
          <View style={styles.vitalsGrid}>
            {[
              { label: 'HR', val: `${entry.vitals.hr} bpm`, icon: '❤️' },
              { label: 'SpO₂', val: `${entry.vitals.spo2}%`, icon: '🫁' },
              { label: 'Temp', val: `${entry.vitals.temp}°C`, icon: '🌡️' },
              { label: 'Humidity', val: `${entry.vitals.humidity}%`, icon: '💧' },
              { label: 'Air', val: entry.vitals.airQuality, icon: '🌬️' },
            ].map(v => (
              <View key={v.label} style={styles.vitalChip}>
                <Text style={styles.vitalChipIcon}>{v.icon}</Text>
                <Text style={styles.vitalChipVal}>{v.val}</Text>
                <Text style={styles.vitalChipLabel}>{v.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          {[
            { label: 'Total', val: '3', color: COLORS.accent },
            { label: 'Low Risk', val: '1', color: COLORS.success },
            { label: 'Medium', val: '2', color: COLORS.warning },
            { label: 'High', val: '0', color: COLORS.danger },
          ].map(s => (
            <View key={s.label} style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>Health History</SectionTitle>
        <View style={styles.list}>
          {MOCK_HISTORY.map(entry => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  summaryCard: { borderLeftWidth: 4, borderLeftColor: COLORS.accent },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 24, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  list: { gap: 10 },
  entry: {
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 14, padding: 14,
    backgroundColor: COLORS.surface,
  },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  entryDate: { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  entryDiagnosisPreview: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  entryRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chevron: { color: COLORS.muted, fontSize: 12 },
  entryBody: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  entryDiagnosis: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 20 },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vitalChip: {
    backgroundColor: COLORS.card, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 10, alignItems: 'center', minWidth: 64,
  },
  vitalChipIcon: { fontSize: 16, marginBottom: 4 },
  vitalChipVal: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  vitalChipLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
});
