import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Moon, Droplet, Utensils, ActivitySquare } from 'lucide-react-native';

const MONTHS_PL = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
const DAYS_PL = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

function formatDate(isoString) {
  const d = new Date(isoString);
  return `${DAYS_PL[d.getDay()]}, ${d.getDate()} ${MONTHS_PL[d.getMonth()]}`;
}

function formatTime(isoString) {
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `Wpis o ${h}:${m}`;
}

function parsePainFromContent(content) {
  if (!content) return { painLevel: 'Brak danych', painNotes: '' };
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

const EntryCard = ({ note }) => {
  if (!note) return null;
  const { painLevel, painNotes, generalNotes } = parsePainFromContent(note.content);
  const hasPain = painLevel === 'Yes, it hurt';
  const cardBg = hasPain ? '#FDE8E4' : '#E6F2E8';
  const badgeBg = hasPain ? '#F9C8C0' : '#CCF2EC';
  const badgeColor = hasPain ? '#8B2010' : '#1A5C4A';
  const statusText = hasPain ? '⚠ Był ból' : '✓ Bez bólu';

  return (
    <View style={[styles.card, { borderLeftColor: hasPain ? '#E05540' : COLORS.primary, borderLeftWidth: 3 }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: cardBg }]}>
            <ActivitySquare size={22} color={hasPain ? '#E05540' : COLORS.primary} />
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>{formatDate(note.date_added)}</Text>
            <Text style={styles.time}>{formatTime(note.date_added)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.statusText, { color: badgeColor }]}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        {note.ammout_sleep != null && (
          <View style={styles.metricRow}>
            <Moon size={14} color="#2D5A88" />
            <Text style={styles.metricText}>{note.ammout_sleep}h snu</Text>
          </View>
        )}
        {note.ammout_of_water != null && (
          <View style={styles.metricRow}>
            <Droplet size={14} color="#2D8878" />
            <Text style={styles.metricText}>{note.ammout_of_water}L wody</Text>
          </View>
        )}
        {note.nutrition_intake ? (
          <View style={styles.metricRow}>
            <Utensils size={14} color="#7A5C2E" />
            <Text style={styles.metricText} numberOfLines={1}>{note.nutrition_intake}</Text>
          </View>
        ) : null}
      </View>

      {generalNotes ? (
        <Text style={styles.description} numberOfLines={3}>{generalNotes}</Text>
      ) : null}

      {hasPain && painNotes && painNotes !== 'Brak' ? (
        <View style={styles.painNotesBox}>
          <Text style={styles.painNotesText}>🩹 {painNotes}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.xxl,
    padding: SIZES.padding,
    marginBottom: SIZES.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.medium,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.medium,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  time: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SIZES.small,
    paddingVertical: 4,
    borderRadius: SIZES.small,
  },
  statusText: {
    ...FONTS.medium,
    fontSize: 10,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.medium,
    marginBottom: SIZES.small,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  description: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SIZES.small,
  },
  painNotesBox: {
    backgroundColor: '#FDF0EE',
    borderRadius: SIZES.medium,
    padding: SIZES.small,
    marginTop: SIZES.small,
  },
  painNotesText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: '#8B2010',
  },
});

export default EntryCard;