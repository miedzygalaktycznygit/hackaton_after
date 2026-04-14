import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Activity, Smile, Frown, Zap, Heart, CheckCircle } from 'lucide-react-native';

const EmotionBar = ({ label, value, color, icon }) => (
  <View style={styles.emotionRow}>
    <View style={styles.emotionLabelRow}>
      {icon}
      <Text style={styles.emotionLabel}>{label}</Text>
      <Text style={[styles.emotionValue, { color }]}>{value}%</Text>
    </View>
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  </View>
);

export default function AiResultScreen({ navigation, route }) {
  const { analysis, isLoading } = route.params || {};

  if (isLoading || !analysis) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analizuję Twój wpis...{'\n'}To może chwilę potrwać</Text>
        </View>
      </SafeAreaView>
    );
  }

  const wellnessScore = Math.round(
    (analysis.szczescie * 1.2 - analysis.stres * 0.5 - analysis.smutek * 0.3 - analysis.zlosc * 0.4 + 50) / 2
  );
  const clampedScore = Math.max(0, Math.min(100, wellnessScore));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Activity size={20} color={COLORS.primary} strokeWidth={3} />
            <Text style={styles.logoText}>MoodBook</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>ANALIZA AI</Text>
          <Text style={styles.title}>Twój Dzienny{'\n'}<Text style={styles.titleAccent}>Raport</Text></Text>
        </View>

        {/* Wynik ogólny */}
        <View style={styles.scoreCard}>
          <View>
            <Text style={styles.scoreLabel}>Ogólne samopoczucie</Text>
            <Text style={styles.scoreValue}>{clampedScore}%</Text>
          </View>
          <View style={[styles.scoreDial, { borderColor: clampedScore > 60 ? COLORS.primary : '#E05540' }]}>
            <Text style={styles.scoreEmoji}>
              {clampedScore > 70 ? '😊' : clampedScore > 40 ? '😐' : '😔'}
            </Text>
          </View>
        </View>

        <View style={styles.moodCard}>
          <View style={styles.moodHeader}>
            <Smile size={18} color={COLORS.primary} />
            <Text style={styles.moodTitle}>Nastrój</Text>
          </View>
          <Text style={styles.moodText}>{analysis.nastroj}</Text>
        </View>

        <View style={styles.emotionsCard}>
          <Text style={styles.cardSectionTitle}>TRENDY EMOCJONALNE</Text>
          <EmotionBar label="Szczęście" value={analysis.szczescie} color="#2E7D32" icon={<Smile size={14} color="#2E7D32" style={{ marginRight: 4 }} />} />
          <EmotionBar label="Smutek" value={analysis.smutek} color="#1565C0" icon={<Frown size={14} color="#1565C0" style={{ marginRight: 4 }} />} />
          <EmotionBar label="Stres" value={analysis.stres} color="#E65100" icon={<Zap size={14} color="#E65100" style={{ marginRight: 4 }} />} />
          <EmotionBar label="Złość" value={analysis.zlosc} color="#B71C1C" icon={<Heart size={14} color="#B71C1C" style={{ marginRight: 4 }} />} />
        </View>

        <View style={styles.recommendCard}>
          <View style={styles.moodHeader}>
            <CheckCircle size={18} color={COLORS.primary} />
            <Text style={styles.moodTitle}>Rekomendacje</Text>
          </View>
          <Text style={styles.moodText}>{analysis.rekomendacje}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.primaryButtonText}>Wróć do strony głównej</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SIZES.padding },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  loadingText: {
    ...FONTS.medium, fontSize: SIZES.font, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },
  header: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingTop: SIZES.medium, paddingBottom: SIZES.small,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { ...FONTS.bold, fontSize: SIZES.large, color: COLORS.text },
  titleSection: { marginBottom: SIZES.extraLarge },
  subtitle: {
    ...FONTS.medium, fontSize: SIZES.small, color: COLORS.textSecondary,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  title: { ...FONTS.bold, fontSize: 32, color: COLORS.text, lineHeight: 40, marginTop: 8 },
  titleAccent: { color: COLORS.primary, fontStyle: 'italic' },

  scoreCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#E6F2E8', borderRadius: SIZES.xxl,
    padding: SIZES.padding, marginBottom: SIZES.medium,
  },
  scoreLabel: { ...FONTS.regular, fontSize: SIZES.small, color: COLORS.textSecondary },
  scoreValue: { ...FONTS.bold, fontSize: 36, color: COLORS.primary },
  scoreDial: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  scoreEmoji: { fontSize: 26 },

  moodCard: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.xxl,
    padding: SIZES.padding, marginBottom: SIZES.medium,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  moodHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SIZES.small },
  moodTitle: { ...FONTS.semiBold, fontSize: SIZES.medium, color: COLORS.text },
  moodText: { ...FONTS.regular, fontSize: SIZES.font, color: COLORS.textSecondary, lineHeight: 22 },

  emotionsCard: {
    backgroundColor: '#A4E8B0', borderRadius: SIZES.xxl,
    padding: SIZES.padding, marginBottom: SIZES.medium,
  },
  cardSectionTitle: {
    ...FONTS.bold, fontSize: 10, color: COLORS.primary,
    letterSpacing: 1.5, marginBottom: SIZES.medium,
  },
  emotionRow: { marginBottom: SIZES.medium },
  emotionLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  emotionLabel: { ...FONTS.semiBold, fontSize: SIZES.small, color: COLORS.text, flex: 1 },
  emotionValue: { ...FONTS.bold, fontSize: SIZES.small },
  barTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4, overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4 },

  recommendCard: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.xxl,
    padding: SIZES.padding, marginBottom: SIZES.extraLarge,
    borderLeftWidth: 4, borderLeftColor: COLORS.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },

  primaryButton: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.xl,
    paddingVertical: SIZES.medium + 4, alignItems: 'center',
  },
  primaryButtonText: { ...FONTS.semiBold, fontSize: SIZES.font, color: COLORS.surface },
});
