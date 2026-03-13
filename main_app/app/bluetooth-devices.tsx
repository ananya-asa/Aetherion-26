import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  Bluetooth, 
  ChevronRight, 
  RefreshCw, 
  Signal, 
  AlertTriangle, 
  Cpu, 
  Smartphone,
  CheckCircle2,
  Radar,
  Search,
  X,
  Activity,
  Watch,
  Headphones,
  Laptop,
  Heart
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  ScrollView
} from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  FadeOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  Layout
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { BleManager } from 'react-native-ble-plx';
const HARDWARE_MAC = '78:1C:3C:2D:43:F2';
let bleManager: BleManager | null = null;

if (Platform.OS !== 'web') {
  try {
    bleManager = new BleManager();
  } catch (e) {
    console.error('[BLE] Failed to initialize BleManager:', e);
  }
}

const { width, height } = Dimensions.get('window');

// Safe Base64 Decoder for React Native
const decodeBase64 = (str: string) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let out = '';
  for (let i = 0; i < str.length; i += 4) {
    const a = chars.indexOf(str.charAt(i));
    const b = chars.indexOf(str.charAt(i + 1));
    const c = chars.indexOf(str.charAt(i + 2));
    const d = chars.indexOf(str.charAt(i + 3));

    out += String.fromCharCode((a << 2) | (b >> 4));
    if (c !== 64) out += String.fromCharCode(((b & 15) << 4) | (c >> 2));
    if (d !== 64) out += String.fromCharCode(((c & 3) << 6) | d);
  }
  return out;
};

// --- Static Dummy Devices ---
const DUMMY_DEVICES = [
  { id: 'FC:21:44:66:88:99', name: 'ASHACARE', rssi: -38, type: 'core' },
  { id: '30:bb:7d:9c:b7:5a', name: 'OnePlus Nord N20 SE', rssi: -58, type: 'phone', status: 'Detected' },
  { id: '78:1C:3C:2D:43:F2', name: 'ESP32 BioSensor', rssi: -42, type: 'core', status: 'Detected' },
  { id: 'LP:33:AA:88:44:BB', name: 'mimidev', rssi: -62, type: 'laptop' },
  { id: 'ES:32:CC:11:55:AA', name: 'Biometric-ESP32', rssi: -48, type: 'core' },
];

// --- Muted Palette ---
const COLORS = {
  primary: '#4338CA', // Muted Deep Indigo
  secondary: '#6366F1', // Indigo
  accent: '#A5B4FC',
  textHeader: '#1E293B',
  textSub: '#64748B',
  bgLight: '#F8FAFC',
  success: '#10B981',
  error: '#EF4444',
  border: '#E2E8F0',
};

// --- Helper Components ---

const BackgroundBlobs = () => {
  const blob1Scale = useSharedValue(1);
  const blob2Scale = useSharedValue(1);

  useEffect(() => {
    blob1Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    blob2Scale.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, []);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ scale: blob1Scale.value }],
    opacity: interpolate(blob1Scale.value, [1, 1.2], [0.2, 0.4]),
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [{ scale: blob2Scale.value }],
    opacity: interpolate(blob2Scale.value, [0.8, 1], [0.15, 0.3]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.blob, styles.blob1, style1]} />
      <Animated.View style={[styles.blob, styles.blob2, style2]} />
    </View>
  );
};

const ScanHeroAnimation = ({ isScanning }: { isScanning: boolean }) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isScanning) {
      rotation.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1);
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 2000, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 0 })
        ),
        -1
      );
    } else {
      rotation.value = withTiming(0);
      pulse.value = withTiming(1);
    }
  }, [isScanning]);

  const radarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1.4 - pulse.value,
  }));

  return (
    <View style={styles.heroAnimContainer}>
      <Animated.View style={[styles.pulseCircle, pulseStyle]} />
      <Animated.View style={[styles.radarSpokes, radarStyle]}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.3)', 'transparent']}
          style={styles.radarSweep}
        />
      </Animated.View>
      <View style={styles.radarCore}>
        <Radar size={32} color={COLORS.secondary} strokeWidth={2.5} />
      </View>
    </View>
  );
};

// --- Main Page ---

export default function BluetoothDevicesPage() {
  const router = useRouter();
  const { toggleBLE, bleConnected, setVitals, setBleConnected } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<any | null>(null);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [backendConfig, setBackendConfig] = useState<any>(null);

  useEffect(() => {
    fetchBackendConfig();
    handleSimulatedScan();
  }, []);

  const fetchBackendConfig = async () => {
    try {
      // Fetching from our Express backend on 3001
      const response = await fetch('http://localhost:3001/bluetooth-config');
      const data = await response.json();
      setBackendConfig(data);
      if (data.autoSyncEnabled) setIsAutoSyncing(true);
      console.log('AshaLink Backend Synced:', data.handshakeProtocol);
    } catch (e) {
      console.log('Backend sync offline, using local fallbacks.');
    }
  };

  // Auto-Sync Logic: Automatically target the primary OnePlus MAC if detected
  useEffect(() => {
    if (isScanning && !connectingDeviceId && !connectedDevice) {
      const target = devices.find(d => d.id === HARDWARE_MAC);
      if (target && isAutoSyncing) {
        handleConnect(target);
      }
    }
  }, [devices, isScanning, isAutoSyncing]);

  const handleSimulatedScan = () => {
    setIsScanning(true);
    setDevices([]);
    setError(null);

    // ZERO LATENCY INJECTION
    setTimeout(() => {
      // Use backend devices if available, otherwise fallback to local dummies
      const deviceList = backendConfig?.primaryDevices || DUMMY_DEVICES;
      setDevices(deviceList.map((d: any) => ({ ...d, rssi: -Math.floor(Math.random() * 40 + 30) })));
      setIsScanning(false);
    }, 50);
  };

  const handleConnect = async (device: any) => {
    setConnectingDeviceId(device.id);
    setError(null);
    
    const isHardware = device.id === HARDWARE_MAC;

    if (isHardware && Platform.OS !== 'web' && bleManager) {
      try {
        console.log('[BLE] Bridge Initiated:', HARDWARE_MAC);
        
        // 1. Connection with priority
        const connectedDevice = await bleManager.connectToDevice(HARDWARE_MAC);
        console.log('[BLE] Connected to Physical Hardware:', connectedDevice.name);
        
        // 2. Discovering services and characteristics
        await connectedDevice.discoverAllServicesAndCharacteristics();
        
        // 3. Setup the Data Bridge
        connectedDevice.monitorCharacteristicForService(
          '4fafc201-1fb5-459e-8fcc-c5c9c331914b', // ESP32 Service UUID
          'beb5483e-36e1-4688-b7f5-ea07361b26a8', // Sensor Characteristic UUID
          (error, characteristic) => {
            if (error) {
              console.error('[BLE] Stream Error:', error);
              setError("Data Stream Interrupted");
              return;
            }
            if (characteristic?.value) {
              // Safe Base64 decode for React Native
              try {
                const rawData = decodeBase64(characteristic.value);
                console.log("[BLE] Raw Input:", rawData);
                
                // Parse sensor data (Expected: HR,SPO2,TEMP,HUM,AQ)
                const parts = rawData.split(',');
                if (parts.length >= 2) {
                  setVitals({
                    hr: parts[0] || '72',
                    spo2: parts[1] || '98',
                    temp: parts[2] || '36.5',
                    humidity: parts[3] || '45',
                    airQuality: parts[4] || 'Normal'
                  });
                }
              } catch (decodeErr) {
                console.error('[BLE] Decode Fail:', decodeErr);
              }
            }
          }
        );

        setConnectedDevice(device);
        setBleConnected(true);
        setConnectingDeviceId(null);
        router.push('/dashboard' as any);
        return;
      } catch (e: any) {
        console.error('[BLE] Connection Crash:', e);
        setError(`Hardware Fail: ${e.message || 'Check Power'}`);
        setConnectingDeviceId(null);
        return;
      }
    }
    
    // Fallback/Simulated connection flow
    setTimeout(() => {
      setConnectedDevice(device);
      setConnectingDeviceId(null);
      if (!bleConnected) toggleBLE();
      router.push('/dashboard' as any);
    }, 1000);
  };

  const getDeviceIcon = (device: any) => {
    if (device.type === 'core') return <Heart size={26} color={COLORS.secondary} strokeWidth={2.5} />;
    if (device.type === 'laptop') return <Laptop size={26} color={COLORS.secondary} />;
    if (device.type === 'watch') return <Watch size={26} color={COLORS.secondary} />;
    if (device.type === 'audio') return <Headphones size={26} color={COLORS.secondary} />;
    return <Smartphone size={26} color={COLORS.secondary} />;
  };

  const renderDeviceItem = ({ item, index }: { item: any; index: number }) => {
    const isConnecting = connectingDeviceId === item.id;
    const isConnected = connectedDevice?.id === item.id;
    const name = item.name || item.localName;
    const isOnePlus = item.id === '30:bb:7d:9c:b7:5a';
    const isLaptop = item.id === 'LP:33:AA:88:44:BB';
    const isESP32 = item.type === 'core';
    const isSpecial = isESP32 || 
                      item.type === 'laptop' || 
                      name?.toLowerCase().includes('oneplus nord');

    return (
      <Animated.View 
        entering={FadeInRight.delay(index * 100)} 
        layout={Layout.springify()}
        style={[
          styles.cardWrapper, 
          isConnecting && styles.cardConnecting, 
          isConnected && styles.cardConnected,
          isSpecial && styles.cardSpecial
        ]}
      >
        <TouchableOpacity 
          style={styles.cardInner}
          onPress={() => !connectingDeviceId && !connectedDevice && handleConnect(item)}
          activeOpacity={0.7}
          disabled={!!connectingDeviceId || !!connectedDevice}
        >
          <View style={[styles.iconBox, isSpecial && styles.iconBoxSpecial]}>
            {isConnecting ? (
              <ActivityIndicator color={isSpecial ? "#FFF" : COLORS.secondary} size="small" />
            ) : getDeviceIcon(item)}
          </View>

          <View style={styles.deviceDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.deviceNameText} numberOfLines={1}>
                {item.name}
              </Text>
              {isSpecial && (
                <View style={[styles.verifiedBadge, isConnected && styles.badgeWhite]}>
                  <CheckCircle2 size={10} color={isConnected ? COLORS.secondary : "#FFF"} />
                  <Text style={[styles.verifiedText, isConnected && styles.textBlue]}>AshaLink</Text>
                </View>
              )}
            </View>
            <View style={styles.identityRow}>
              <Activity size={12} color={item.status === 'Detected' ? COLORS.success : COLORS.textSub} />
              <Text style={[styles.deviceIdText, item.status === 'Detected' && { color: COLORS.success }]}>
                {isConnecting 
                  ? `Negotiating Secure Link [${isOnePlus ? '30:bb:7d' : 'core'}]...`
                  : item.status === 'Detected' ? 'FAST-SYNC READY' : item.id}
              </Text>
            </View>
          </View>

          <View style={styles.statusSection}>
            {isConnected ? (
              <CheckCircle2 size={24} color={COLORS.success} />
            ) : (
              <View style={styles.signalMeter}>
                <View style={[styles.signalDot, { backgroundColor: item.rssi > -65 ? COLORS.success : '#F59E0B' }]} />
                <Text style={styles.rssiValue}>{Math.abs(item.rssi || 0)}ms</Text>
                <ChevronRight size={16} color={COLORS.accent} />
              </View>
            )}
          </View>
        </TouchableOpacity>
        {isConnecting && (
          <View style={styles.connectingBar}>
            <Animated.View entering={FadeInRight} style={styles.connectingProgress} />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F9FAFB', '#FFFFFF']} style={styles.gradient} />
      <BackgroundBlobs />

      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.headerIconBox}>
            <Bluetooth size={24} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={styles.headerMainTitle}>Core Link</Text>
            <Text style={styles.headerSubTitle}>Setup Pairing</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSimulatedScan} 
          disabled={isScanning}
          style={[styles.scanBtn, isScanning && styles.scanBtnDisabled]}
        >
          <RefreshCw size={18} color={isScanning ? COLORS.textSub : COLORS.secondary} />
          <Text style={[styles.scanBtnText, isScanning && styles.textGray]}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollBody} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.heroSection}>
          <ScanHeroAnimation isScanning={isScanning} />
          <Text style={styles.heroDisplayTitle}>
            {isScanning ? 'Fast-Sync Active' : 'Instant Link Ready'}
          </Text>
          
          <View style={styles.turboActionContainer}>
            <TouchableOpacity 
              style={styles.turboBtn}
              onPress={() => handleConnect(devices.find(d => d.id === HARDWARE_MAC) || DUMMY_DEVICES[2])} 
              disabled={!!connectedDevice}
            >
              <Activity size={18} color="#FFF" />
              <Text style={styles.turboBtnText}>ONE-CLICK LINK: BIOSENSOR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isScanning && (
          <Animated.View entering={FadeInDown} style={styles.autoSyncBanner}>
            <LinearGradient colors={['#EEF2FF', '#FFFFFF']} style={styles.autoSyncInner}>
              <View style={styles.autoSyncTextGroup}>
                <Activity size={16} color={COLORS.secondary} />
                <Text style={styles.autoSyncTitle}>AshaLink Smart-Sync</Text>
              </View>
              <TouchableOpacity 
                style={[styles.autoSyncToggle, isAutoSyncing && { backgroundColor: COLORS.secondary }]}
                onPress={() => setIsAutoSyncing(!isAutoSyncing)}
              >
                <Text style={[styles.autoSyncToggleText, isAutoSyncing && { color: '#FFF' }]}>
                  {isAutoSyncing ? 'Auto-Bridge Active' : 'Enable Auto-Bridge'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        {connectedDevice && (
          <Animated.View entering={FadeInDown} style={styles.connectedBanner}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.connectedBannerInner}>
              <View style={styles.connectedBannerContent}>
                <View style={styles.connectedIconCircle}><CheckCircle2 size={24} color={COLORS.secondary} /></View>
                <View>
                  <Text style={styles.connectedSmallText}>
                    {(connectedDevice.id === '30:bb:7d:9c:b7:5a' || connectedDevice.id === 'LP:33:AA:88:44:BB') 
                      ? 'Secure Multi-Device Bridge' 
                      : 'Active Link'}
                  </Text>
                  <Text style={styles.connectedDeviceName}>{connectedDevice.name}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.disconnectBtn} onPress={() => setConnectedDevice(null)}>
                <Text style={styles.disconnectText}>Reset</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.listContainer}>
          {devices.map((item, index) => renderDeviceItem({ item, index }))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()}>
        <Text style={styles.cancelLinkText}>Discard Pairing</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  gradient: { ...StyleSheet.absoluteFillObject },
  blob: { position: 'absolute', borderRadius: 200, width: width * 0.9, height: width * 0.9 },
  blob1: { top: -50, right: -100, backgroundColor: 'rgba(99, 102, 241, 0.15)' },
  blob2: { bottom: -100, left: -100, backgroundColor: 'rgba(79, 70, 229, 0.1)' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  headerMainTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textHeader, letterSpacing: -0.5 },
  headerSubTitle: { fontSize: 12, color: COLORS.textSub, fontWeight: '500' },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: COLORS.border },
  scanBtnDisabled: { opacity: 0.6 },
  scanBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.secondary },
  scrollBody: { paddingHorizontal: 20, paddingBottom: 100 },
  heroSection: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  heroAnimContainer: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  pulseCircle: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(99, 102, 241, 0.15)' },
  radarSpokes: { position: 'absolute', width: 100, height: 100, borderRadius: 50, overflow: 'hidden' },
  radarSweep: { width: 100, height: 100, borderRadius: 50 },
  radarCore: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  heroDisplayTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textHeader, marginBottom: 6, textAlign: 'center' },
  heroDescription: { fontSize: 14, color: COLORS.textSub, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  connectedBanner: { marginBottom: 20, elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 },
  connectedBannerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 20 },
  connectedBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  connectedIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
  connectedSmallText: { fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' },
  connectedDeviceName: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  disconnectBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 10 },
  disconnectText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  listContainer: { gap: 10 },
  cardWrapper: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.bgLight, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardSpecial: { borderColor: COLORS.accent, borderRadius: 16 },
  cardConnecting: { borderColor: COLORS.secondary, transform: [{ scale: 1.01 }], borderRadius: 16 },
  cardConnected: { backgroundColor: '#F0F9FF', borderColor: COLORS.secondary, borderRadius: 16 },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconBoxSpecial: { backgroundColor: 'transparent' },
  deviceDetails: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  deviceNameText: { fontSize: 15, fontWeight: '700', color: COLORS.textHeader, maxWidth: width * 0.4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  badgeWhite: { backgroundColor: '#FFF' },
  verifiedText: { color: '#FFF', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  textBlue: { color: COLORS.secondary },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deviceIdText: { fontSize: 11, color: COLORS.textSub, fontWeight: '700', letterSpacing: 0.5 },
  statusSection: { alignItems: 'flex-end' },
  signalMeter: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.bgLight, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
  signalDot: { width: 5, height: 5, borderRadius: 2.5 },
  rssiValue: { fontSize: 10, fontWeight: '700', color: COLORS.textSub },
  connectingBar: { height: 3, backgroundColor: COLORS.accent, width: '100%', opacity: 0.3 },
  connectingProgress: { height: '100%', backgroundColor: COLORS.secondary, width: '60%' },
  cancelLink: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 20, alignSelf: 'center', padding: 10 },
  cancelLinkText: { color: COLORS.textSub, fontWeight: '600', fontSize: 12 },
  autoSyncBanner: { marginBottom: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: COLORS.accent, borderStyle: 'dashed' },
  autoSyncInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  autoSyncTextGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  autoSyncTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  autoSyncToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.accent },
  autoSyncToggleText: { fontSize: 11, fontWeight: '800', color: COLORS.secondary },
  turboActionContainer: { marginTop: 15, width: '100%', alignItems: 'center' },
  turboBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 16,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  turboBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  textGray: { color: COLORS.textSub }
});
