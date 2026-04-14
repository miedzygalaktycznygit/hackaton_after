import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
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
    dateTitle: 'Wednesday,\nApril 17',
    time: '8:30 AM Reflection',
    status: 'Balanced',
    badgeBg: '#E2F3E7',
    badgeColor: '#183A20',
    description: 'Woke up feeling remarkably rested. The morning air was crisp and the meditation session felt deeper than usual. Energy levels are steady.',
    metrics: [
      { icon: <Heart size={14} color="#55825D" />, text: '92 bpm' },
      { icon: <Moon size={14} color="#2D5A88" />, text: '7h 45m' },
    ]
  },
  {
    id: 2,
    mood: 'happy',
    iconBg: '#CBE5FD',
    dateTitle: 'Tuesday, April\n16',
    time: '9:15 PM Reflection',
    status: 'Radiant',
    badgeBg: '#EAF3FF',
    badgeColor: '#2D5A88',
    description: 'Incredible productivity today. Managed to complete the project milestone and still had energy for a sunset walk in the park. Grateful for the clarity.',
    metrics: [
      { icon: <Zap size={14} color="#183A20" />, text: 'High Focus' },
      { icon: <Activity size={14} color="#2D5A88" />, text: '12,400' },
    ]
  },
  {
    id: 3,
    mood: 'neutral',
    iconBg: '#D1E1D4',
    dateTitle: 'Monday, April\n15',
    time: '7:00 PM Reflection',
    status: 'Restorative',
    badgeBg: '#E8F1E9',
    badgeColor: '#183A20',
    description: 'A bit of a slow start to the week. Focused on hydration and low-impact movement. Feeling slightly drained but emotionally stable.',
    metrics: [
      { icon: <Droplets size={14} color="#A73A3A" />, text: '2.1L Water' },
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
          <Text style={styles.sectionTitle}>Recent Reflections</Text>

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
