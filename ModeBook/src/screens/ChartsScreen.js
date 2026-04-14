import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Activity, Moon, Droplets, Wind, Smile, Frown } from 'lucide-react-native';
import TabBar from '../components/TabBar';

export default function ChartsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Activity size={20} color={COLORS.primary} strokeWidth={3} />
            <Text style={styles.logoText}>Digital Sanctuary</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>WEEKLY OVERVIEW</Text>
          <Text style={styles.title}>Your Vital{'\n'}<Text style={styles.titleItalic}>Equilibrium</Text></Text>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI INSIGHTS & RECOMMENDATIONS</Text>

          <View style={[styles.insightCard, { backgroundColor: '#E0F0E3' }]}>
            <View style={styles.insightHeaderRow}>
              <Moon size={16} color={COLORS.primary} />
              <Text style={styles.insightTitle}>Better Rest</Text>
            </View>
            <Text style={styles.insightText}>Spróbuj położyć się 15 minut wcześniej, aby poprawić jakość snu.</Text>
          </View>

          <View style={[styles.insightCard, { backgroundColor: '#E6F0F6' }]}>
            <View style={styles.insightHeaderRow}>
              <Droplets size={16} color="#2D5A88" />
              <Text style={[styles.insightTitle, { color: '#2D5A88' }]}>Hydration Boost</Text>
            </View>
            <Text style={styles.insightText}>Wypij szklankę wody przed następnym posiłkiem.</Text>
          </View>

          <View style={[styles.insightCard, { backgroundColor: '#E0EAE2' }]}>
            <View style={styles.insightHeaderRow}>
              <Wind size={16} color={COLORS.primary} />
              <Text style={styles.insightTitle}>Mindful Moment</Text>
            </View>
            <Text style={styles.insightText}>Znajdź 5 minut na głębokie oddychanie w południe.</Text>
          </View>
        </View>

        <View style={styles.wellnessScore}>
          <View>
            <Text style={styles.wellnessLabel}>Overall wellness</Text>
            <Text style={styles.wellnessValue}>88%</Text>
          </View>
          <View style={styles.wellnessDial}>
            <Activity size={24} color={COLORS.primary} />
          </View>
        </View>

        <View style={styles.chartsContainer}>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Sleep patterns</Text>
                <Text style={styles.chartSubtitle}>Quality duration over the{'\n'}last 7 days</Text>
              </View>
              <View style={styles.avgBadge}>
                <Text style={styles.avgBadgeText}>Avg</Text>
                <Text style={styles.avgBadgeValue}>7.4h</Text>
              </View>
            </View>

            <View style={styles.barChartPlaceholder}>
              <View style={[styles.bar, { height: 40 }]} />
              <View style={[styles.bar, { height: 60 }]} />
              <View style={[styles.bar, { height: 50 }]} />
              <View style={[styles.bar, { height: 75, backgroundColor: COLORS.primary }]} />
              <View style={[styles.bar, { height: 45 }]} />
              <View style={[styles.bar, { height: 80 }]} />
              <View style={[styles.bar, { height: 65 }]} />
            </View>

            <View style={styles.daysRow}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Text key={day} style={styles.chartDayText}>{day}</Text>
              ))}
            </View>
          </View>

          <View style={[styles.chartCard, { backgroundColor: '#A4E8B0' }]}>
            <Text style={styles.chartTitle}>Mood trends</Text>
            <Text style={styles.chartSubtitle}>Emotional resonance</Text>

            <View style={styles.trendRow}>
              <View style={styles.trendIconWrapper}>
                <Smile size={16} color={COLORS.primary} />
              </View>
              <View style={styles.trendBarContainer}>
                <Text style={styles.trendLabel}>SERENE</Text>
                <View style={styles.trendBarTrack}>
                  <View style={[styles.trendBarFill, { width: '65%' }]} />
                </View>
              </View>
              <Text style={styles.trendValue}>65%</Text>
            </View>

            <View style={styles.trendRow}>
              <View style={styles.trendIconWrapper}>
                <Smile size={16} color={COLORS.primary} />
              </View>
              <View style={styles.trendBarContainer}>
                <Text style={styles.trendLabel}>BALANCED</Text>
                <View style={styles.trendBarTrack}>
                  <View style={[styles.trendBarFill, { width: '25%' }]} />
                </View>
              </View>
              <Text style={styles.trendValue}>25%</Text>
            </View>

            <View style={styles.trendRow}>
              <View style={styles.trendIconWrapper}>
                <Frown size={16} color={COLORS.primary} />
              </View>
              <View style={styles.trendBarContainer}>
                <Text style={styles.trendLabel}>TIRED</Text>
                <View style={styles.trendBarTrack}>
                  <View style={[styles.trendBarFill, { width: '10%' }]} />
                </View>
              </View>
              <Text style={styles.trendValue}>10%</Text>
            </View>
          </View>

          <View style={[styles.chartCard, { backgroundColor: '#CCF2F2' }]}>
            <View style={styles.radialChartContainer}>
              <View style={styles.radialDial}>
                <Text style={styles.radialValue}>2.1</Text>
                <Text style={styles.radialUnit}>LITERS</Text>
              </View>
            </View>
            <Text style={styles.chartTitle}>Water intake</Text>
            <Text style={styles.chartSubtitle}>You've reached 75% of your daily hydration target. Keep flowing.</Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Add +250ml</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingHorizontal: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.medium,
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
  titleSection: {
    marginBottom: SIZES.large,
  },
  subtitle: {
    ...FONTS.medium,
    fontSize: 10,
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
  titleItalic: {
    fontStyle: 'italic',
    fontWeight: 'normal',
    color: COLORS.primary,
  },
  insightsSection: {
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: SIZES.medium,
  },
  insightCard: {
    padding: SIZES.medium,
    borderRadius: SIZES.xl,
    marginBottom: SIZES.small,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  insightTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  insightText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  wellnessScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.padding,
    backgroundColor: '#E6F2E8',
    borderRadius: SIZES.xl,
    marginBottom: SIZES.extraLarge,
  },
  wellnessLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  wellnessValue: {
    ...FONTS.bold,
    fontSize: 28,
    color: COLORS.primary,
  },
  wellnessDial: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1E8D5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  chartsContainer: {
    gap: SIZES.medium,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.xxl,
    padding: SIZES.padding,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.medium,
  },
  chartTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 4,
  },
  chartSubtitle: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  avgBadge: {
    backgroundColor: '#D4E8FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.xl,
    alignItems: 'center',
  },
  avgBadgeText: {
    ...FONTS.medium,
    fontSize: 10,
    color: '#2D5A88',
  },
  avgBadgeValue: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: '#2D5A88',
  },
  barChartPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginTop: SIZES.large,
    marginBottom: SIZES.small,
  },
  bar: {
    width: 24,
    backgroundColor: '#E0EAE2',
    borderRadius: 12,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartDayText: {
    ...FONTS.regular,
    fontSize: 10,
    color: COLORS.textSecondary,
    width: 24,
    textAlign: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.medium,
    gap: SIZES.small,
  },
  trendIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBarContainer: {
    flex: 1,
  },
  trendLabel: {
    ...FONTS.semiBold,
    fontSize: 8,
    color: COLORS.primary,
    marginBottom: 4,
  },
  trendBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
  },
  trendBarFill: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
  },
  trendValue: {
    ...FONTS.bold,
    fontSize: 10,
    color: COLORS.primary,
    width: 24,
    textAlign: 'right',
  },
  radialChartContainer: {
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  radialDial: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: '#2B5753',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialValue: {
    ...FONTS.bold,
    fontSize: 24,
    color: '#2B5753',
  },
  radialUnit: {
    ...FONTS.medium,
    fontSize: 10,
    color: '#2B5753',
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: '#2B5753',
    borderRadius: SIZES.xl,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.large,
    alignSelf: 'flex-start',
    marginTop: SIZES.medium,
  },
  actionButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.small,
    color: COLORS.surface,
  }
});
