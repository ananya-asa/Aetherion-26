import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, View, Text, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, SafeAreaView, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SYMPTOMS = ["Fever", "Cough", "Fatigue", "Dyspnea", "Nausea", "Headache", "Dizziness", "Chest Pain"];

const LANG_CODE: Record<string, string> = {
  'English': 'en-IN',
  'Hindi': 'hi-IN',
  'Kannada': 'kn-IN',
};

export default function SymptomsScreen() {
  const { analyzeSymptoms, loading, userProfile } = useApp();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef<any>(null);

  const userLanguage = (userProfile as any).language || 'English';
  const langCode = LANG_CODE[userLanguage] || 'en-IN';

  // Button enabled if at least one tile selected OR notes not empty
  const canAnalyze = selected.length > 0 || notes.trim().length > 0;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported. Try Chrome!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langCode;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus(`🎙️ Listening in ${userLanguage}...`);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setVoiceStatus(`🎙️ "${transcript}"`);
      if (event.results[0].isFinal) {
        setNotes(prev => prev ? prev + ' ' + transcript : transcript);
        setVoiceStatus('✅ Got it!');
      }
    };

    recognition.onerror = (event: any) => {
      console.log('Speech error:', event.error);
      setVoiceStatus('❌ Could not hear. Try again!');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => setVoiceStatus(''), 2000);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const speakNotes = () => {
    if (!notes) return;
    const utterance = new SpeechSynthesisUtterance(notes);
    utterance.lang = langCode;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const toggle = (s: string) =>
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleAnalyze = async () => {
    await analyzeSymptoms(selected, notes);
    router.push('/result');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.title}>Symptoms</Text>
            <Text style={styles.subtitle}>Select or speak your current conditions</Text>
            <View style={styles.langIndicator}>
              <Ionicons name="language-outline" size={16} color="#3B82F6" />
              <Text style={styles.langIndicatorText}>Voice: {userLanguage}</Text>
            </View>
          </View>

          {/* Symptom Tiles */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Physical State</Text>
              <Text style={styles.countText}>{selected.length} selected</Text>
            </View>
            <View style={styles.grid}>
              {SYMPTOMS.map(s => {
                const active = selected.includes(s);
                return (
                  <TouchableOpacity key={s} activeOpacity={0.7} onPress={() => toggle(s)}
                    style={[styles.tile, active && styles.tileActive]}>
                    <View style={[styles.iconContainer, active && styles.iconActive]}>
                      <Ionicons name={active ? "checkmark" : "add"} size={20}
                        color={active ? "#FFF" : "#64748B"} />
                    </View>
                    <Text style={[styles.tileText, active && styles.tileTextActive]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notes + Voice */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Describe Symptoms</Text>
              {notes.trim().length > 0 && (
                <TouchableOpacity onPress={speakNotes} style={styles.speakerBtn}>
                  <Ionicons name="volume-high-outline" size={20} color="#3B82F6" />
                  <Text style={styles.speakerBtnText}>Read</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputCard}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={
                  userLanguage === 'Kannada' ? 'ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ...' :
                  userLanguage === 'Hindi' ? 'अपने लक्षण बताएं...' :
                  'Describe your symptoms or duration...'
                }
                placeholderTextColor="#94A3B8"
                multiline
                style={styles.textInput}
              />

              {voiceStatus ? (
                <Text style={styles.voiceStatusText}>{voiceStatus}</Text>
              ) : null}

              <View style={styles.micRow}>
                <Text style={styles.micHint}>
                  {isListening ? `Listening in ${userLanguage}...` : `Tap mic to speak in ${userLanguage}`}
                </Text>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    onPress={isListening ? stopListening : startListening}
                    style={[styles.micBtn, isListening && styles.micBtnActive]}>
                    <Ionicons name={isListening ? "stop" : "mic"} size={26} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>

            <Text style={styles.voiceTip}>
              💡 Speak OR type — both work for AI diagnosis
            </Text>
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={!canAnalyze || loading}
            style={styles.btnWrapper}>
            <LinearGradient
              colors={!canAnalyze ? ['#CBD5E1', '#94A3B8'] : ['#2563EB', '#3B82F6']}
              style={styles.analyzeBtn}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnInner}>
                  <Text style={styles.btnText}>Start AI Diagnosis</Text>
                  <Ionicons name="analytics-outline" size={20} color="white" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 25 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginLeft: -10 },
  title: { fontSize: 32, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  langIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#BFDBFE',
  },
  langIndicatorText: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  countText: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 16, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'transparent',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  tileActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  iconContainer: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  iconActive: { backgroundColor: '#3B82F6' },
  tileText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  tileTextActive: { color: '#1E40AF' },
  inputCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15,
    marginTop: 10, shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 10, elevation: 2,
  },
  textInput: { fontSize: 16, minHeight: 100, textAlignVertical: 'top', color: '#1E293B' },
  voiceStatusText: { fontSize: 14, color: '#3B82F6', fontStyle: 'italic', marginTop: 8, paddingHorizontal: 4 },
  micRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 10 },
  micHint: { flex: 1, fontSize: 13, color: '#94A3B8', fontStyle: 'italic' },
  micBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#3B82F6',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  micBtnActive: { backgroundColor: '#EF4444' },
  voiceTip: { fontSize: 13, color: '#94A3B8', marginTop: 10, fontStyle: 'italic' },
  speakerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#BFDBFE',
  },
  speakerBtnText: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
  btnWrapper: { marginTop: 10 },
  analyzeBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});