import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, View, Text, TextInput,
  TouchableOpacity, StyleSheet, Switch, Animated, Easing,
} from 'react-native';
import { Card, SectionTitle } from '../components/SharedComponents';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/theme';

const FLASK_URL = 'http://localhost:5000/predict';

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
        <TouchableOpacity key={o} onPress={() => onChange(o)}
          style={[styles.pill, value === o && styles.pillActive]}>
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
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor="#9DB5CC" keyboardType="numeric"
        style={[styles.input, { flex: 1 }]} />
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
      <Switch value={value} onValueChange={onChange}
        trackColor={{ false: '#D0E4F5', true: '#1A6FD4' }}
        thumbColor={value ? '#fff' : '#fff'} />
    </View>
  );
}

// Celebration particles for good health
function CelebrationBurst({ visible }: { visible: boolean }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    anim: useRef(new Animated.Value(0)).current,
    angle: (i / 12) * 360,
  }));

  useEffect(() => {
    if (visible) {
      particles.forEach(p => {
        p.anim.setValue(0);
        Animated.timing(p.anim, {
          toValue: 1, duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.burstContainer} pointerEvents="none">
      {particles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * 60] });
        const ty = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * 60] });
        const op = p.anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        return (
          <Animated.View key={i} style={[styles.particle,
            { backgroundColor: colors[i % colors.length], opacity: op, transform: [{ translateX: tx }, { translateY: ty }] }
          ]} />
        );
      })}
    </View>
  );
}

export default function ProfileScreen() {
  const { userProfile, setUserProfile } = useApp();
  const [isEditing, setIsEditing] = useState(!userProfile.name);
  const [saved, setSaved] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const gloomAnim = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState({
    name: userProfile.name || '',
    age: userProfile.age || '',
    gender: userProfile.gender || '',
    height: (userProfile as any).height || '',
    weight: (userProfile as any).weight || '',
    profession: (userProfile as any).profession || '',
    married: (userProfile as any).married || false,
    sleep: (userProfile as any).sleep || '',
    exercise: (userProfile as any).exercise || '',
    smoking: (userProfile as any).smoking || false,
    alcohol: (userProfile as any).alcohol || false,
    sugarIntake: (userProfile as any).sugarIntake || '',
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
    ? parseFloat(bmi) < 18.5 ? { label: 'Underweight', color: '#F59E0B' }
    : parseFloat(bmi) < 25 ? { label: 'Normal', color: '#10B981' }
    : parseFloat(bmi) < 30 ? { label: 'Overweight', color: '#F59E0B' }
    : { label: 'Obese', color: '#EF4444' }
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
    const bmiVal = getBMI();
    setUserProfile({
      name: form.name, age: form.age, gender: form.gender,
      conditions: form.conditions,
      // @ts-ignore
      height: form.height, weight: form.weight,
      profession: form.profession, married: form.married,
      sleep: form.sleep, exercise: form.exercise,
      smoking: form.smoking, alcohol: form.alcohol,
      sugarIntake: form.sugarIntake, bmi: bmiVal || '',
    });
    setAnalysisResult(null); // clear emoji on edit
    setSaved(true);
    setTimeout(() => { setSaved(false); setIsEditing(false); }, 1200);
  };

  const mapExercise = (val: string) => {
    if (!val) return 'none';
    const v = val.toLowerCase();
    if (v.includes('daily')) return 'high';
    if (v.includes('3') || v.includes('4')) return 'medium';
    if (v.includes('1') || v.includes('2')) return 'low';
    return 'none';
  };

  const mapSugar = (val: string) => {
    if (!val) return 'medium';
    const v = val.toLowerCase();
    if (v.includes('low')) return 'low';
    if (v.includes('high')) return 'high';
    return 'medium';
  };

  const mapProfession = (val: string) => {
    if (!val) return 'student';
    const v = val.toLowerCase();
    if (v.includes('office')) return 'office_worker';
    if (v.includes('health') || v.includes('doctor')) return 'doctor';
    if (v.includes('student')) return 'student';
    if (v.includes('teacher')) return 'teacher';
    if (v.includes('engineer')) return 'engineer';
    if (v.includes('driver') || v.includes('manual')) return 'driver';
    return 'student';
  };

  const mapSleep = (val: string) => {
    if (!val) return 7;
    if (val.includes('< 5')) return 4;
    if (val.includes('5-6')) return 5.5;
    if (val.includes('7-8')) return 7.5;
    if (val.includes('> 8')) return 9;
    return 7;
  };

  const runDailyAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setShowCelebration(false);
    emojiScale.setValue(0);
    try {
      const response = await fetch(FLASK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(userProfile.age as string) || 25,
          weight: parseFloat((userProfile as any).weight) || 70,
          height: parseFloat((userProfile as any).height) || 165,
          bmi: parseFloat((userProfile as any).bmi) || 25.0,
          exercise: mapExercise((userProfile as any).exercise),
          sleep: mapSleep((userProfile as any).sleep),
          sugarIntake: mapSugar((userProfile as any).sugarIntake),
          smoking: (userProfile as any).smoking || false,
          alcohol: (userProfile as any).alcohol || false,
          married: (userProfile as any).married || false,
          profession: mapProfession((userProfile as any).profession),
        }),
      });
      const data = await response.json();
      setAnalysisResult(data);

      // Animate emoji pop in
      Animated.spring(emojiScale, {
        toValue: 1, friction: 4, tension: 100, useNativeDriver: true,
      }).start();

      const isGood = data.status === 'Excellent Health' || data.status === 'Good Health';
      if (isGood) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 1500);
      } else {
        // Gloomy animation
        Animated.sequence([
          Animated.timing(gloomAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(gloomAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
      }
    } catch (e) {
      setAnalysisResult({ status: 'Error', emoji: '❓', message: 'Could not connect to health server', riskPercent: 0 });
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusColor = () => {
    if (!analysisResult) return '#1A6FD4';
    if (analysisResult.status === 'Excellent Health') return '#00C896';
    if (analysisResult.status === 'Good Health') return '#10B981';
    if (analysisResult.status === 'At Risk') return '#F59E0B';
    return '#EF4444';
  };

  const gloomOpacity = gloomAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });

  // ─── EDIT FORM ───────────────────────────────────────────────
  if (isEditing) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Your Health Profile</Text>
          <Text style={styles.formSubtitle}>Fill in your details for accurate AI analysis</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionHead}>👤 Personal Info</Text>
          <FieldLabel>Full Name</FieldLabel>
          <TextInput value={form.name} onChangeText={v => set('name', v)}
            placeholder="Enter your name" placeholderTextColor="#9DB5CC"
            style={[styles.input, { marginBottom: 16 }]} />
          <FieldLabel>Age</FieldLabel>
          <NumberInput value={form.age} onChange={v => set('age', v)} placeholder="e.g. 45" unit="yrs" />
          <View style={{ height: 16 }} />
          <FieldLabel>Gender</FieldLabel>
          <PillSelector options={GENDERS} value={form.gender} onChange={v => set('gender', v)} />
          <View style={{ height: 16 }} />
          <FieldLabel>Profession</FieldLabel>
          <PillSelector options={PROFESSIONS} value={form.profession} onChange={v => set('profession', v)} />
          <View style={{ height: 8 }} />
          <ToggleRow label="Married" value={form.married} onChange={v => set('married', v)} icon="💍" />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionHead}>📏 Body Measurements</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FieldLabel>Height</FieldLabel>
              <NumberInput value={form.height} onChange={v => set('height', v)} placeholder="170" unit="cm" />
            </View>
            <View style={{ width: 14 }} />
            <View style={{ flex: 1 }}>
              <FieldLabel>Weight</FieldLabel>
              <NumberInput value={form.weight} onChange={v => set('weight', v)} placeholder="65" unit="kg" />
            </View>
          </View>
          {bmi && (
            <View style={[styles.bmiCard, { borderColor: bmiStatus!.color }]}>
              <Text style={styles.bmiNum}>{bmi}</Text>
              <Text style={[styles.bmiTag, { color: bmiStatus!.color }]}>{bmiStatus!.label}</Text>
            </View>
          )}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionHead}>🌿 Lifestyle</Text>
          <FieldLabel>Sleep Duration</FieldLabel>
          <PillSelector options={SLEEP_OPTIONS} value={form.sleep} onChange={v => set('sleep', v)} />
          <View style={{ height: 16 }} />
          <FieldLabel>Exercise Frequency</FieldLabel>
          <PillSelector options={EXERCISE_OPTIONS} value={form.exercise} onChange={v => set('exercise', v)} />
          <View style={{ height: 16 }} />
          <FieldLabel>Sugar Intake</FieldLabel>
          <PillSelector options={SUGAR_OPTIONS} value={form.sugarIntake} onChange={v => set('sugarIntake', v)} />
          <View style={{ height: 8 }} />
          <ToggleRow label="Smoking" value={form.smoking} onChange={v => set('smoking', v)} icon="🚬" />
          <ToggleRow label="Alcohol" value={form.alcohol} onChange={v => set('alcohol', v)} icon="🍺" />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionHead}>🏥 Medical History</Text>
          <Text style={styles.hintText}>Select all existing conditions</Text>
          <View style={styles.pillRow}>
            {CONDITIONS.map(c => (
              <TouchableOpacity key={c} onPress={() => toggleCondition(c)}
                style={[styles.pill, activeConditions.includes(c) && styles.pillActive]}>
                <Text style={[styles.pillText, activeConditions.includes(c) && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, saved && { backgroundColor: '#10B981' }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saved ? '✓ Saved!' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ─── PROFILE VIEW ─────────────────────────────────────────────
  const statusColor = getStatusColor();
  const isGoodHealth = analysisResult && (analysisResult.status === 'Excellent Health' || analysisResult.status === 'Good Health');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Edit pencil */}
      <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
        <Text style={styles.editBtnText}>✏️ Edit</Text>
      </TouchableOpacity>

      {/* Profile Hero */}
      <View style={styles.heroCard}>
        {/* Gloomy overlay */}
        <Animated.View style={[styles.gloomOverlay, { opacity: gloomOpacity }]} pointerEvents="none" />

        <View style={styles.heroLeft}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {userProfile.name ? userProfile.name[0].toUpperCase() : '?'}
              </Text>
            </View>
            <CelebrationBurst visible={showCelebration} />
          </View>

          {/* Emoji after analysis */}
          {analysisResult && (
            <Animated.Text style={[styles.healthEmoji, { transform: [{ scale: emojiScale }] }]}>
              {analysisResult.emoji}
            </Animated.Text>
          )}
        </View>

        <View style={styles.heroRight}>
          <Text style={styles.heroName}>{userProfile.name || 'Your Name'}</Text>
          <Text style={styles.heroAge}>Age: {userProfile.age || '—'}</Text>
          {(userProfile as any).bmi && (
            <Text style={styles.heroBMI}>BMI: {(userProfile as any).bmi}</Text>
          )}
          {(userProfile as any).profession && (
            <Text style={styles.heroDetail}>{(userProfile as any).profession}</Text>
          )}
          {userProfile.gender && (
            <Text style={styles.heroDetail}>{userProfile.gender}</Text>
          )}
        </View>
      </View>

      {/* Analysis Result */}
      {analysisResult && (
        <View style={[styles.resultCard, { borderColor: statusColor }]}>
          <Text style={[styles.resultStatus, { color: statusColor }]}>{analysisResult.status}</Text>
          <Text style={styles.resultRisk}>Risk Level: {analysisResult.riskPercent}%</Text>
          <Text style={styles.resultMessage}>{analysisResult.message}</Text>
          {isGoodHealth && (
            <Text style={styles.resultCheer}>🎉 Keep it up! You're doing amazing!</Text>
          )}
          {!isGoodHealth && analysisResult.status !== 'Error' && (
            <Text style={styles.resultCheer}>💙 Small steps every day make a big difference.</Text>
          )}
        </View>
      )}

      {/* Daily Analysis Button */}
      <TouchableOpacity
        style={[styles.analysisBtn, analyzing && { opacity: 0.7 }]}
        onPress={runDailyAnalysis}
        disabled={analyzing}
      >
        <Text style={styles.analysisBtnText}>
          {analyzing ? '⏳ Analyzing...' : ' Daily Analysis'}
        </Text>
      </TouchableOpacity>

      {/* Info Cards */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>😴</Text>
          <Text style={styles.infoValue}>{(userProfile as any).sleep || '—'}</Text>
          <Text style={styles.infoLabel}>Sleep</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🏃</Text>
          <Text style={styles.infoValue}>{(userProfile as any).exercise || '—'}</Text>
          <Text style={styles.infoLabel}>Exercise</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🍬</Text>
          <Text style={styles.infoValue}>{(userProfile as any).sugarIntake || '—'}</Text>
          <Text style={styles.infoLabel}>Sugar</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>{(userProfile as any).smoking ? '🚬' : '✅'}</Text>
          <Text style={styles.infoValue}>{(userProfile as any).smoking ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoLabel}>Smoking</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>{(userProfile as any).alcohol ? '🍺' : '✅'}</Text>
          <Text style={styles.infoValue}>{(userProfile as any).alcohol ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoLabel}>Alcohol</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💍</Text>
          <Text style={styles.infoValue}>{(userProfile as any).married ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoLabel}>Married</Text>
        </View>
      </View>

      {userProfile.conditions && (
        <View style={styles.conditionsCard}>
          <Text style={styles.conditionsTitle}>🏥 Medical Conditions</Text>
          <Text style={styles.conditionsText}>{userProfile.conditions}</Text>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7FF' },
  content: { padding: 20, paddingBottom: 50 },

  // Edit button
  editBtn: {
    alignSelf: 'flex-end', backgroundColor: '#fff',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 2, borderColor: '#1A6FD4', marginBottom: 16,
  },
  editBtnText: { color: '#1A6FD4', fontSize: 18, fontWeight: '700' },

  // Hero card
  heroCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    flexDirection: 'row', alignItems: 'center', gap: 20,
    marginBottom: 20, overflow: 'hidden',
    shadowColor: '#1A6FD4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  gloomOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#001133', zIndex: 1,
  },
  heroLeft: { alignItems: 'center', position: 'relative' },
  avatarWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1A6FD4',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1A6FD4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  avatarLetter: { color: '#fff', fontSize: 44, fontWeight: '900' },
  healthEmoji: { fontSize: 44, marginTop: 8 },

  // Burst
  burstContainer: {
    position: 'absolute', width: 0, height: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  particle: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },

  heroRight: { flex: 1 },
  heroName: { fontSize: 30, fontWeight: '900', color: '#0A1628', marginBottom: 6 },
  heroAge: { fontSize: 22, fontWeight: '700', color: '#1A6FD4', marginBottom: 4 },
  heroBMI: { fontSize: 20, fontWeight: '700', color: '#334E68', marginBottom: 4 },
  heroDetail: { fontSize: 18, color: '#486581', marginBottom: 2, fontWeight: '500' },

  // Result card
  resultCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    borderWidth: 3, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  resultStatus: { fontSize: 32, fontWeight: '900', marginBottom: 8 },
  resultRisk: { fontSize: 22, fontWeight: '700', color: '#334E68', marginBottom: 8 },
  resultMessage: { fontSize: 20, color: '#486581', lineHeight: 28, marginBottom: 10 },
  resultCheer: { fontSize: 18, color: '#1A6FD4', fontWeight: '600' },

  // Analysis button
  analysisBtn: {
    backgroundColor: '#1A6FD4', borderRadius: 18,
    paddingVertical: 22, alignItems: 'center', marginBottom: 24,
    shadowColor: '#1A6FD4', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  analysisBtnText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },

  // Info grid
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  infoCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    alignItems: 'center',
    shadowColor: '#1A6FD4', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  infoIcon: { fontSize: 28, marginBottom: 6 },
  infoValue: { fontSize: 16, fontWeight: '800', color: '#0A1628', textAlign: 'center' },
  infoLabel: { fontSize: 13, color: '#9DB5CC', marginTop: 2, fontWeight: '600' },

  // Conditions
  conditionsCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 4,
    shadowColor: '#1A6FD4', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  conditionsTitle: { fontSize: 20, fontWeight: '800', color: '#0A1628', marginBottom: 8 },
  conditionsText: { fontSize: 18, color: '#486581', fontWeight: '500' },

  // ─── FORM STYLES ──────────────────────────────────────────────
  formHeader: { marginBottom: 20 },
  formTitle: { fontSize: 32, fontWeight: '900', color: '#0A1628' },
  formSubtitle: { fontSize: 18, color: '#486581', marginTop: 4 },
  formCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    marginBottom: 16,
    shadowColor: '#1A6FD4', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  sectionHead: { fontSize: 22, fontWeight: '800', color: '#0A1628', marginBottom: 16 },
  fieldLabel: {
    fontSize: 15, fontWeight: '800', color: '#486581',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  input: {
    borderWidth: 2, borderColor: '#D0E4F5', borderRadius: 14,
    padding: 16, fontSize: 18, color: '#0A1628', backgroundColor: '#F7FBFF',
  },
  numberInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  unit: { fontSize: 16, color: '#9DB5CC', fontWeight: '700', minWidth: 36 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: {
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 99,
    borderWidth: 2, borderColor: '#D0E4F5', backgroundColor: '#F7FBFF',
  },
  pillActive: { backgroundColor: '#E8F1FF', borderColor: '#1A6FD4' },
  pillText: { fontSize: 16, color: '#334E68', fontWeight: '600' },
  pillTextActive: { color: '#1A6FD4', fontWeight: '800' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', gap: 12,
  },
  toggleIcon: { fontSize: 24 },
  toggleLabel: { flex: 1, fontSize: 18, fontWeight: '600', color: '#0A1628' },
  row: { flexDirection: 'row' },
  bmiCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 2, borderRadius: 14, padding: 16, marginTop: 14, backgroundColor: '#F7FBFF',
  },
  bmiNum: { fontSize: 36, fontWeight: '900', color: '#0A1628' },
  bmiTag: { fontSize: 20, fontWeight: '800' },
  hintText: { fontSize: 16, color: '#9DB5CC', marginBottom: 12 },
  saveBtn: {
    backgroundColor: '#1A6FD4', padding: 20, borderRadius: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#1A6FD4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 22, fontWeight: '900' },
});