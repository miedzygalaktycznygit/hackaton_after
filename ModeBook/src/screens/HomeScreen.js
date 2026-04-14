import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import WeeklyCalendar from '../components/WeeklyCalendar';
import EntryCard from '../components/EntryCard';
import TabBar from '../components/TabBar';
import { Heart, Moon, Zap, Activity, Droplets, Plus } from 'lucide-react-native';

const ENTRIES = [
  {
    id: 1,
    mood: 'balanced',
    iconBg: '#CCF2EC',
    dateTitle: 'Środa,\n17 Kwietnia',
    time: 'Odbicie z 8:30',
    status: 'Zrównoważony',
    badgeBg: '#E2F3E7',
    badgeColor: '#183A20',
    description: 'Obudziłem się niezwykle wypoczęty. Poranne powietrze było rześkie, a sesja medytacyjna wydawała się głębsza niż zwykle. Poziom energii jest stabilny.',
    metrics: [
      { icon: <Heart size={14} color="#55825D" />, text: '92 bpm' },
      { icon: <Moon size={14} color="#2D5A88" />, text: '7h 45m' },
    ]
  },
  {
    id: 2,
    mood: 'happy',
    iconBg: '#CBE5FD',
    dateTitle: 'Wtorek,\n16 Kwietnia',
    time: 'Odbicie z 21:15',
    status: 'Promienny',
    badgeBg: '#EAF3FF',
    badgeColor: '#2D5A88',
    description: 'Niesamowita produktywność dzisiaj. Udało się ukończyć kamień milowy projektu i wciąż starczyło energii na spacer po parku o zachodzie słońca. Wdzięczny za tę jasność umysłu.',
    metrics: [
      { icon: <Zap size={14} color="#183A20" />, text: 'Wysokie Skupienie' },
      { icon: <Activity size={14} color="#2D5A88" />, text: '12,400' },
    ]
  },
  {
    id: 3,
    mood: 'neutral',
    iconBg: '#D1E1D4',
    dateTitle: 'Poniedziałek,\n15 Kwietnia',
    time: 'Odbicie z 19:00',
    status: 'Odprężający',
    badgeBg: '#E8F1E9',
    badgeColor: '#183A20',
    description: 'Trochę powolny początek tygodnia. Skupiłem się na nawodnieniu i lekkim ruchu. Czułem się nieco wyczerpany, ale stabilny emocjonalnie.',
    metrics: [
      { icon: <Droplets size={14} color="#A73A3A" />, text: '2.1L Wody' },
    ]
  }
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Activity size={20} color={COLORS.primary} strokeWidth={3} />
            <Text style={styles.logoText}>Digital Sanctuary</Text>
          </View>
        </View>

        <WeeklyCalendar currentDate={17} />

        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Ostatnie Wpisy</Text>

          {ENTRIES.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEntry')}
      >
        <Plus size={24} color={COLORS.surface} />
      </TouchableOpacity>

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
  }
});
