import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const DAY_NAMES = ['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'];
const MONTHS_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];

function getWeekDates(referenceDate) {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// referenceDate: "dziś" (z testConfig), noteDates: { date: Date, note: object }[], onDayPress: (note|null, date) => void
const WeeklyCalendar = ({ referenceDate, selectedDate, noteDates = [], onDayPress, weekOffset, onWeekOffsetChange }) => {
  const today = referenceDate ? new Date(referenceDate) : new Date();

  // weekOffset — ile tygodni wstecz/do przodu (0 = bieżący tydzień)
  const offset = weekOffset || 0;

  // Oblicz bazę tygodnia z offsetem
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + offset * 7);

  const weekDates = getWeekDates(baseDate);
  const parsedNoteDates = noteDates.map(item => ({
    date: new Date(item.date || item),
    note: item.note || null,
  }));

  const monday = weekDates[0];
  const sunday = weekDates[6];

  // Nagłówek: jeśli tydzień obejmuje dwa miesiące pokaż oba
  const headerMonth = monday.getMonth() === sunday.getMonth()
    ? `${MONTHS_PL[monday.getMonth()]} ${monday.getFullYear()}`
    : `${MONTHS_PL[monday.getMonth()]} – ${MONTHS_PL[sunday.getMonth()]} ${sunday.getFullYear()}`;

  const isCurrentWeek = offset === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>PODSUMOWANIE TYGODNIA</Text>

      {/* Nawigacja między tygodniami */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => onWeekOffsetChange && onWeekOffsetChange(offset - 1)}
        >
          <ChevronLeft size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.headerDate}>{headerMonth}</Text>

        <TouchableOpacity
          style={[styles.arrowBtn, isCurrentWeek && styles.arrowDisabled]}
          onPress={() => !isCurrentWeek && onWeekOffsetChange && onWeekOffsetChange(offset + 1)}
          disabled={isCurrentWeek}
        >
          <ChevronRight size={20} color={isCurrentWeek ? '#C0C0C0' : COLORS.primary} />
        </TouchableOpacity>
      </View>

      {!isCurrentWeek && (
        <TouchableOpacity onPress={() => onWeekOffsetChange && onWeekOffsetChange(0)} style={styles.goToCurrentBtn}>
          <Text style={styles.goToCurrentText}>Wróć do bieżącego tygodnia</Text>
        </TouchableOpacity>
      )}

      <View style={styles.calendarCard}>
        <View style={styles.daysRow}>
          {weekDates.map((date, index) => {
            const isToday = isSameDay(date, today) && isCurrentWeek;
            const isSelected = selectedDate && isSameDay(date, new Date(selectedDate));
            const isFuture = date > today && !isSameDay(date, today);
            const noteItem = parsedNoteDates.find(nd => isSameDay(nd.date, date));
            const hasNote = !!noteItem;

            return (
              <TouchableOpacity
                key={index}
                style={styles.dayColumn}
                onPress={() => onDayPress && onDayPress(noteItem?.note || null, date)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayText, 
                  isToday && { color: COLORS.primary, fontWeight: 'bold' },
                  isSelected && { color: COLORS.primary }
                ]}>
                  {DAY_NAMES[index]}
                </Text>
                <View style={[
                  styles.dateCircle,
                  isToday && styles.activeDateCircle,
                  isFuture && styles.futureDateCircle,
                  hasNote && styles.noteDateCircle,
                  isSelected && styles.selectedDateCircle,
                ]}>
                  <Text style={[
                    styles.dateText,
                    isFuture && styles.futureDateText,
                    hasNote && styles.noteDateText,
                    isSelected && styles.selectedDateText,
                  ]}>
                    {date.getDate()}
                  </Text>
                </View>
                {hasNote && <View style={[styles.noteDot, isSelected && { backgroundColor: COLORS.surface }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: SIZES.padding, paddingTop: SIZES.extraLarge },
  headerTitle: {
    ...FONTS.medium, fontSize: SIZES.small, color: COLORS.textSecondary,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 4, marginBottom: SIZES.small,
  },
  arrowBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  arrowDisabled: { backgroundColor: '#F0F0F0' },
  headerDate: { ...FONTS.bold, fontSize: SIZES.large + 2, color: COLORS.text, flex: 1, textAlign: 'center' },
  goToCurrentBtn: { alignSelf: 'center', marginBottom: SIZES.small },
  goToCurrentText: {
    ...FONTS.medium, fontSize: SIZES.small, color: COLORS.primary, textDecorationLine: 'underline',
  },
  calendarCard: {
    backgroundColor: '#E6F2E8', borderRadius: SIZES.xxl,
    padding: SIZES.medium, paddingVertical: SIZES.extraLarge,
  },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayColumn: { alignItems: 'center', width: 36 },
  dayText: { ...FONTS.medium, fontSize: 10, color: COLORS.textSecondary, marginBottom: SIZES.small },
  dateCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  activeDateCircle: { borderWidth: 2, borderColor: COLORS.primary },
  selectedDateCircle: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  futureDateCircle: { backgroundColor: '#F3F9F4' },
  noteDateCircle: { backgroundColor: '#A4E8B0' },
  dateText: { ...FONTS.semiBold, fontSize: SIZES.font, color: COLORS.text },
  futureDateText: { color: '#A0BCA6' },
  noteDateText: { color: COLORS.text },
  selectedDateText: { color: COLORS.surface },
  noteDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 3 },
});

export default WeeklyCalendar;
