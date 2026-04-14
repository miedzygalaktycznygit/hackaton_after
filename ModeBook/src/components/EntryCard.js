import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Smile, Heart, Moon, Zap, Activity, Droplets } from 'lucide-react-native';

const getMoodIcon = (mood) => {
  switch (mood) {
    case 'happy': return <Smile size={24} color="#183A20" />;
    case 'balanced': return <Smile size={24} color="#183A20" />;
    case 'neutral': return <Activity size={24} color="#183A20" />;
    default: return <Smile size={24} color="#183A20" />;
  }
};

const getMoodTitle = (date, status) => {
  return `${date}, ${status}`;
};

const Metric = ({ icon, text }) => (
  <View style={styles.metricRow}>
    {icon}
    <Text style={styles.metricText}>{text}</Text>
  </View>
);

const EntryCard = ({ entry }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: entry.iconBg }]}>
            {getMoodIcon(entry.mood)}
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>{entry.dateTitle}</Text>
            <Text style={styles.time}>{entry.time}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: entry.badgeBg }]}>
          <Text style={[styles.statusText, { color: entry.badgeColor || COLORS.text }]}>
            {entry.status}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{entry.description}</Text>

      <View style={styles.metricsContainer}>
        {entry.metrics.map((metric, index) => (
          <Metric key={index} icon={metric.icon} text={metric.text} />
        ))}
      </View>
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
  description: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SIZES.medium,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: SIZES.padding,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
});

export default EntryCard;