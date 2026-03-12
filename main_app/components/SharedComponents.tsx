import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SEVERITY } from '../constants/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Badge({ severity }: { severity: string }) {
  const cfg = SEVERITY[severity] || SEVERITY.normal;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.icon}  {cfg.label}</Text>
    </View>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const cfg =
    level === 'Low'    ? { color: COLORS.riskLow,    bg: COLORS.successLight, border: COLORS.successBorder } :
    level === 'Medium' ? { color: COLORS.riskMedium, bg: COLORS.warningLight, border: COLORS.warningBorder } :
                         { color: COLORS.riskHigh,   bg: COLORS.dangerLight,  border: COLORS.dangerBorder  };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>⬤  Risk: {level}</Text>
    </View>
  );
}

export function BLEBar({ connected, onToggle }: { connected: boolean; onToggle: () => void }) {
  return (
    <View style={[styles.bleBar, {
      backgroundColor: connected ? COLORS.bleLight : '#FFF5F5',
      borderColor: connected ? '#C4B5FD' : '#FECACA',
    }]}>
      <View style={styles.bleLeft}>
        <View style={[styles.bleDot, { backgroundColor: connected ? COLORS.ble : COLORS.danger }]} />
        <View>
          <Text style={[styles.bleStatus, { color: connected ? COLORS.ble : COLORS.danger }]}>
            {connected ? 'ESP32 Device Connected' : 'No Device Connected'}
          </Text>
          <Text style={styles.bleSubtext}>
            {connected ? 'HealthMonitor-01 • BLE Active' : 'Tap Connect to pair your device'}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onToggle} style={[styles.bleBtn, { backgroundColor: connected ? COLORS.ble : COLORS.accent }]}>
        <Text style={styles.bleBtnText}>{connected ? 'Disconnect' : 'Connect'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function VitalCard({ label, value, unit, icon, status = 'normal', wide = false }: {
  label: string; value: any; unit: string; icon: string; status?: string; wide?: boolean;
}) {
  const statusColor =
    status === 'high' ? COLORS.danger :
    status === 'low'  ? COLORS.warning :
    value === '--'    ? COLORS.muted :
    COLORS.success;

  const statusBg =
    status === 'high' ? COLORS.dangerLight :
    status === 'low'  ? COLORS.warningLight :
    value === '--'    ? '#F0F4F8' :
    COLORS.successLight;

  const statusLabel =
    status === 'high' ? 'High' :
    status === 'low'  ? 'Low' :
    value === '--'    ? 'No data' :
    'Normal';

  return (
    <View style={[styles.vitalCard, wide && { flex: 2 }]}>
      <View style={styles.vitalHeader}>
        <Text style={styles.vitalIcon}>{icon}</Text>
        <View style={[styles.vitalStatusDot, { backgroundColor: statusColor }]} />
      </View>
      <View style={styles.vitalValueRow}>
        <Text style={[styles.vitalValue, { color: value === '--' ? COLORS.muted : COLORS.text }]}>{value}</Text>
        <Text style={styles.vitalUnit}>{unit}</Text>
      </View>
      <Text style={styles.vitalLabel}>{label}</Text>
      <View style={[styles.vitalStatusBadge, { backgroundColor: statusBg }]}>
        <Text style={[styles.vitalStatusText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#0D1B2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: COLORS.muted,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  bleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bleDot: { width: 10, height: 10, borderRadius: 5 },
  bleStatus: { fontSize: 13, fontWeight: '700' },
  bleSubtext: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  bleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  bleBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  vitalCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0D1B2A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  vitalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  vitalIcon: { fontSize: 22 },
  vitalStatusDot: { width: 8, height: 8, borderRadius: 4 },
  vitalValueRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  vitalValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  vitalUnit: { fontSize: 12, color: COLORS.muted, marginBottom: 3, marginLeft: 2 },
  vitalLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '500' },
  vitalStatusBadge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  vitalStatusText: { fontSize: 10, fontWeight: '700' },
});
