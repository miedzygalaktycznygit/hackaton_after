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
  const today = getActiveDate();

  const [weekNotes, setWeekNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchWeekNotes = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const baseDate = new Date(today);
      baseDate.setDate(today.getDate() + offset * 7);
      const dateStr = baseDate.toISOString().split('T')[0];
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

  useFocusEffect(
    useCallback(() => {
      fetchWeekNotes(weekOffset);
    }, [fetchWeekNotes, weekOffset])
  );

  // Aktualizuje wybrany wpis kiedy zmieniają się wpisy w tygodniu lub wybrana data
  React.useEffect(() => {
    const noteForSelectedDay = weekNotes.find(n => isSameDay(n.date_added, selectedDate));
    setSelectedNote(noteForSelectedDay || null);
  }, [weekNotes, selectedDate]);

  // Sprawdź czy dzisiaj już jest wpis (przycisk dodawania widoczny tylko jeśli jesteśmy w bieżącym tygodniu i na dzisiaj brak wpisu)
  const hasTodayEntry = weekOffset === 0 && weekNotes.some(note => isSameDay(note.date_added, today));

  const noteDatesForCalendar = weekNotes.map(n => ({ date: n.date_added, note: n }));

  const formatSelectedDate = (date) => {
    const d = new Date(date);
    if (isSameDay(d, today)) return 'Dzisiaj';
    const DAYS = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Activity size={20} color={COLORS.primary} strokeWidth={3} />
            <Text style={styles.logoText}>MoodBook</Text>
          </View>
        </View>

        <WeeklyCalendar 
          referenceDate={today} 
          selectedDate={selectedDate}
          noteDates={noteDatesForCalendar} 
          weekOffset={weekOffset}
          onWeekOffsetChange={(newOffset) => setWeekOffset(newOffset)}
          onDayPress={(note, date) => {
            setSelectedDate(date);
          }}
        />

        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Wpis z dnia: {formatSelectedDate(selectedDate)}</Text>

          {loading ? (
            <Text style={styles.emptyText}>Ładowanie danych...</Text>
          ) : selectedNote ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('EntryDetail', { note: selectedNote })}
            >
              <EntryCard note={selectedNote} />
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Brak wpisu w tym dniu.</Text>
            </View>
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
    lineHeight: 24,
  },
  emptyCard: {
    padding: SIZES.extraLarge,
    backgroundColor: '#F7FBF8',
    borderRadius: SIZES.large,
    borderWidth: 1,
    borderColor: '#E6F2E8',
    borderStyle: 'dashed',
    marginTop: SIZES.medium,
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
