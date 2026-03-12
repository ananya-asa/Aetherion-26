import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Card, SectionTitle } from '../components/SharedComponents';
import { COLORS } from '../constants/theme';

const INITIAL_MEDS = [
  { id: '1', name: 'Paracetamol 500mg', time: 'Morning', taken: true },
  { id: '2', name: 'Vitamin D3', time: 'Afternoon', taken: false },
  { id: '3', name: 'Antibiotic 250mg', time: 'Evening', taken: false },
];

export default function MedicationScreen() {
  const [meds, setMeds] = useState(INITIAL_MEDS);
  const [newMed, setNewMed] = useState('');
  const [newTime, setNewTime] = useState('Morning');

  const toggleTaken = (id: string) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  const addMed = () => {
    if (!newMed.trim()) return;
    setMeds(prev => [...prev, { id: Date.now().toString(), name: newMed, time: newTime, taken: false }]);
    setNewMed('');
  };

  const takenCount = meds.filter(m => m.taken).length;
  const TIMES = ['Morning', 'Afternoon', 'Evening', 'Night'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Progress */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressTitle}>Today's Medications</Text>
            <Text style={styles.progressSub}>{takenCount} of {meds.length} doses taken</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPct}>{Math.round((takenCount / meds.length) * 100)}%</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(takenCount / meds.length) * 100}%` as any }]} />
        </View>
      </Card>

      {/* Med List */}
      <Card>
        <SectionTitle>Medication Schedule</SectionTitle>
        {meds.map(med => (
          <TouchableOpacity key={med.id} onPress={() => toggleTaken(med.id)} style={styles.medItem}>
            <View style={[styles.medCheckbox, med.taken && styles.medCheckboxDone]}>
              {med.taken && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.medName, med.taken && styles.medNameDone]}>{med.name}</Text>
              <Text style={styles.medTime}>⏰ {med.time}</Text>
            </View>
            <View style={[styles.medStatus, { backgroundColor: med.taken ? COLORS.successLight : COLORS.warningLight }]}>
              <Text style={[styles.medStatusText, { color: med.taken ? COLORS.success : COLORS.warning }]}>
                {med.taken ? 'Taken' : 'Pending'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>

      {/* Add Medication */}
      <Card>
        <SectionTitle>Add Medication</SectionTitle>
        <TextInput
          value={newMed}
          onChangeText={setNewMed}
          placeholder="Medication name & dosage"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
        <View style={styles.timeRow}>
          {TIMES.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setNewTime(t)}
              style={[styles.timePill, newTime === t && styles.timePillActive]}
            >
              <Text style={[styles.timePillText, newTime === t && styles.timePillTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={addMed}>
          <Text style={styles.addBtnText}>+ Add Medication</Text>
        </TouchableOpacity>
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  progressCard: { borderLeftWidth: 4, borderLeftColor: COLORS.accent },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  progressTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  progressSub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  progressCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.accentLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.accent,
  },
  progressPct: { fontSize: 14, fontWeight: '800', color: COLORS.accent },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  medItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  medCheckbox: {
    width: 28, height: 28, borderRadius: 8,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  medCheckboxDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  medName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  medNameDone: { textDecorationLine: 'line-through', color: COLORS.muted },
  medTime: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  medStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  medStatusText: { fontSize: 11, fontWeight: '700' },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: 13, fontSize: 15, color: COLORS.text,
    backgroundColor: COLORS.surface, marginBottom: 12,
  },
  timeRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  timePill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.card,
  },
  timePillActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  timePillText: { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  timePillTextActive: { color: COLORS.accent, fontWeight: '700' },
  addBtn: { backgroundColor: COLORS.accent, padding: 13, borderRadius: 12, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
