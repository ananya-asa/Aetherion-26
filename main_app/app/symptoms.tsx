import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SymptomsScreen() {
  const { analyzeSymptoms, loading } = useApp();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Added a few more to fill the grid nicely
  const SYMPTOMS = ["Fever", "Cough", "Fatigue", "Dyspnea", "Nausea", "Headache", "Dizziness", "Chest Pain"];

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
          
          {/* Header - Clean & Simple */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.title}>Symptoms</Text>
            <Text style={styles.subtitle}>Select the patient's current conditions</Text>
          </View>

          {/* Symptom Selection - White Cards on Light Blue BG */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Physical State</Text>
              <Text style={styles.countText}>{selected.length} selected</Text>
            </View>
            
            <View style={styles.grid}>
              {SYMPTOMS.map(s => {
                const active = selected.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    activeOpacity={0.7}
                    onPress={() => toggle(s)}
                    style={[styles.tile, active && styles.tileActive]}
                  >
                    <View style={[styles.iconContainer, active && styles.iconActive]}>
                      <Ionicons 
                        name={active ? "checkmark" : "add"} 
                        size={20} 
                        color={active ? "#FFF" : "#64748B"} 
                      />
                    </View>
                    <Text style={[styles.tileText, active && styles.tileTextActive]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.inputCard}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Briefly describe the duration or history..."
                placeholderTextColor="#94A3B8"
                multiline
                style={styles.textInput}
              />
            </View>
          </View>

          {/* CTA Button - Solid Primary Color */}
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={selected.length === 0 || loading}
            style={styles.btnWrapper}
          >
            <LinearGradient
              colors={selected.length === 0 ? ['#CBD5E1', '#94A3B8'] : ['#2563EB', '#3B82F6']}
              style={styles.analyzeBtn}
            >
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
  container: { flex: 1, backgroundColor: '#F1F5F9' }, // Light blue-gray background
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 25 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginLeft: -10 },
  title: { fontSize: 32, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  countText: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { 
    width: '48%', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    // Shadow for White Card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tileActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  iconContainer: { 
    width: 32, height: 32, borderRadius: 10, 
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  iconActive: { backgroundColor: '#3B82F6' },
  tileText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  tileTextActive: { color: '#1E40AF' },

  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  textInput: { fontSize: 16, minHeight: 100, textAlignVertical: 'top', color: '#1E293B' },

  btnWrapper: { marginTop: 10 },
  analyzeBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
