import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from '../context/AppContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { View, ActivityIndicator } from 'react-native';

function InnerLayout() {
  useProtectedRoute();
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.card },
        headerTitleStyle: { fontWeight: '800', color: COLORS.text, fontSize: 17 },
        headerTintColor: COLORS.accent,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          paddingBottom: 6, paddingTop: 6, height: 62,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, any> = {
            index: 'grid-outline',
            welcome: 'home-outline',
            dashboard: 'home-outline',
            symptoms: 'list-outline',
            result: 'flask-outline',
            history: 'time-outline',
            medication: 'medkit-outline',
            profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      {/* Hide auth screens from tabs */}
      <Tabs.Screen name="index" options={{ href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
      
      <Tabs.Screen name="welcome" options={{ href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="bluetooth" options={{ title: 'Connect', href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="bluetooth-devices" options={{ title: 'Search', href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
      <Tabs.Screen name="symptoms" options={{ title: 'Symptoms' }} />
      <Tabs.Screen name="result" options={{ title: 'Result' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="medication" options={{ title: 'Medication' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <InnerLayout />
      </AppProvider>
    </AuthProvider>
  );
}
