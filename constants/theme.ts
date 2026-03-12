export const COLORS = {
  // Base
  bg: '#F0F4F8',
  card: '#FFFFFF',
  border: '#DDE4EE',
  surface: '#F7FAFC',

  // Text
  text: '#0D1B2A',
  textSecondary: '#3D5166',
  muted: '#8A9BB0',

  // Brand
  accent: '#0A5FCC',
  accentLight: '#E6F0FF',
  accentDark: '#063D8A',

  // Status
  success: '#059669',
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',

  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',

  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',

  // BLE
  ble: '#6D28D9',
  bleLight: '#F5F3FF',

  // Risk levels
  riskLow: '#059669',
  riskMedium: '#D97706',
  riskHigh: '#DC2626',
};

export const SEVERITY: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
  normal:   { color: COLORS.success, bg: COLORS.successLight, border: COLORS.successBorder, label: 'Normal',             icon: '✓'  },
  mild:     { color: COLORS.warning, bg: COLORS.warningLight, border: COLORS.warningBorder, label: 'Mild',               icon: '⚠'  },
  moderate: { color: COLORS.warning, bg: COLORS.warningLight, border: COLORS.warningBorder, label: 'Moderate',           icon: '⚠'  },
  severe:   { color: COLORS.danger,  bg: COLORS.dangerLight,  border: COLORS.dangerBorder,  label: 'Severe — See Doctor', icon: '🚨' },
};

export const SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Shortness of breath',
  'Fatigue', 'Chest pain', 'Nausea', 'Dizziness',
  'Sore throat', 'Body ache', 'Loss of appetite', 'Chills',
];

export const MOCK_HISTORY = [
  {
    id: '1', date: '2026-03-08', time: '09:14 AM', severity: 'mild',
    diagnosis: 'Common cold likely. Rest and hydration recommended.',
    vitals: { hr: 82, spo2: 96, temp: 37.8, humidity: 62, airQuality: 'Normal' },
    riskLevel: 'Medium',
  },
  {
    id: '2', date: '2026-03-05', time: '02:30 PM', severity: 'moderate',
    diagnosis: 'Possible viral infection. Monitor symptoms for 48hrs.',
    vitals: { hr: 96, spo2: 94, temp: 38.4, humidity: 58, airQuality: 'Normal' },
    riskLevel: 'Medium',
  },
  {
    id: '3', date: '2026-02-28', time: '11:00 AM', severity: 'normal',
    diagnosis: 'All vitals normal. No concerning symptoms detected.',
    vitals: { hr: 74, spo2: 98, temp: 36.6, humidity: 55, airQuality: 'Good' },
    riskLevel: 'Low',
  },
];
