import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, SectionTitle, Badge } from '../components/SharedComponents';
import { useApp } from '../context/AppContext';
import { COLORS, SEVERITY } from '../constants/theme';

const PROXY_URL = 'https://aetherion-26-production.up.railway.app';

const LANG_CODE: Record<string, string> = {
  'English': 'en-IN',
  'Hindi':   'hi-IN',
  'Kannada': 'kn-IN',
};

const LANG_SPEAKER: Record<string, string> = {
  'English': 'ritu',
  'Hindi':   'roopa',
  'Kannada': 'kavya',
};

export default function ResultScreen() {
  const { diagnosisResult, loading, userProfile } = useApp();
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsStatus, setTtsStatus]   = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const userLanguage = (userProfile as any).language || 'English';
  const langCode     = LANG_CODE[userLanguage]    || 'en-IN';
  const speaker      = LANG_SPEAKER[userLanguage] || 'ritu';

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setTtsStatus('');
  };

  const handleSpeak = async () => {
    if (!diagnosisResult) return;
    if (isSpeaking) { stopSpeaking(); return; }

    const fullText = `${diagnosisResult.diagnosis}. ${diagnosisResult.action}`;
    setTtsLoading(true);

    try {
      // Step 1: Translate via proxy
      setTtsStatus('Translating...');
      const translateRes = await fetch(`${PROXY_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, target_language_code: langCode }),
      });
      const translateData = await translateRes.json();
      const translatedText = translateData.translated_text || fullText;

      // Step 2: TTS via proxy
      setTtsStatus('Preparing audio...');
      const ttsRes = await fetch(`${PROXY_URL}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translatedText, target_language_code: langCode, speaker }),
      });
      const ttsData = await ttsRes.json();

      if (!ttsData.audio) throw new Error('No audio returned');

      // Decode base64 WAV → play
      const binary = atob(ttsData.audio);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url  = URL.createObjectURL(blob);

      // @ts-ignore
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); setTtsStatus(''); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(false); setTtsStatus(''); URL.revokeObjectURL(url); };

      setTtsLoading(false);
      setTtsStatus('');
      setIsSpeaking(true);
      await audio.play();

    } catch (error: any) {
      console.log('TTS pipeline error:', error?.message || error);
      setTtsLoading(false);
      setTtsStatus('');
      // Fallback to browser TTS
      const utterance   = new SpeechSynthesisUtterance(fullText);
      utterance.lang    = langCode;
      utterance.rate    = 0.85;
      utterance.onend   = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

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
          <Text style={styles.actionText}>
            {!diagnosisResult.action
              ? 'Please consult a healthcare professional.'
              : typeof diagnosisResult.action === 'string'
              ? diagnosisResult.action
              : (diagnosisResult.action as any)?.medicine
                || (diagnosisResult.action as any)?.remedy
                || Object.values(diagnosisResult.action as any).join('. ')}
          </Text>
        </View>
      </Card>

      {/* Speak Button */}
      <TouchableOpacity
        style={[styles.speakBtn, isSpeaking && styles.speakBtnActive]}
        onPress={handleSpeak}
        disabled={ttsLoading}>
        {ttsLoading ? (
          <>
            <ActivityIndicator size="small" color="#3B82F6" style={{ marginRight: 4 }} />
            <View>
              <Text style={styles.speakBtnText}>{ttsStatus || 'Please wait...'}</Text>
              <Text style={styles.speakBtnLang}>in {userLanguage} · Sarvam AI</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.speakBtnIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
            <View>
              <Text style={[styles.speakBtnText, isSpeaking && styles.speakBtnTextActive]}>
                {isSpeaking ? 'Stop Speaking' : 'Speak Result'}
              </Text>
              <Text style={styles.speakBtnLang}>
                {isSpeaking ? 'Tap to stop' : `in ${userLanguage} · Sarvam AI`}
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>

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
  speakBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 2, borderColor: '#BFDBFE',
  },
  speakBtnActive:     { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  speakBtnIcon:       { fontSize: 28 },
  speakBtnText:       { fontSize: 16, fontWeight: '700', color: '#1E40AF' },
  speakBtnTextActive: { color: '#DC2626' },
  speakBtnLang:       { fontSize: 13, color: '#64748B', marginTop: 2 },
  disclaimer: {
    backgroundColor: COLORS.warningLight, borderRadius: 10,
    padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#F0C88040',
  },
  disclaimerText: { fontSize: 13, color: COLORS.warning, lineHeight: 20 },
  newBtn:     { backgroundColor: COLORS.accent, padding: 14, borderRadius: 12, alignItems: 'center' },
  newBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});