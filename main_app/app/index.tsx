import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { Hospital, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useOAuth } from '@clerk/clerk-expo';

WebBrowser.maybeCompleteAuthSession();


const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, verifyEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onGoogleSignIn = React.useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/welcome', { scheme: 'healthai' }),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace('/welcome' as any);
      }
    } catch (err) {
      console.error('OAuth error', err);
    } finally {
      setIsGoogleLoading(false);
    }
  }, []);


  const buttonScale = useSharedValue(1);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      alert('Please fill all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        router.replace('/welcome' as any);
      } else {
        await signUp(email, password);
        setIsVerifying(true);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.errors?.[0]?.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      alert('Please enter the verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(verificationCode);
      router.replace('/welcome' as any);
    } catch (e: any) {
      console.error(e);
      alert(e.errors?.[0]?.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#81D4FA', '#01579B']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Animated.View entering={FadeInUp.delay(200).duration(800)} style={[styles.header, isSmallScreen && { marginBottom: 20 }]}>
            <View style={[styles.logoContainer, isSmallScreen && { width: 60, height: 60, borderRadius: 18 }]}>
              <Hospital size={isSmallScreen ? 36 : 48} color="#FFF" strokeWidth={2.5} />
            </View>
            <Text style={[styles.title, isSmallScreen && { fontSize: 26 }]}>AshaCare</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Welcome back, please login' : 'Create your health profile'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.formContainer}>
          <View style={styles.glassCard}>
            {isVerifying ? (
              <View>
                <Text style={styles.verificationTitle}>Verify Your Email</Text>
                <Text style={styles.verificationSubtitle}>Enter the 6-digit code sent to your email</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Verification Code"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="number-pad"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.mainButton}
                  onPress={handleVerify}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={['#0288D1', '#01579B']}
                    style={styles.buttonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>VERIFY EMAIL</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setIsVerifying(false)}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>Back to Sign Up</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {!isLogin && (
                  <View style={styles.inputWrapper}>
                    <User size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                )}

                <View style={styles.inputWrapper}>
                  <Mail size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Lock size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                {!isLogin && (
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.mainButton}
                  onPress={handleAuth}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={['#0288D1', '#01579B']}
                    style={styles.buttonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>
                          {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
                        </Text>
                        <ArrowRight size={20} color="#FFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity 
                  style={[styles.googleButton, isGoogleLoading && { opacity: 0.7 }]}
                  onPress={onGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Chrome size={20} color="#FFF" />
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.toggleContainer}
                  onPress={() => setIsLogin(!isLogin)}
                >
                  <Text style={styles.toggleText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Text style={styles.toggleHighlight}>
                      {isLogin ? 'Sign Up' : 'Log In'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: 250,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  mainButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  verificationTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  toggleHighlight: {
    color: '#FFF',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    height: 60,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  googleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  }
});

