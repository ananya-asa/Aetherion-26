import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput,
  TouchableOpacity, StyleSheet, Switch,
} from 'react-native';
import { Card, SectionTitle } from '../components/SharedComponents';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/theme';

const GENDERS = ['Male', 'Female', 'Other'];
const PROFESSIONS = ['Student', 'Office Worker', 'Manual Labor', 'Healthcare', 'Other'];
const SLEEP_OPTIONS = ['< 5 hrs', '5-6 hrs', '7-8 hrs', '> 8 hrs'];
const EXERCISE_OPTIONS = ['Never', '1-2x/week', '3-4x/week', 'Daily'];
const SUGAR_OPTIONS = ['Low', 'Moderate', 'High'];
const CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'None'];

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function PillSelector({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <View style={styles.pillRow}>
      {options.map(o => (
        <TouchableOpacity
          key={o}
          onPress={() => onChange(o)}
          style={[styles.pill, value === o && styles.pillActive]}
        >
          <Text style={[styles.pillText, value === o && styles.pillTextActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function NumberInput({ value, onChange, placeholder, unit }: {
  value: string; onChange: (v: string) => void; placeholder: string; unit?: string;
}) {
  return (
    <View style={styles.numberInputRow}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        keyboardType="numeric"
        style={[styles.input, { flex: 1 }]}
      />
      {unit && <Text style={styles.unit}>{unit}</Text>}
    </View>
  );
}

function ToggleRow({ label, value, onChange, icon }: {
  label: string; value: boolean; onChange: (v: boolean) => void; icon: string;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleIcon}>{icon}</Text>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: COLORS.accentLight }}
        thumbColor={value ? COLORS.accent : '#fff'}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const { userProfile, setUserProfile } = useApp();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: userProfile.name || '',
    age: userProfile.age || '',
    gender: userProfile.gender || '',
    height: '',
    weight: '',
    profession: '',
    married: false,
    sleep: '',
    exercise: '',
    smoking: false,
    alcohol: false,
    sugarIntake: '',
    conditions: userProfile.conditions || '',
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const getBMI = () => {
    const h = parseFloat(form.height) / 100;
    const w = parseFloat(form.weight);
    if (!h || !w) return null;
    return (w / (h * h)).toFixed(1);
  };

  const bmi = getBMI();
  const bmiStatus = bmi
    ? parseFloat(bmi) < 18.5 ? { label: 'Underweight', color: COLORS.warning }
    : parseFloat(bmi) < 25 ? { label: 'Normal', color: COLORS.success }
    : parseFloat(bmi) < 30 ? { label: 'Overweight', color: COLORS.warning }
    : { label: 'Obese', color: COLORS.danger }
    : null;

  const toggleCondition = (c: string) => {
    const current = form.conditions.split(',').map(s => s.trim()).filter(Boolean);
    const updated = current.includes(c)
      ? current.filter(x => x !== c)
      : [...current.filter(x => x !== 'None'), c];
    set('conditions', updated.join(', ') || 'None');
  };

  const activeConditions = form.conditions.split(',').map(s => s.trim()).filter(Boolean);

  const handleSave = () => {
    setUserProfile({
      name: form.name,
      age: form.age,
      gender: form.gender,
      conditions: form.conditions,
      // @ts-ignore
      height: form.height,
      weight: form.weight,
      profession: form.profession,
      married: form.married,
      sleep: form.sleep,
      exercise: form.exercise,
      smoking: form.smoking,
      alcohol: form.alcohol,
      sugarIntake: form.sugarIntake,
      bmi: bmi || '',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{form.name ? form.name[0].toUpperCase() : '👤'}</Text>
        </View>
        <View>
          <Text style={styles.headerName}>{form.name || 'Your Profile'}</Text>
          <Text style={styles.headerSub}>Health data improves AI accuracy</Text>
        </View>
      </View>

      {/* Personal Info */}
      <Card>
        <SectionTitle>Personal Information</SectionTitle>
        <FieldLabel>Full Name</FieldLabel>
        <TextInput
          value={form.name}
          onChangeText={v => set('name', v)}
          placeholder="Enter your name"
          placeholderTextColor={COLORS.muted}
          style={[styles.input, { marginBottom: 14 }]}
        />
        <FieldLabel>Age</FieldLabel>
        <NumberInput value={form.age} onChange={v => set('age', v)} placeholder="e.g. 28" unit="yrs" />
        <View style={{ height: 14 }} />
        <FieldLabel>Gender</FieldLabel>
        <PillSelector options={GENDERS} value={form.gender} onChange={v => set('gender', v)} />
        <View style={{ height: 14 }} />
        <FieldLabel>Profession</FieldLabel>
        <PillSelector options={PROFESSIONS} value={form.profession} onChange={v => set('profession', v)} />
        <View style={{ height: 6 }} />
        <ToggleRow label="Married" value={form.married} onChange={v => set('married', v)} icon="💍" />
      </Card>

      {/* Body Measurements */}
      <Card>
        <SectionTitle>Body Measurements</SectionTitle>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FieldLabel>Height</FieldLabel>
            <NumberInput value={form.height} onChange={v => set('height', v)} placeholder="170" unit="cm" />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <FieldLabel>Weight</FieldLabel>
            <NumberInput value={form.weight} onChange={v => set('weight', v)} placeholder="65" unit="kg" />
          </View>
        </View>

        {bmi && (
          <View style={[styles.bmiCard, { borderColor: bmiStatus!.color + '40', backgroundColor: bmiStatus!.color + '10' }]}>
            <View>
              <Text style={styles.bmiLabel}>BMI</Text>
              <Text style={[styles.bmiValue, { color: bmiStatus!.color }]}>{bmi}</Text>
            </View>
            <View style={[styles.bmiStatus, { backgroundColor: bmiStatus!.color + '20' }]}>
              <Text style={[styles.bmiStatusText, { color: bmiStatus!.color }]}>{bmiStatus!.label}</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Lifestyle */}
      <Card>
        <SectionTitle>Lifestyle Factors</SectionTitle>
        <FieldLabel>Sleep Duration</FieldLabel>
        <PillSelector options={SLEEP_OPTIONS} value={form.sleep} onChange={v => set('sleep', v)} />
        <View style={{ height: 14 }} />
        <FieldLabel>Exercise Frequency</FieldLabel>
        <PillSelector options={EXERCISE_OPTIONS} value={form.exercise} onChange={v => set('exercise', v)} />
        <View style={{ height: 14 }} />
        <FieldLabel>Sugar Intake</FieldLabel>
        <PillSelector options={SUGAR_OPTIONS} value={form.sugarIntake} onChange={v => set('sugarIntake', v)} />
        <View style={{ height: 8 }} />
        <ToggleRow label="Smoking" value={form.smoking} onChange={v => set('smoking', v)} icon="🚬" />
        <ToggleRow label="Alcohol consumption" value={form.alcohol} onChange={v => set('alcohol', v)} icon="🍺" />
      </Card>

      {/* Medical History */}
      <Card>
        <SectionTitle>Medical History</SectionTitle>
        <Text style={styles.hint}>Select all existing conditions</Text>
        <View style={styles.pillRow}>
          {CONDITIONS.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => toggleCondition(c)}
              style={[styles.pill, activeConditions.includes(c) && styles.pillActive]}
            >
              <Text style={[styles.pillText, activeConditions.includes(c) && styles.pillTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, saved && { backgroundColor: COLORS.success }]}
        onPress={handleSave}
      >
        <Text style={styles.saveBtnText}>{saved ? '✓ Profile Saved!' : 'Save Profile'}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerName: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  fieldLabel: {
    fontSize: 11, fontWeight: '800', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: 13, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.surface,
  },
  numberInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  unit: { fontSize: 14, color: COLORS.muted, fontWeight: '600', minWidth: 30 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.card,
  },
  pillActive: { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent },
  pillText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  pillTextActive: { color: COLORS.accent, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 10,
  },
  toggleIcon: { fontSize: 20 },
  toggleLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  row: { flexDirection: 'row' },
  bmiCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderRadius: 14, padding: 14, marginTop: 14,
  },
  bmiLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  bmiValue: { fontSize: 32, fontWeight: '800', marginTop: 2 },
  bmiStatus: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 },
  bmiStatusText: { fontSize: 14, fontWeight: '800' },
  hint: { fontSize: 13, color: COLORS.muted, marginBottom: 12 },
  saveBtn: { backgroundColor: COLORS.accent, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});