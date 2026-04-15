import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import {
  ArrowLeft, Moon, Droplets, Utensils, AlertTriangle,
  CheckCircle, Activity, Calendar, Clock,
} from 'lucide-react-native';

const MONTHS_PL = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
const DAYS_PL = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];

function formatFullDate(isoString) {
  const d = new Date(isoString);
  return `${DAYS_PL[d.getDay()]}, ${d.getDate()} ${MONTHS_PL[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(isoString) {
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function parsePainFromContent(content) {
  if (!content) return { painLevel: null, painNotes: '', generalNotes: '' };
  const lines = content.split('\n');
  const painLine = lines.find(l => l.startsWith('Ból:')) || '';
  const detailLine = lines.find(l => l.startsWith('Szczegóły bólu:')) || '';
  const notesStart = content.indexOf('Notatki ogólne:');
  const generalNotes = notesStart !== -1 ? content.slice(notesStart + 'Notatki ogólne:'.length).trim() : '';
  return {
    painLevel: painLine.replace('Ból:', '').trim(),
    painNotes: detailLine.replace('Szczegóły bólu:', '').trim(),
    generalNotes,
  };
}

const MetricCard = ({ icon, label, value, color, bg }) => (
  <View style={[styles.metricCard, { backgroundColor: bg }]}>
    <View style={[styles.metricIconBox, { backgroundColor: color + '22' }]}>
      {icon}
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

export default function EntryDetailScreen({ navigation, route }) {
  const { note } = route.params || {};

  if (!note) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ color: COLORS.text, padding: 20 }}>Brak danych wpisu.</Text>
      </SafeAreaView>
    );
  }

  const { painLevel, painNotes, generalNotes } = parsePainFromContent(note.content);
  const hasPain = painLevel === 'Yes, it hurt';

  // Spróbuj sparsować zapisaną analizę AI
  let aiAnalysis = null;
  if (note.analysis_json) {
    try { aiAnalysis = JSON.parse(note.analysis_json); } catch {}
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Activity size={18} color={COLORS.primary} strokeWidth={3} />
          <Text style={styles.headerTitle}>Szczegóły wpisu</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Data i czas */}
        <View style={styles.dateSection}>
          <View style={styles.dateRow}>
            <Calendar size={16} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>{formatFullDate(note.date_added)}</Text>
          </View>
          <View style={styles.dateRow}>
            <Clock size={16} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>Wpis o {formatTime(note.date_added)}</Text>
          </View>
        </View>

        {/* Status bólu */}
        <View style={[styles.painBanner, { backgroundColor: hasPain ? '#FDE8E4' : '#E6F2E8' }]}>
          {hasPain
            ? <AlertTriangle size={20} color="#E05540" />
            : <CheckCircle size={20} color={COLORS.primary} />
          }
          <Text style={[styles.painBannerText, { color: hasPain ? '#8B2010' : '#1A5C4A' }]}>
            {hasPain ? 'Wystąpił ból' : 'Brak bólu'}
          </Text>
        </View>

        {hasPain && painNotes && painNotes !== 'Brak' && (
          <View style={styles.painNotesBox}>
            <Text style={styles.painNotesLabel}>Szczegóły bólu</Text>
            <Text style={styles.painNotesText}>{painNotes}</Text>
          </View>
        )}

        {/* Metryki zdrowia */}
        <Text style={styles.sectionTitle}>PARAMETRY</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon={<Moon size={20} color="#2D5A88" />}
            label="Sen"
            value={`${note.ammout_sleep ?? '—'} h`}
            color="#2D5A88"
            bg="#EBF2FA"
          />
          <MetricCard
            icon={<Droplets size={20} color="#2D8878" />}
            label="Nawodnienie"
            value={`${note.ammout_of_water ?? '—'} L`}
            color="#2D8878"
            bg="#E6F5F2"
          />
        </View>

        {note.nutrition_intake ? (
          <View style={styles.nutritionCard}>
            <View style={styles.nutritionHeader}>
              <Utensils size={16} color="#7A5C2E" />
              <Text style={styles.nutritionLabel}>Odżywianie</Text>
            </View>
            <Text style={styles.nutritionText}>{note.nutrition_intake}</Text>
          </View>
        ) : null}

        {/* Notatki ogólne */}
        {generalNotes ? (
          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>NOTATKI</Text>
            <Text style={styles.notesText}>{generalNotes}</Text>
          </View>
        ) : null}

        {/* Analiza AI (jeśli zapisana) */}
        {aiAnalysis && (
          <>
            <Text style={styles.sectionTitle}>ANALIZA AI</Text>

            {/* Emocje */}
            <View style={styles.emotionsCard}>
              {[
                { label: 'Szczęście', value: aiAnalysis.szczescie, color: '#2E7D32' },
                { label: 'Smutek',    value: aiAnalysis.smutek,    color: '#1565C0' },
                { label: 'Stres',     value: aiAnalysis.stres,     color: '#E65100' },
                { label: 'Złość',     value: aiAnalysis.zlosc,     color: '#B71C1C' },
              ].map(e => (
                <View key={e.label} style={styles.emotionRow}>
                  <Text style={styles.emotionLabel}>{e.label}</Text>
                  <View style={styles.emotionBarTrack}>
                    <View style={[styles.emotionBarFill, { width: `${e.value}%`, backgroundColor: e.color }]} />
                  </View>
                  <Text style={[styles.emotionValue, { color: e.color }]}>{e.value}%</Text>
                </View>
              ))}
            </View>

            {/* Nastrój AI */}
            {aiAnalysis.nastroj ? (
              <View style={styles.moodCard}>
                <Text style={styles.moodText}>{aiAnalysis.nastroj}</Text>
              </View>
            ) : null}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingVertical: SIZES.medium,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...FONTS.semiBold, fontSize: SIZES.medium, color: COLORS.text },

  container: { flex: 1, paddingHorizontal: SIZES.padding },

  dateSection: { marginBottom: SIZES.large, gap: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { ...FONTS.regular, fontSize: SIZES.font, color: COLORS.textSecondary },

  painBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: SIZES.xxl, padding: SIZES.medium, marginBottom: SIZES.medium,
  },
  painBannerText: { ...FONTS.semiBold, fontSize: SIZES.medium },

  painNotesBox: {
    backgroundColor: '#FDF0EE', borderRadius: SIZES.xl,
    padding: SIZES.medium, marginBottom: SIZES.large,
  },
  painNotesLabel: { ...FONTS.semiBold, fontSize: SIZES.small, color: '#8B2010', marginBottom: 4 },
  painNotesText: { ...FONTS.regular, fontSize: SIZES.font, color: '#5C2010', lineHeight: 22 },

  sectionTitle: {
    ...FONTS.bold, fontSize: 10, color: COLORS.textSecondary,
    letterSpacing: 1.5, marginBottom: SIZES.medium, marginTop: SIZES.large,
  },
  metricsGrid: {
    flexDirection: 'row', gap: SIZES.medium, marginBottom: SIZES.medium,
  },
  metricCard: {
    flex: 1, borderRadius: SIZES.xxl, padding: SIZES.medium, alignItems: 'center', gap: 6,
  },
  metricIconBox: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  metricLabel: { ...FONTS.regular, fontSize: SIZES.small, color: COLORS.textSecondary },
  metricValue: { ...FONTS.bold, fontSize: SIZES.large },

  nutritionCard: {
    backgroundColor: '#FFF8F0', borderRadius: SIZES.xl, padding: SIZES.medium, marginBottom: SIZES.small,
  },
  nutritionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nutritionLabel: { ...FONTS.semiBold, fontSize: SIZES.small, color: '#7A5C2E' },
  nutritionText: { ...FONTS.regular, fontSize: SIZES.font, color: COLORS.text, lineHeight: 22 },

  notesCard: { marginBottom: SIZES.medium },
  notesText: {
    ...FONTS.regular, fontSize: SIZES.font, color: COLORS.text,
    lineHeight: 24, backgroundColor: COLORS.surface,
    borderRadius: SIZES.xl, padding: SIZES.medium,
  },

  emotionsCard: {
    backgroundColor: '#A4E8B0', borderRadius: SIZES.xxl, padding: SIZES.padding,
    marginBottom: SIZES.medium,
  },
  emotionRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.medium, gap: SIZES.small,
  },
  emotionLabel: { ...FONTS.semiBold, fontSize: SIZES.small, color: COLORS.text, width: 70 },
  emotionBarTrack: {
    flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, overflow: 'hidden',
  },
  emotionBarFill: { height: 8, borderRadius: 4 },
  emotionValue: { ...FONTS.bold, fontSize: SIZES.small, width: 32, textAlign: 'right' },

  moodCard: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.xl, padding: SIZES.medium, marginBottom: SIZES.medium,
  },
  moodText: { ...FONTS.regular, fontSize: SIZES.font, color: COLORS.textSecondary, lineHeight: 22, fontStyle: 'italic' },
});
