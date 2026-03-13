import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Activity,
  Bluetooth,
  BluetoothOff,
  History,
  Pill,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RiskBadge } from '../components/SharedComponents';
import { MOCK_HISTORY } from '../constants/theme';
import { useApp } from '../context/AppContext';

// --- Sub-Components ---

interface VitalProps {
  label: string;
  value: string | number;
  unit: string;
  icon: string;
  color: string;
}

const EnhancedVitalCard = ({ label, value, unit, icon, color }: VitalProps) => (
  <View style={styles.vitalCard}>
    <Text style={styles.vitalIcon}>{icon}</Text>
    {/* FIX #1 & #3: Changed <div> to <View> and fixed style prop */}
    <View style={styles.vitalRow}>
      <Text style={[styles.vitalValue, { color }]}>{value}</Text>
      <Text style={styles.vitalUnit}>{unit}</Text>
    </View>
    <Text style={styles.vitalLabel}>{label}</Text>
  </View>
);

const StatCard = ({ icon, value, label, color }: { icon: string, value: string, label: string, color: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// FIX #2: Use proper typing for Lucide icons from lucide-react-native
// The icons are React components, so we use React.ComponentType with specific props
interface LucideIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const QuickActionButton = ({
  icon: Icon,
  label,
  color,
  onPress
}: {
  icon: React.ComponentType<LucideIconProps>,
  label: string,
  color: string,
  onPress: () => void
}) => (
  <TouchableOpacity onPress={onPress} style={styles.quickActionBtn}>
    <Icon size={20} color={color} />
    <Text style={styles.quickActionText}>{label}</Text>
  </TouchableOpacity>
);

// --- Main Screen ---

export default function DashboardScreen() {
  const { bleConnected, toggleBLE, vitals, diagnosisResult, userProfile } = useApp();
  const router = useRouter();

  // Guard against empty history
  const lastEntry = MOCK_HISTORY && MOCK_HISTORY.length > 0 ? MOCK_HISTORY[0] : null;
  const userName = userProfile?.name || 'Sarah';

  // 1. Connection State (Full Screen Overlay)
  if (!bleConnected) {
    return (
      <LinearGradient
        colors={['#DBEAFE', '#EFF6FF', '#E0E7FF']}
        style={styles.connectContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.connectContent}>
          <BluetoothOff size={120} color="#60A5FA" style={{ marginBottom: 30 }} strokeWidth={1.5} />
          <Text style={styles.connectSubtitle}>
            Turn on Bluetooth to discover nearby AshaCare product.
          </Text>
          <TouchableOpacity style={styles.turnOnBtn} onPress={toggleBLE}>
            <Text style={styles.turnOnBtnText}>TURN ON</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // 2. Active Dashboard State
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {userName} 👋</Text>
            <Text style={styles.subGreeting}>Stay on top of your health today</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <LinearGradient colors={['#6366F1', '#9333EA']} style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{userName[0]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* BLE Status Bar */}
        <View style={styles.bleBar}>
          <View style={styles.bleBarLeft}>
            <View>
              <Bluetooth size={20} color="#2563EB" />
              <View style={styles.bleDot} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.bleStatusTitle}>Bluetooth Connected</Text>
              <Text style={styles.bleStatusSub}>AshaCare Device Active</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleBLE} style={styles.disconnectBtn}>
            <Text style={styles.disconnectBtnText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        {/* Risk Summary */}
        {diagnosisResult && (
          <LinearGradient colors={['#F0FDF4', '#ECFDF5']} style={styles.riskCard}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <View style={styles.riskHeader}>
                <Zap size={16} color="#16A34A" />
                <Text style={styles.riskTitle}>Last AI Assessment</Text>
              </View>
              <Text style={styles.riskDiagnosis}>{diagnosisResult.diagnosis}</Text>
            </View>
            <RiskBadge level={diagnosisResult?.riskLevel ?? 'low'} />
          </LinearGradient>
        )}

        {/* Live Vitals */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={['#EF4444', '#DB2777']} style={styles.sectionIconBg}>
              <Activity size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Live Vitals</Text>
          </View>

          <View style={styles.vitalsGridRow}>
            <EnhancedVitalCard label="Heart Rate" value={vitals.hr} unit="bpm" icon="❤️" color="#ef4444" />
            <EnhancedVitalCard label="SpO₂" value={vitals.spo2} unit="%" icon="🫁" color="#3b82f6" />
          </View>
          <View style={styles.vitalsGridRow}>
            <EnhancedVitalCard label="Body Temp" value={vitals.temp} unit="°C" icon="🌡️" color="#f59e0b" />
            <EnhancedVitalCard label="Humidity" value={vitals.humidity} unit="%" icon="💧" color="#06b6d4" />
          </View>

          <View style={[styles.airQualityRow, {
            backgroundColor: vitals.airQuality === 'Good' ? '#F0FDF4' : vitals.airQuality === 'Normal' ? '#EFF6FF' : '#FEFCE8',
            borderColor: vitals.airQuality === 'Good' ? '#BBF7D0' : vitals.airQuality === 'Normal' ? '#BFDBFE' : '#FEF08A'
          }]}>
            <Text style={{ fontSize: 24 }}>🌬️</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.airQualityLabel}>Air Quality</Text>
            </View>
            <Text style={[styles.airQualityValue, {
              color: vitals.airQuality === 'Good' ? '#15803D' : vitals.airQuality === 'Normal' ? '#1D4ED8' : '#A16207'
            }]}>
              {vitals.airQuality}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard icon="📊" value="3" label="Analyses" color="#6366f1" />
          <StatCard icon="✅" value="Low" label="Last Risk" color="#10b981" />
          <StatCard icon="💊" value="2/3" label="Meds Today" color="#f59e0b" />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={['#A855F7', '#DB2777']} style={styles.sectionIconBg}>
              <Zap size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsContainer}>
            <QuickActionButton icon={Activity} label="New Analysis" color="#6366f1" onPress={() => router.push('/symptoms')} />
            <QuickActionButton icon={History} label="History" color="#0f172a" onPress={() => router.push('/history')} />
            <QuickActionButton icon={Pill} label="Medication" color="#10b981" onPress={() => router.push('/medication')} />
            <QuickActionButton icon={User} label="Profile" color="#3b82f6" onPress={() => router.push('/profile')} />
          </View>
        </View>

        {/* Last Reading */}
        {lastEntry && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={['#3B82F6', '#0891B2']} style={styles.sectionIconBg}>
                <TrendingUp size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Last Reading</Text>
            </View>

            <View style={styles.lastReadingInfoRow}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={styles.lastReadingTime}>{lastEntry.date} · {lastEntry.time}</Text>
                <Text style={styles.lastReadingDiag}>{lastEntry.diagnosis}</Text>
              </View>
              <RiskBadge level={lastEntry.riskLevel} />
            </View>

            <View style={styles.lastReadingVitalsRow}>
              <View style={[styles.lastReadingVitalBadge, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
                <Text style={[styles.lastReadingVitalVal, { color: '#DC2626' }]}>{lastEntry.vitals.hr}</Text>
                <Text style={styles.lastReadingVitalLabel}>HR</Text>
              </View>
              <View style={[styles.lastReadingVitalBadge, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                <Text style={[styles.lastReadingVitalVal, { color: '#2563EB' }]}>{lastEntry.vitals.spo2}%</Text>
                <Text style={styles.lastReadingVitalLabel}>SpO₂</Text>
              </View>
              <View style={[styles.lastReadingVitalBadge, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                <Text style={[styles.lastReadingVitalVal, { color: '#EA580C' }]}>{lastEntry.vitals.temp}°C</Text>
                <Text style={styles.lastReadingVitalLabel}>Temp</Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  connectContainer: { flex: 1, padding: 24, justifyContent: 'center' },
  connectContent: { alignItems: 'center', justifyContent: 'center' },
  connectSubtitle: { fontSize: 18, color: '#2563EB', textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
  turnOnBtn: { backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  turnOnBtnText: { color: '#2563EB', fontSize: 18, fontWeight: '800' },

  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 40, paddingTop: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subGreeting: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  profileAvatar: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 28 },
  profileAvatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  bleBar: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  bleBarLeft: { flexDirection: 'row', alignItems: 'center' },
  bleDot: { position: 'absolute', top: -4, right: -4, width: 8, height: 8, backgroundColor: '#22C55E', borderRadius: 4 },
  bleStatusTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  bleStatusSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  disconnectBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#EFF6FF', borderRadius: 8 },
  disconnectBtnText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },

  riskCard: { borderRadius: 16, padding: 20, borderLeftWidth: 4, borderLeftColor: '#22C55E', marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between' },
  riskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  riskTitle: { fontSize: 12, fontWeight: 'bold', color: '#15803D', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8 },
  riskDiagnosis: { fontSize: 14, color: '#374151', lineHeight: 22 },

  sectionCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginLeft: 12 },

  vitalsGridRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  vitalCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#F8FAFC' },
  vitalIcon: { fontSize: 20, marginBottom: 8 },
  vitalRow: { flexDirection: 'row', alignItems: 'baseline' }, // This style works with View
  vitalValue: { fontSize: 24, fontWeight: 'bold' },
  vitalUnit: { fontSize: 12, color: '#6B7280', marginLeft: 4, fontWeight: '500' },
  vitalLabel: { fontSize: 13, color: '#4B5563', marginTop: 6, fontWeight: '500' },

  airQualityRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  airQualityLabel: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  airQualityValue: { fontSize: 18, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '500' },

  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  quickActionBtn: { width: '48%', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row' },
  quickActionText: { fontSize: 14, fontWeight: '600', color: '#334155', marginLeft: 10 },

  lastReadingInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  lastReadingTime: { fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: '500' },
  lastReadingDiag: { fontSize: 15, color: '#374151', lineHeight: 22 },
  lastReadingVitalsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  lastReadingVitalBadge: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  lastReadingVitalVal: { fontSize: 22, fontWeight: 'bold' },
  lastReadingVitalLabel: { fontSize: 13, color: '#4B5563', marginTop: 4, fontWeight: '600' },
});