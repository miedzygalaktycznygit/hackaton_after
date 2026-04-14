import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dates = [15, 16, 17, 18, 19, 20, 21];

const WeeklyCalendar = ({ currentDate = 17 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>WEEKLY OVERVIEW</Text>
      <Text style={styles.headerDate}>April 2024</Text>

      <View style={styles.calendarCard}>
        <View style={styles.daysRow}>
          {days.map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <Text style={styles.dayText}>{day}</Text>
              <TouchableOpacity
                style={[
                  styles.dateCircle,
                  dates[index] === currentDate && styles.activeDateCircle,
                  dates[index] > currentDate && styles.futureDateCircle
                ]}
              >
                <Text style={[
                  styles.dateText,
                  dates[index] > currentDate && styles.futureDateText
                ]}>
                  {dates[index]}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
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
  dateText: {
    ...FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  futureDateText: {
    color: '#A0BCA6',
  },
});

export default WeeklyCalendar;
