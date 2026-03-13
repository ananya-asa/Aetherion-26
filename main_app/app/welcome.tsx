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
      onPress={() => router.push('/bluetooth' as any)}
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
  );
}

const styles = StyleSheet.create({
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
});
