import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BLEBar, Card, SectionTitle, VitalCard } from '../components/SharedComponents';
import { useApp } from '../context/AppContext';
import { COLORS, SYMPTOMS } from '../constants/theme';

export default function SymptomsScreen() {
  const { bleConnected, toggleBLE, vitals, analyzeSymptoms, loading } = useApp();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const toggle = (s: string) =>
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleAnalyze = async () => {
    await analyzeSymptoms(selected, notes);
    router.push('/result');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BLEBar connected={bleConnected} onToggle={toggleBLE} />

      <Card>
        <SectionTitle>Current Vitals</SectionTitle>
        <View style={styles.vitalsRow}>
          <VitalCard label="Temperature"    value={vitals.temp} unit="°C"   icon="🌡️" />
          <View style={{ width: 8 }} />
          <VitalCard label="Blood Pressure" value={vitals.bp}   unit="mmHg" icon="💓" />
          <View style={{ width: 8 }} />
          <VitalCard label="Heart Rate"     value={vitals.hr}   unit="bpm"  icon="❤️" />
        </View>
      </Card>

      <Card>
        <SectionTitle>Select Symptoms</SectionTitle>
        <Text style={styles.hint}>Tap all symptoms the patient is experiencing.</Text>
        <View style={styles.pillsWrap}>
          {SYMPTOMS.map(s => {
            const active = selected.includes(s);
            return (
              <TouchableOpacity
                key={s}
                onPress={() => toggle(s)}
                style={[styles.pill, {
                  backgroundColor: active ? COLORS.accentLight : COLORS.card,
                  borderColor: active ? COLORS.accent : COLORS.border,
                }]}
              >
                <Text style={[styles.pillText, { color: active ? COLORS.accent : COLORS.text, fontWeight: active ? '600' : '400' }]}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card>
        <SectionTitle>Additional Notes</SectionTitle>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. duration, medical history, allergies..."
          placeholderTextColor={COLORS.muted}
          multiline
          style={styles.textInput}
        />
      </Card>

      <TouchableOpacity
        onPress={handleAnalyze}
        disabled={selected.length === 0 || loading}
        style={[styles.analyzeBtn, { backgroundColor: selected.length === 0 ? COLORS.border : COLORS.accent }]}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={[styles.analyzeBtnText, { color: selected.length === 0 ? COLORS.muted : '#fff' }]}>
              Analyze with AI ({selected.length} symptoms)
            </Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  vitalsRow: { flexDirection: 'row' },
  hint: { fontSize: 13, color: COLORS.muted, marginBottom: 14 },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1.5 },
  pillText: { fontSize: 13 },
  textInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    padding: 12, fontSize: 14, color: COLORS.text,
    minHeight: 90, textAlignVertical: 'top', backgroundColor: COLORS.bg,
  },
  analyzeBtn: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  analyzeBtnText: { fontSize: 15, fontWeight: '700' },
});
