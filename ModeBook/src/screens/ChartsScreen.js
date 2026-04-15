import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Activity, Moon, Droplets, Smile, Frown, Zap, Heart, Brain } from 'lucide-react-native';
import TabBar from '../components/TabBar';
import { getActiveDate, API_BASE, USER_ID } from '../constants/testConfig';

const TrendBar = ({ label, value, color, icon }) => (
  <View style={styles.trendRow}>
    <View style={styles.trendIconWrapper}>{icon}</View>
    <View style={styles.trendBarContainer}>
      <Text style={styles.trendLabel}>{label}</Text>
      <View style={styles.trendBarTrack}>
        <View style={[styles.trendBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
    <Text style={[styles.trendValue, { color }]}>{value}%</Text>
  </View>
);

export default function ChartsScreen({ navigation }) {
  const [summary, setSummary] = useState(null);
  const [weekNotes, setWeekNotes] = useState([]);
  const [weekAdvices, setWeekAdvices] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = getActiveDate();

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = today.toISOString().split('T')[0];

      // Pobierz wpisy tygodnia z zapisanymi analizami
      const res = await fetch(`${API_BASE}/ai/week-summary/${USER_ID}?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.analysis);
        setWeekNotes(data.weekNotes || []);
      }

      // Pobierz porady (AiAdvice) z tego tygodnia do sekcji rekomendacji
      // Pobieramy pending (oczekujące) ORAZ te z bieżącego dnia (jeszcze nieocenione)
      const advRes = await fetch(`${API_BASE}/notes/week/${USER_ID}?date=${dateStr}`);
      if (advRes.ok) {
        const notes = await advRes.json();
        // Zbierz ID wpisów i pobierz porady dla nich
        // Wyświetlimy ostatnie porady AI jako rekomendacje tygodnia
        setWeekNotes(notes);
      }
    } catch (err) {
      console.log('Błąd pobierania podsumowania:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchSummary(); }, [fetchSummary]));

  // Pobierz porady wyświetlane w sekcji rekomendacji: z ostatniego wpisu tygodnia
  const latestNoteWithAdvice = weekNotes.find(n => n.analysis_json);
  const latestAnalysis = latestNoteWithAdvice
    ? (() => { try { return JSON.parse(latestNoteWithAdvice.analysis_json); } catch { return null; } })()
    : null;

  // Oblicz wynik wellnessowy
  const wellnessScore = summary
    ? Math.max(0, Math.min(100, Math.round(
        (summary.szczescie * 1.2 - summary.stres * 0.5 - summary.smutek * 0.3 - summary.zlosc * 0.4 + 50) / 2
      )))
    : null;

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
          <Text style={styles.subtitle}>PODSUMOWANIE TYGODNIA</Text>
          <Text style={styles.title}>Twoja Życiowa{'\n'}<Text style={styles.titleItalic}>Równowaga</Text></Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Analizuję Twój tydzień z AI...</Text>
          </View>
        ) : summary ? (
          <>
            {/* Wynik ogólny */}
            <View style={styles.wellnessScore}>
              <View>
                <Text style={styles.wellnessLabel}>Ogólne samopoczucie</Text>
                <Text style={styles.wellnessValue}>{wellnessScore}%</Text>
                <Text style={[styles.wellnessLabel, { marginTop: 2 }]}>
                  Wpisy w tym tygodniu: {weekNotes.length}
                </Text>
              </View>
              <View style={[styles.wellnessDial, { borderColor: wellnessScore > 60 ? COLORS.primary : '#E05540' }]}>
                <Text style={{ fontSize: 22 }}>{wellnessScore > 70 ? '😊' : wellnessScore > 40 ? '😐' : '😔'}</Text>
              </View>
            </View>

            {/* Trendy emocji */}
            <View style={[styles.chartCard, { backgroundColor: '#A4E8B0', marginBottom: SIZES.medium }]}>
              <Text style={styles.chartTitle}>Trendy nastroju</Text>
              <Text style={styles.chartSubtitle}>Analiza emocjonalna tygodnia</Text>

              <TrendBar label="RADOŚĆ"  value={summary.szczescie} color="#2E7D32" icon={<Smile  size={14} color="#2E7D32" />} />
              <TrendBar label="SMUTEK"  value={summary.smutek}   color="#1565C0" icon={<Frown  size={14} color="#1565C0" />} />
              <TrendBar label="STRES"   value={summary.stres}    color="#E65100" icon={<Zap    size={14} color="#E65100" />} />
              <TrendBar label="ZŁOŚĆ"   value={summary.zlosc}    color="#B71C1C" icon={<Heart  size={14} color="#B71C1C" />} />
            </View>

            {/* Nastrój + Rekomendacje z bazy (bez re-generowania AI) */}
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>WNIOSKI I REKOMENDACJE AI</Text>

              <View style={[styles.insightCard, { backgroundColor: '#E0F0E3' }]}>
                <View style={styles.insightHeaderRow}>
                  <Brain size={16} color={COLORS.primary} />
                  <Text style={styles.insightTitle}>Ocena nastroju (ostatni wpis)</Text>
                </View>
                <Text style={styles.insightText}>
                  {latestAnalysis ? latestAnalysis.nastroj : summary.nastroj}
                </Text>
              </View>

              {/* Porady z ostatniego wpisu tygodnia */}
              {latestNoteWithAdvice && !latestNoteWithAdvice.analysis_json ? null :
                [1, 2, 3].map(i => {
                  const porada = latestAnalysis?.[`porada${i}`];
                  if (!porada) return null;
                  return (
                    <View key={i} style={[styles.insightCard, { backgroundColor: '#E6F0F6' }]}>
                      <View style={styles.insightHeaderRow}>
                        <Activity size={16} color="#2D5A88" />
                        <Text style={[styles.insightTitle, { color: '#2D5A88' }]}>
                          {porada.category || `Porada ${i}`}
                        </Text>
                      </View>
                      <Text style={styles.insightText}>{porada.text}</Text>
                    </View>
                  );
                })
              }
            </View>
          </>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Brak wpisów w tym tygodniu.{'\n'}Dodaj wpis, aby zobaczyć analizę AI!
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SIZES.padding },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: SIZES.medium, paddingBottom: SIZES.medium,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { ...FONTS.bold, fontSize: SIZES.medium, color: COLORS.text },
  titleSection: { marginBottom: SIZES.large },
  subtitle: {
    ...FONTS.medium, fontSize: 10, color: COLORS.textSecondary,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  title: { ...FONTS.bold, fontSize: 32, color: COLORS.text, lineHeight: 40, marginTop: 8 },
  titleItalic: { fontStyle: 'italic', fontWeight: 'normal', color: COLORS.primary },

  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { ...FONTS.regular, fontSize: SIZES.font, color: COLORS.textSecondary },

  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyText: {
    ...FONTS.regular, fontSize: SIZES.font, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },

  wellnessScore: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SIZES.medium, paddingHorizontal: SIZES.padding,
    backgroundColor: '#E6F2E8', borderRadius: SIZES.xl, marginBottom: SIZES.extraLarge,
  },
  wellnessLabel: { ...FONTS.regular, fontSize: SIZES.small, color: COLORS.textSecondary },
  wellnessValue: { ...FONTS.bold, fontSize: 28, color: COLORS.primary },
  wellnessDial: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3,
  },

  insightsSection: { marginBottom: SIZES.medium },
  sectionTitle: {
    ...FONTS.bold, fontSize: 10, color: COLORS.textSecondary,
    letterSpacing: 1.5, marginBottom: SIZES.medium,
  },
  insightCard: { padding: SIZES.medium, borderRadius: SIZES.xl, marginBottom: SIZES.small },
  insightHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  insightTitle: { ...FONTS.semiBold, fontSize: SIZES.small, color: COLORS.text },
  insightText: {
    ...FONTS.regular, fontSize: SIZES.small, color: COLORS.textSecondary, lineHeight: 18,
  },

  chartCard: { borderRadius: SIZES.xxl, padding: SIZES.padding },
  chartTitle: { ...FONTS.bold, fontSize: SIZES.large, color: COLORS.text, marginBottom: 4 },
  chartSubtitle: {
    ...FONTS.regular, fontSize: SIZES.small, color: COLORS.textSecondary, marginBottom: SIZES.medium,
  },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: SIZES.medium, gap: SIZES.small },
  trendIconWrapper: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  trendBarContainer: { flex: 1 },
  trendLabel: { ...FONTS.semiBold, fontSize: 8, color: COLORS.primary, marginBottom: 4 },
  trendBarTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, overflow: 'hidden',
  },
  trendBarFill: { height: 8, borderRadius: 4 },
  trendValue: { ...FONTS.bold, fontSize: 10, width: 28, textAlign: 'right' },
});
