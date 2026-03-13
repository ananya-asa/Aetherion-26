import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function HistoryItem({ item }: { item: any }) {
  const [open, setOpen] = useState(false);
  const color = item.severity === 'severe' ? '#EF4444' : item.severity === 'moderate' ? '#F59E0B' : '#10B981';

  return (
    <TouchableOpacity style={styles.item} onPress={() => setOpen(!open)} activeOpacity={0.8}>
      <View style={styles.itemHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemDate}>{item.date}</Text>
          <Text style={styles.itemDiag} numberOfLines={1}>{item.diagnosis}</Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color="#CBD5E1" />
      </View>
      {open && (
        <View style={styles.itemBody}>
          <Text style={styles.fullDiag}>{item.diagnosis}</Text>
          <View style={styles.vitalsRow}>
            <Text style={styles.vitalText}>❤️ {item.vitals.hr} bpm</Text>
            <Text style={styles.vitalText}>🫁 {item.vitals.spo2}%</Text>
            <Text style={styles.vitalText}>🌡️ {item.vitals.temp}°C</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const [userId, setUserId] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchHistory = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Ensure this IP matches your Flask server
      const res = await fetch(`http://192.168.76.183:5000/history/${userId}`);
      const data = await res.json();
      setList(data);
    } catch (e) {
      alert("Search failed. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Health Records</Text>
        <View style={styles.searchBar}>
          <TextInput 
            style={styles.input} 
            placeholder="Search Patient ID..." 
            value={userId}
            onChangeText={setUserId}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={searchHistory}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {list.map((item, i) => <HistoryItem key={i} item={item} />)}
            {list.length === 0 && <Text style={styles.empty}>No records found.</Text>}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20, flex: 1 },
  title: { fontSize: 26, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  searchBar: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 15, padding: 8, marginBottom: 20, elevation: 2 },
  input: { flex: 1, paddingHorizontal: 15, fontSize: 16 },
  searchBtn: { backgroundColor: '#2563EB', padding: 12, borderRadius: 12 },
  item: { backgroundColor: 'white', borderRadius: 15, padding: 16, marginBottom: 12, elevation: 1 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  itemDate: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  itemDiag: { fontSize: 15, color: '#1E293B', fontWeight: '700' },
  itemBody: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  fullDiag: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 10 },
  vitalsRow: { flexDirection: 'row', gap: 15 },
  vitalText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 40 }
});