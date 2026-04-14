import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Activity, X, Smile, Frown, Utensils, Moon, Droplet } from 'lucide-react-native';
import TabBar from '../components/TabBar';

export default function AddEntryScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [painLevel, setPainLevel] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Activity size={20} color={COLORS.primary} strokeWidth={3} />
          <Text style={styles.logoText}>Digital Sanctuary</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <X size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>CODZIENNY MELDUNEK</Text>
          <Text style={styles.title}>Jak się dzisiaj{'\n'}czujesz?</Text>
        </View>


        <View style={styles.painSection}>
          <Text style={styles.sectionTitleSecondary}>Czy bolało?</Text>
          <Text style={styles.painDescription}>Zapisz czy odczuwałeś jakikolwiek ból fizyczny.</Text>
          <View style={styles.painButtonsRow}>
            <TouchableOpacity
              style={[styles.painButton, painLevel === 'No Pain' && styles.painButtonActive]}
              onPress={() => setPainLevel('No Pain')}
            >
              <Text style={[styles.painButtonText, painLevel === 'No Pain' && styles.painButtonTextActive]}>Bez bólu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.painButton, styles.painButtonSecondary, painLevel === 'Yes, it hurt' && styles.painButtonSecondaryActive]}
              onPress={() => setPainLevel('Yes, it hurt')}
            >
              <Text style={[styles.painButtonText, styles.painButtonTextSecondary, painLevel === 'Yes, it hurt' && styles.painButtonTextSecondaryActive]}>Tak, bolało</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Odżywianie</Text>
          <View style={styles.inputContainer}>
            <Utensils size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Co dzisiaj zjadłeś?"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        <View style={[styles.cardSection, { backgroundColor: '#D4E8FA' }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Moon size={20} color={COLORS.primary} />
            </View>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardValue}>8</Text>
              <Text style={styles.cardUnit}>godz</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitleInfo}>Ilość snu</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: '60%' }]} />
            <View style={styles.sliderThumb} />
          </View>
        </View>

        <View style={[styles.cardSection, { backgroundColor: '#CCF2EC' }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Droplet size={20} color={COLORS.primary} />
            </View>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardValue}>1.5</Text>
              <Text style={styles.cardUnit}>L</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitleInfo}>Wypita woda</Text>
          <View style={styles.waterTrackerRow}>
            <View style={styles.waterSegmentActive} />
            <View style={styles.waterSegmentActive} />
            <View style={styles.waterSegmentInactive} />
            <View style={styles.waterSegmentInactive} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Postęp leczenia i notatki</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Opisz jak przebiega leczenie i podziel się swoimi refleksjami..."
              placeholderTextColor={COLORS.textSecondary}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Zapisz dzisiejszy wpis</Text>
        </TouchableOpacity>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Leczenie nie jest liniowe, ale każdy mały wpis to krok w stronę Twojego pełnego zdrowia."
          </Text>
          <Text style={styles.quoteAuthor}>MĄDROŚĆ SANKTUARIUM</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingHorizontal: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.large,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0EDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: SIZES.extraLarge,
  },
  subtitle: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    ...FONTS.bold,
    fontSize: 32,
    color: COLORS.text,
    lineHeight: 40,
    marginTop: 8,
  },
  section: {
    marginBottom: SIZES.extraLarge,
  },
  sectionTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },

  moodText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginTop: 8,
  },
  painSection: {
    backgroundColor: '#E6F2E8',
    borderRadius: SIZES.xxl,
    padding: SIZES.padding,
    marginBottom: SIZES.extraLarge,
  },
  sectionTitleSecondary: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  painDescription: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.medium,
  },
  painButtonsRow: {
    flexDirection: 'row',
    gap: SIZES.medium,
  },
  painButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.xl,
    alignItems: 'center',
  },
  painButtonActive: {
    backgroundColor: COLORS.surface,
  },
  painButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  painButtonTextActive: {
    color: COLORS.text,
  },
  painButtonSecondary: {
    backgroundColor: COLORS.error,
  },
  painButtonSecondaryActive: {
    backgroundColor: '#C55132',
  },
  painButtonTextSecondary: {
    color: COLORS.surface,
  },
  painButtonTextSecondaryActive: {
    color: COLORS.surface,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F2E8',
    borderRadius: SIZES.xl,
    paddingHorizontal: SIZES.medium,
    height: 56,
  },
  inputIcon: {
    marginRight: SIZES.medium,
  },
  input: {
    flex: 1,
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  cardSection: {
    borderRadius: SIZES.xxl,
    padding: SIZES.padding,
    marginBottom: SIZES.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: '#2D5A88',
  },
  cardUnit: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: '#2D5A88',
    marginLeft: 4,
  },
  cardSubtitleInfo: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: '#2D5A88',
    marginBottom: SIZES.medium,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#A0C6EB',
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#2D5A88',
    borderRadius: 3,
  },
  sliderThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2D5A88',
    marginLeft: -7,
  },
  waterTrackerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  waterSegmentActive: {
    flex: 1,
    height: 6,
    backgroundColor: '#357164',
    borderRadius: 3,
  },
  waterSegmentInactive: {
    flex: 1,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  textAreaContainer: {
    backgroundColor: '#E6F2E8',
    borderRadius: SIZES.xxl,
    padding: SIZES.medium,
  },
  textArea: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    height: 100,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.xl,
    paddingVertical: SIZES.medium + 4,
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  primaryButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.surface,
  },
  quoteCard: {
    backgroundColor: '#2B3B2F',
    borderRadius: SIZES.xxl,
    padding: SIZES.padding,
  },
  quoteText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: '#D1E1D4',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: SIZES.medium,
  },
  quoteAuthor: {
    ...FONTS.semiBold,
    fontSize: 10,
    color: '#A4D4B1',
    letterSpacing: 1,
  }
});