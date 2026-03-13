import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { vitals, setVitals, bleConnected, setBleConnected } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  // THE FIX: Immediate fetch function
  const fetchRightNow = async () => {
    try {
      const res = await fetch("http://192.168.4.1/status");
      const data = await res.json();
      setVitals(data); // Put whatever data exists into the state
      setBleConnected(true);
    } catch (e) {
      console.log("Initial fetch failed:", e);
    }
  };

  useEffect(() => {
    fetchRightNow(); // Run immediately on load
    
    // Keep polling every 2 seconds for updates
    const interval = setInterval(fetchRightNow, 2000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchRightNow();
    setRefreshing(false);
  }, []);

  // Convert the object into a list, excluding empty or helper states
  const dataKeys = Object.entries(vitals).filter(([key]) => key !== 'isDemo');

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Live Device Data</Text>
        <View style={[styles.badge, { backgroundColor: bleConnected ? '#10B981' : '#EF4444' }]}>
          <Text style={styles.badgeText}>{bleConnected ? 'ACTIVE' : 'OFFLINE'}</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {dataKeys.length > 0 ? (
          dataKeys.map(([key, value]) => (
            <View key={key} style={styles.dataBox}>
              <Text style={styles.keyLabel}>{key.toUpperCase()}</Text>
              <Text style={styles.valueText}>{String(value)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.emptyText}>Pulling data from 192.168.4.1...</Text>
          </View>
        )}
      </View>

      <Text style={styles.footer}>Tip: Pull down to force refresh</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  header: { marginTop: 40, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardContainer: { gap: 12 },
  dataBox: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  keyLabel: { color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  valueText: { fontSize: 22, fontWeight: 'bold', color: '#2563EB' },
  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { marginTop: 20, color: '#94A3B8' },
  footer: { textAlign: 'center', color: '#CBD5E1', fontSize: 11, marginTop: 30 }
});