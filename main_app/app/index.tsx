<<<<<<< HEAD
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Hospital } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { COLORS } from '../constants/theme';

export default function AshaCare() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  // Responsive values
  const isDesktop = width > 768;
  const containerPadding = isDesktop ? 60 : 30;
  const logoSize = isDesktop ? 80 : 42;
  const subtitleSize = isDesktop ? 22 : 16;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const renderCards = () => (
    <View style={[styles.visualSection, {
      flex: isDesktop ? 1 : undefined,
      marginTop: isDesktop ? 0 : 20,
      marginLeft: isDesktop ? 40 : 0,
      marginBottom: isDesktop ? 0 : 40,
      flexDirection: isDesktop ? 'column' : 'row',
      flexWrap: isDesktop ? 'nowrap' : 'wrap',
      justifyContent: 'center',
      gap: isDesktop ? 20 : 10
    }]}
    >
      <View style={[styles.glassCard, isDesktop ? {} : styles.mobileCard, { marginLeft: isDesktop ? 0 : 0 }]}>
        <Ionicons name="pulse" size={isDesktop ? 32 : 18} color="#FFFFFF" style={[styles.cardIcon, isDesktop ? {} : styles.mobileCardIcon]} />
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, isDesktop ? {} : styles.mobileCardTitle]}>Real-time Vitals</Text>
          {isDesktop && <Text style={styles.cardSubtitle}>Sync with BLE devices</Text>}
        </View>
      </View>

      <View style={[styles.glassCard, isDesktop ? {} : styles.mobileCard, { marginLeft: isDesktop ? 40 : 0 }]}>
        <Ionicons name="analytics" size={isDesktop ? 32 : 18} color="#FFFFFF" style={[styles.cardIcon, isDesktop ? {} : styles.mobileCardIcon]} />
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, isDesktop ? {} : styles.mobileCardTitle]}>Smart Analysis</Text>
          {isDesktop && <Text style={styles.cardSubtitle}>AI-driven insights</Text>}
        </View>
      </View>

      <View style={[styles.glassCard, isDesktop ? {} : styles.mobileCard, { marginLeft: isDesktop ? 80 : 0 }]}>
        <Ionicons name="shield-checkmark" size={isDesktop ? 32 : 18} color="#FFFFFF" style={[styles.cardIcon, isDesktop ? {} : styles.mobileCardIcon]} />
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, isDesktop ? {} : styles.mobileCardTitle]}>Secure Records</Text>
          {isDesktop && <Text style={styles.cardSubtitle}>Your data, protected</Text>}
        </View>
      </View>
    </View>
  );

  const renderButton = () => (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isDesktop ? {} : styles.mobileButton,
        { transform: [{ scale: pressed ? 0.96 : 1 }] }
      ]}
      onPress={() => router.push('/symptoms')}
    >
      <LinearGradient
        colors={['#FFFFFF', '#E6F0FF']}
        style={[styles.buttonGradient, isDesktop ? {} : styles.mobileButtonGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.buttonText, isDesktop ? {} : styles.mobileButtonText]}>Get Started</Text>
        <Ionicons name="arrow-forward" size={isDesktop ? 20 : 18} color={COLORS.accentDark} />
      </LinearGradient>
    </Pressable>
  );

  return (
    <LinearGradient
      colors={['#81D4FA', '#01579B']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      <Animated.View
        style={[
          styles.contentWrapper,
          {
            width: '100%',
            maxWidth: 1100,
            padding: containerPadding,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={[styles.mainContent, {
          flexDirection: isDesktop ? 'row' : 'column',
          flex: isDesktop ? undefined : 1
        }]}>

          {/* Brand & Typography */}
          <View style={[styles.textSection, {
            flex: isDesktop ? 1 : 1,
            alignItems: isDesktop ? 'flex-start' : 'center',
            justifyContent: isDesktop ? 'center' : 'center'
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: isDesktop ? 'flex-start' : 'center', marginBottom: 16 }}>
              <Hospital color="#FFFFFF" size={logoSize} strokeWidth={2.5} style={{ marginRight: 16 }} />
              <Text style={[styles.logoText, { fontSize: logoSize, textAlign: isDesktop ? 'left' : 'center', marginBottom: 0 }]}>
                AshaCare
              </Text>
            </View>
            <Text style={[styles.subtitle, { fontSize: subtitleSize, textAlign: isDesktop ? 'left' : 'center' }]}>
              Your intelligent health companion. Monitor vitals, track symptoms, and manage your well-being seamlessly.
            </Text>

            {isDesktop && renderButton()}
          </View>

          {/* Visual Data / Glassmorphic Cards */}
          {renderCards()}

          {/* Mobile Button at the very end */}
          {!isDesktop && (
            <View style={{ width: '100%', paddingBottom: 20 }}>
              {renderButton()}
            </View>
          )}

        </View>
      </Animated.View>
    </LinearGradient>
=======
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BLEBar, Card, SectionTitle, VitalCard, RiskBadge } from '../components/SharedComponents';
import { useApp } from '../context/AppContext';
import { COLORS, MOCK_HISTORY } from '../constants/theme';

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { bleConnected, toggleBLE, vitals, diagnosisResult, userProfile } = useApp();
  const router = useRouter();
  const lastEntry = MOCK_HISTORY[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {userProfile.name ? `Hello, ${userProfile.name} 👋` : 'Health Monitor 🩺'}
          </Text>
          <Text style={styles.subGreeting}>Stay on top of your health today</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
          <Text style={styles.profileBtnText}>
            {userProfile.name ? userProfile.name[0].toUpperCase() : '👤'}
          </Text>
        </TouchableOpacity>
      </View>

      <BLEBar connected={bleConnected} onToggle={toggleBLE} />

      {/* Risk Summary */}
      {diagnosisResult && (
        <Card style={styles.riskCard}>
          <View style={styles.riskRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.riskTitle}>Last AI Assessment</Text>
              <Text style={styles.riskDiagnosis} numberOfLines={2}>{diagnosisResult.diagnosis}</Text>
            </View>
            <RiskBadge level={diagnosisResult.riskLevel || 'Low'} />
          </View>
        </Card>
      )}

      {/* Vitals Grid */}
      <Card>
        <SectionTitle>Live Vitals</SectionTitle>
        {!bleConnected && (
          <View style={styles.noDeviceBanner}>
            <Text style={styles.noDeviceText}>📡 Connect your ESP32 device to see live readings</Text>
          </View>
        )}
        <View style={styles.vitalsRow}>
          <VitalCard label="Heart Rate" value={vitals.hr} unit="bpm" icon="❤️" />
          <View style={{ width: 10 }} />
          <VitalCard label="SpO₂" value={vitals.spo2} unit="%" icon="🫁" />
        </View>
        <View style={{ height: 10 }} />
        <View style={styles.vitalsRow}>
          <VitalCard label="Body Temp" value={vitals.temp} unit="°C" icon="🌡️" />
          <View style={{ width: 10 }} />
          <VitalCard label="Humidity" value={vitals.humidity} unit="%" icon="💧" />
        </View>
        <View style={{ height: 10 }} />
        <View style={[styles.airQualityCard, {
          backgroundColor: vitals.airQuality === 'Good' ? COLORS.successLight : vitals.airQuality === 'Normal' ? COLORS.accentLight : COLORS.warningLight
        }]}>
          <Text style={styles.airQualityIcon}>🌬️</Text>
          <Text style={styles.airQualityLabel}>Air Quality</Text>
          <Text style={[styles.airQualityValue, {
            color: vitals.airQuality === 'Good' ? COLORS.success : vitals.airQuality === 'Normal' ? COLORS.accent : COLORS.warning
          }]}>{vitals.airQuality}</Text>
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard icon="📊" value="3" label="Analyses" color={COLORS.accent} />
        <StatCard icon="✅" value="Low" label="Last Risk" color={COLORS.success} />
        <StatCard icon="💊" value="2/3" label="Meds Today" color={COLORS.warning} />
      </View>

      {/* Quick Actions */}
      <Card>
        <SectionTitle>Quick Actions</SectionTitle>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.accent }]} onPress={() => router.push('/symptoms')}>
            <Text style={styles.actionBtnIcon}>🔬</Text>
            <Text style={styles.actionBtnText}>New Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0D1B2A' }]} onPress={() => router.push('/history')}>
            <Text style={styles.actionBtnIcon}>📋</Text>
            <Text style={styles.actionBtnText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.success }]} onPress={() => router.push('/medication')}>
            <Text style={styles.actionBtnIcon}>💊</Text>
            <Text style={styles.actionBtnText}>Medication</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.ble }]} onPress={() => router.push('/profile')}>
            <Text style={styles.actionBtnIcon}>👤</Text>
            <Text style={styles.actionBtnText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Last Reading */}
      <Card>
        <SectionTitle>Last Reading</SectionTitle>
        <View style={styles.lastReadingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.lastReadingDate}>{lastEntry.date} · {lastEntry.time}</Text>
            <Text style={styles.lastReadingDiagnosis} numberOfLines={2}>{lastEntry.diagnosis}</Text>
          </View>
          <RiskBadge level={lastEntry.riskLevel} />
        </View>
        <View style={styles.lastReadingVitals}>
          {[
            { label: 'HR', val: `${lastEntry.vitals.hr}` },
            { label: 'SpO₂', val: `${lastEntry.vitals.spo2}%` },
            { label: 'Temp', val: `${lastEntry.vitals.temp}°C` },
          ].map(v => (
            <View key={v.label} style={styles.miniVital}>
              <Text style={styles.miniVitalVal}>{v.val}</Text>
              <Text style={styles.miniVitalLabel}>{v.label}</Text>
            </View>
          ))}
        </View>
      </Card>

    </ScrollView>
>>>>>>> origin/ai_model
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSection: {
    justifyContent: 'center',
    width: '100%',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 450,
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  mobileButton: {
    width: 'auto',
    alignSelf: 'center',
    marginTop: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  mobileButtonGradient: {
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: COLORS.accentDark,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  mobileButtonText: {
    fontSize: 16,
  },
  visualSection: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 500,
  },
  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  mobileCard: {
    padding: 12,
    borderRadius: 16,
    paddingVertical: 10,
    width: 'auto',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mobileCardIcon: {
    padding: 8,
    marginRight: 8,
    borderRadius: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  mobileCardTitle: {
    fontSize: 14,
    marginBottom: 0,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  }
=======
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subGreeting: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  profileBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  profileBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  riskCard: { borderLeftWidth: 4, borderLeftColor: COLORS.warning },
  riskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  riskTitle: { fontSize: 11, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  riskDiagnosis: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  noDeviceBanner: {
    backgroundColor: COLORS.accentLight, borderRadius: 10,
    padding: 10, marginBottom: 14, alignItems: 'center',
  },
  noDeviceText: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  vitalsRow: { flexDirection: 'row' },
  airQualityCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, padding: 12, gap: 10,
  },
  airQualityIcon: { fontSize: 20 },
  airQualityLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  airQualityValue: { fontSize: 14, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: COLORS.card,
    borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#0D1B2A', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    width: '47%', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  actionBtnIcon: { fontSize: 20 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  lastReadingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  lastReadingDate: { fontSize: 11, color: COLORS.muted, marginBottom: 4 },
  lastReadingDiagnosis: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  lastReadingVitals: { flexDirection: 'row', gap: 10 },
  miniVital: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: 10, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  miniVitalVal: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  miniVitalLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
>>>>>>> origin/ai_model
});
