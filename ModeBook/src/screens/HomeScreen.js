import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { getActiveDate, API_BASE, USER_ID } from '../constants/testConfig';
import WeeklyCalendar from '../components/WeeklyCalendar';
import EntryCard from '../components/EntryCard';
import TabBar from '../components/TabBar';
import { Activity, Plus } from 'lucide-react-native';

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

export default function HomeScreen({ navigation }) {
  const [weekNotes, setWeekNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = getActiveDate();

  const fetchWeekNotes = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = today.toISOString().split('T')[0]; // "2026-04-15"
      const res = await fetch(`${API_BASE}/notes/week/${USER_ID}?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setWeekNotes(data);
      } else {
        setWeekNotes([]);
      }
    } catch (err) {
      console.log('Błąd pobierania wpisów:', err);
      setWeekNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Odśwież wpisy za każdym razem gdy ekran zyskuje focus (np. po powrocie z AddEntry)
  useFocusEffect(
    useCallback(() => {
      fetchWeekNotes();
    }, [fetchWeekNotes])
  );

  // Sprawdź czy dzisiaj już jest wpis — jeśli tak, ukryj przycisk +
  const hasTodayEntry = weekNotes.some(note => isSameDay(note.date_added, today));

  // Daty wpisów do oznaczania w kalendarzu
  const noteDates = weekNotes.map(n => new Date(n.date_added));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Activity size={20} color={COLORS.primary} strokeWidth={3} />
            <Text style={styles.logoText}>MoodBook</Text>
          </View>
        </View>

        <WeeklyCalendar referenceDate={today} noteDates={noteDates} />

        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Ostatnie Wpisy</Text>

          {loading ? (
            <Text style={styles.emptyText}>Ładowanie...</Text>
          ) : weekNotes.length === 0 ? (
            <Text style={styles.emptyText}>Brak wpisów w tym tygodniu. Dodaj swój pierwszy wpis!</Text>
          ) : (
            weekNotes.map(note => (
              <EntryCard key={note.id} note={note} />
            ))
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Przycisk + znika jeśli dzisiaj już dodano wpis */}
      {!hasTodayEntry && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddEntry')}
        >
          <Plus size={24} color={COLORS.surface} />
        </TouchableOpacity>
      )}

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.small,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  entriesSection: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.extraLarge,
  },
  sectionTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.large,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.extraLarge,
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: SIZES.padding + 80,
    right: SIZES.padding,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
});
