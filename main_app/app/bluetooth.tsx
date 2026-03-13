import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Wifi } from 'lucide-react-native'; // Update the import here
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function WifiPage() { // Renamed component for context
  const router = useRouter();
  const { toggleBLE, bleConnected } = useApp();
  const { width, height } = useWindowDimensions();

  const [isScanning, setIsScanning] = React.useState(false);
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  const minDimension = Math.min(width, height);
  const RIPPLE_BASE_SIZE = Math.min(100, minDimension * 0.2);
  const MAX_SCALE = 3;

  useEffect(() => {
    const animateRipple = (anim: Animated.Value, delay: number) => {
      return setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 3000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    const t1 = animateRipple(ripple1, 0);
    const t2 = animateRipple(ripple2, 1000);
    const t3 = animateRipple(ripple3, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      [ripple1, ripple2, ripple3].forEach(r => r.stopAnimation());
    };
  }, []);

  const getRippleStyle = (anim: Animated.Value): any => ({
    position: 'absolute',
    width: RIPPLE_BASE_SIZE,
    height: RIPPLE_BASE_SIZE,
    borderRadius: RIPPLE_BASE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: '#1D4ED8',
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, MAX_SCALE],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0.6, 0.2, 0],
    }),
  });

  const handleConnect = () => {
    setIsScanning(true);
    // Short delay for visual feedback before navigating
    // Note: You should probably navigate to a wifi-devices route here
    setTimeout(() => {
      setIsScanning(false);
      router.push('/wifi-devices' as any); 
    }, 1500); 
  };

  return (
    <LinearGradient
      colors={['#DBEAFE', '#93C5FD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Animated.View style={getRippleStyle(ripple1)} />
          <Animated.View style={getRippleStyle(ripple2)} />
          <Animated.View style={getRippleStyle(ripple3)} />

          <View style={styles.iconForeground}>
            <Wifi // Update the component here
              size={Math.min(64, minDimension * 0.15)}
              color="#1D4ED8"
              strokeWidth={2.5}
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isScanning ? 'Starting Scan...' : 'Connect to ESP32'}
          </Text>
          <Text style={styles.description}>
            {isScanning
              ? 'Initializing WiFi modules. Please wait.'
              : 'Securely sync your health data by connecting to your AshaCare device via WiFi.'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isScanning && styles.buttonDisabled]}
          onPress={handleConnect}
          activeOpacity={0.8}
          disabled={isScanning}
        >
          <LinearGradient
            colors={isScanning ? ['#93C5FD', '#BFDBFE'] : ['#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {isScanning ? 'INITIALIZING...' : 'Search for Networks'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconForeground: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: 280,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});