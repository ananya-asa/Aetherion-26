import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from '../context/AppContext';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  return (
    <AppProvider>
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
              dashboard: 'grid-outline',
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
        <Tabs.Screen name="index"      options={{ title: 'Home', href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="dashboard"  options={{ title: 'Dashboard'  }} />
        <Tabs.Screen name="symptoms"   options={{ title: 'Symptoms'   }} />
        <Tabs.Screen name="result"     options={{ title: 'Result'     }} />
        <Tabs.Screen name="history"    options={{ title: 'History'    }} />
        <Tabs.Screen name="medication" options={{ title: 'Medication' }} />
        <Tabs.Screen name="profile"    options={{ title: 'Profile'    }} />
      </Tabs>
    </AppProvider>
  );
}
