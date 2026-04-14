import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const DAY_NAMES = ['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'];
const MONTHS_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];

// Oblicza tablicę dat (pon–nie) dla tygodnia zawierającego `referenceDate`
function getWeekDates(referenceDate) {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0=niedziela
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

// noteDates: tablica dat (Date lub string ISO) wpisów z tego tygodnia
const WeeklyCalendar = ({ referenceDate, noteDates = [] }) => {
  const today = referenceDate ? new Date(referenceDate) : new Date();
  const weekDates = getWeekDates(today);
  const parsedNoteDates = noteDates.map(d => new Date(d));

  const monday = weekDates[0];
  const headerMonth = `${MONTHS_PL[monday.getMonth()]} ${monday.getFullYear()}`;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>PODSUMOWANIE TYGODNIA</Text>
      <Text style={styles.headerDate}>{headerMonth}</Text>

      <View style={styles.calendarCard}>
        <View style={styles.daysRow}>
          {weekDates.map((date, index) => {
            const isToday = isSameDay(date, today);
            const isFuture = date > today && !isSameDay(date, today);
            const hasNote = parsedNoteDates.some(nd => isSameDay(nd, date));

            return (
              <View key={index} style={styles.dayColumn}>
                <Text style={styles.dayText}>{DAY_NAMES[index]}</Text>
                <View
                  style={[
                    styles.dateCircle,
                    isToday && styles.activeDateCircle,
                    isFuture && styles.futureDateCircle,
                    hasNote && styles.noteDateCircle,
                  ]}
                >
                  <Text style={[
                    styles.dateText,
                    isFuture && styles.futureDateText,
                    hasNote && styles.noteDateText,
                  ]}>
                    {date.getDate()}
                  </Text>
                </View>
                {hasNote && <View style={styles.noteDot} />}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.extraLarge,
  },
  headerTitle: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerDate: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge * 1.2,
    color: COLORS.text,
    marginTop: 4,
    marginBottom: SIZES.medium,
  },
  calendarCard: {
    backgroundColor: '#E6F2E8',
    borderRadius: SIZES.xxl,
    padding: SIZES.medium,
    paddingVertical: SIZES.extraLarge,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    width: 36,
  },
  dayText: {
    ...FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: SIZES.small,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDateCircle: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  futureDateCircle: {
    backgroundColor: '#F3F9F4',
  },
  noteDateCircle: {
    backgroundColor: COLORS.primary,
  },
  dateText: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  futureDateText: {
    color: '#A0BCA6',
  },
  noteDateText: {
    color: COLORS.surface,
  },
  noteDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 3,
  },
});

export default WeeklyCalendar;
