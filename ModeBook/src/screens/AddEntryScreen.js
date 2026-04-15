import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { getActiveDate, API_BASE, USER_ID } from '../constants/testConfig';
import { Activity, X, Utensils, Moon, Droplet, CheckCircle, Circle } from 'lucide-react-native';
import TabBar from '../components/TabBar';


export default function AddEntryScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [painLevel, setPainLevel] = useState(null);
  const [painNotes, setPainNotes] = useState('');
  const [nutrition, setNutrition] = useState('');
  const [sleepHours, setSleepHours] = useState('8');
  const [waterIntake, setWaterIntake] = useState('1.5');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);

  // Poprzednie porady AI oczekujące na ocenę
  const [pendingAdvice, setPendingAdvice] = useState([]);
  // { adviceId, wasFollowed: true/false/null } — stan zaznaczenia
  const [adviceFeedback, setAdviceFeedback] = useState({});

  useEffect(() => {
    const dateStr = getActiveDate().toISOString().split('T')[0];
    fetch(`${API_BASE}/ai/pending-advice/${USER_ID}?date=${dateStr}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPendingAdvice(data);
      })
      .catch(() => { });
  }, []);

  const handleSleepTouch = (evt) => {
    if (sliderWidth > 0) {
      const x = evt.nativeEvent.locationX;
      let hours = Math.round((x / sliderWidth) * 12);
      if (hours < 0) hours = 0;
      if (hours > 12) hours = 12;
      setSleepHours(hours.toString());
    }
  };

  const handleSubmit = async () => {
    if (!painLevel) {
      Alert.alert('Brak danych', 'Proszę zaznaczyć czy wystąpił ból.');
      return;
    }

    setIsSubmitting(true);

    const fullContent = `Ból: ${painLevel}\nSzczegóły bólu: ${painNotes || 'Brak'}\n\nNotatki ogólne:\n${notes}`;
    const activeDate = getActiveDate();
    const hasPainNow = painLevel === 'Yes, it hurt';

    const noteData = {
      userId: USER_ID,
      content: fullContent,
      ammount_sleep: parseFloat(sleepHours) || 0,
      ammount_of_water: parseFloat(waterIntake) || 0,
      nutrition_intake: nutrition,
      date_added: activeDate.toISOString(),
    };

    try {
      // 1. Wyznacz skuteczność poprzednich porad na podstawie bieżącego wpisu
      //    każda kategoria ma swoją logikę oceny
      const getIssuePersists = (category) => {
        const cat = (category || '').toLowerCase();
        // Ból: problem się utrzymuje jeśli dziś też bóli
        if (cat === 'ból' || cat === 'pain' || cat === 'bol') {
          return hasPainNow;
        }
        // Nawodnienie: rada o piciu wody jest nieskuteczna jeśli woda nadal niska
        if (cat === 'nawodnienie' || cat === 'woda') {
          return parseFloat(waterIntake) < 1.5;
        }
        // Sen: rada o śnie jest nieskuteczna jeśli wciąż śpi mało
        if (cat === 'sen' || cat === 'sleep') {
          return parseFloat(sleepHours) < 6;
        }
        // Odżywianie: nieskuteczna jeśli pole jedzenia nadal puste
        if (cat === 'odżywianie' || cat === 'jedzenie') {
          return !nutrition || nutrition.trim().length < 3;
        }
        // Dla kategorii których nie możemy ocenić z formularza — null (nieznana skuteczność)
        return null;
      };

      const feedbackPromises = pendingAdvice.map(adv => {
        const fb = adviceFeedback[adv.id];
        if (fb === undefined || fb === null) return null;
        const issuePersists = getIssuePersists(adv.category);
        return fetch(`${API_BASE}/ai/advice-feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adviceId: adv.id, wasFollowed: fb, issuePersists }),
        });
      }).filter(Boolean);
      await Promise.all(feedbackPromises);

      // 2. Zapisz wpis (pobierz noteId)
      const saveResponse = await fetch(`${API_BASE}/notes/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });

      if (!saveResponse.ok) {
        const errData = await saveResponse.json().catch(() => ({}));
        Alert.alert('Błąd', `Nie udało się zapisać danych: ${errData.error || 'nieznany błąd'}`);
        setIsSubmitting(false);
        return;
      }
      const saveData = await saveResponse.json();
      const noteId = saveData.noteId;

      // 3. Nawiguj natychmiast z flagą ładowania
      navigation.replace('AiResult', { isLoading: true, analysis: null });

      // 4. Wywołaj analizę AI — przekazujemy noteId żeby backend zapisał porady
      const aiResponse = await fetch(`${API_BASE}/ai/analyze-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteData, noteId, userId: USER_ID }),
      });

      if (aiResponse.ok) {
        const result = await aiResponse.json();
        navigation.replace('AiResult', { isLoading: false, analysis: result.analysis });
      } else {
        navigation.replace('AiResult', {
          isLoading: false,
          analysis: {
            nastroj: 'Wpis został zapisany pomyślnie.',
            porada1: { text: 'Analiza AI chwilowo niedostępna.', category: 'ogólne' },
            porada2: { text: 'Spróbuj później.', category: 'ogólne' },
            porada3: { text: 'Dodaj kolejny wpis jutro.', category: 'ogólne' },
            szczescie: 50, smutek: 0, stres: 0, zlosc: 0,
          }
        });
      }
    } catch (error) {
      console.log('Błąd:', error);
      Alert.alert('Błąd połączenia', `Nie można połączyć z serwerem ${API_BASE}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Activity size={20} color={COLORS.primary} strokeWidth={3} />
          <Text style={styles.logoText}>MoodBook</Text>
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

        {/* Poprzednie porady AI - jeśli są */}
        {pendingAdvice.length > 0 && (
          <View style={styles.pendingAdviceSection}>
            <Text style={styles.sectionTitleSecondary}>Porady od AI z poprzedniego dnia</Text>
            <Text style={styles.painDescription}>Zaznacz, które z porad udało Ci się zastosować:</Text>
            {pendingAdvice.map(adv => {
              const fb = adviceFeedback[adv.id];
              return (
                <View key={adv.id} style={styles.adviceRow}>
                  <View style={styles.adviceBadge}>
                    <Text style={styles.adviceBadgeText}>{adv.category}</Text>
                  </View>
                  <Text style={styles.adviceText} numberOfLines={3}>{adv.advicetext}</Text>
                  <View style={styles.adviceButtons}>
                    <TouchableOpacity
                      style={[styles.adviceBtn, fb === true && styles.adviceBtnYes]}
                      onPress={() => setAdviceFeedback(prev => ({ ...prev, [adv.id]: true }))}
                    >
                      <CheckCircle size={16} color={fb === true ? COLORS.surface : COLORS.primary} />
                      <Text style={[styles.adviceBtnText, fb === true && { color: COLORS.surface }]}>Tak</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.adviceBtn, fb === false && styles.adviceBtnNo]}
                      onPress={() => setAdviceFeedback(prev => ({ ...prev, [adv.id]: false }))}
                    >
                      <Circle size={16} color={fb === false ? COLORS.surface : COLORS.error} />
                      <Text style={[styles.adviceBtnText, fb === false && { color: COLORS.surface }]}>Nie</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}


        <View style={styles.painSection}>
          <Text style={styles.sectionTitleSecondary}>Czy bolało?</Text>
          <Text style={styles.painDescription}>Zapisz czy odczuwałeś jakikolwiek ból fizyczny.</Text>
          <View style={styles.painButtonsRow}>
            <TouchableOpacity
              style={[styles.painButton, painLevel === 'No Pain' && styles.painButtonActive]}
              onPress={() => { setPainLevel('No Pain'); setPainNotes(''); }}
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

          {painLevel === 'Yes, it hurt' && (
            <View style={{ marginTop: SIZES.medium, backgroundColor: COLORS.surface, borderRadius: SIZES.xl, paddingHorizontal: SIZES.medium }}>
              <TextInput
                style={[styles.input, { height: 50 }]}
                placeholder="Napisz więcej o tym bólu (opcjonalnie)"
                placeholderTextColor={COLORS.textSecondary}
                value={painNotes}
                onChangeText={setPainNotes}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Odżywianie</Text>
          <View style={styles.inputContainer}>
            <Utensils size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Co dzisiaj zjadłeś?"
              placeholderTextColor={COLORS.textSecondary}
              value={nutrition}
              onChangeText={setNutrition}
            />
          </View>
        </View>

        <View style={[styles.cardSection, { backgroundColor: '#D4E8FA' }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Moon size={20} color={COLORS.primary} />
            </View>
            <View style={styles.cardTitleRow}>
              <TextInput
                style={[styles.cardValue, { padding: 0 }]}
                value={sleepHours}
                onChangeText={setSleepHours}
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.cardUnit}>godz</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitleInfo}>Ilość snu</Text>
          <View
            style={[styles.sliderTrack, { height: 30, backgroundColor: 'transparent', justifyContent: 'center' }]}
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleSleepTouch}
            onResponderMove={handleSleepTouch}
          >
            <View style={{ height: 6, backgroundColor: '#A0C6EB', borderRadius: 3, width: '100%', position: 'absolute' }} />
            <View pointerEvents="none" style={[styles.sliderFill, { width: `${Math.min(100, (parseFloat(sleepHours) || 0) / 12 * 100)}%`, position: 'absolute' }]} />
            <View pointerEvents="none" style={[styles.sliderThumb, { position: 'absolute', left: `${Math.min(100, (parseFloat(sleepHours) || 0) / 12 * 100)}%`, marginLeft: -7 }]} />
          </View>
        </View>

        <View style={[styles.cardSection, { backgroundColor: '#CCF2EC' }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Droplet size={20} color={COLORS.primary} />
            </View>
            <View style={styles.cardTitleRow}>
              <TextInput
                style={[styles.cardValue, { padding: 0 }]}
                value={waterIntake}
                onChangeText={setWaterIntake}
                keyboardType="numeric"
                maxLength={5}
              />
              <Text style={styles.cardUnit}>L</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitleInfo}>Wypita woda</Text>
          <View style={styles.waterTrackerRow}>
            {[1, 2, 3, 4].map((segment) => (
              <TouchableOpacity
                key={segment}
                style={{ flex: 1, height: 30, justifyContent: 'center' }}
                onPress={() => setWaterIntake((segment * 0.5).toString())}
              >
                <View
                  style={(parseFloat(waterIntake) || 0) >= segment * 0.5 ? styles.waterSegmentActive : styles.waterSegmentInactive}
                />
              </TouchableOpacity>
            ))}
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
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.surface} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Zapisz dzisiejszy wpis</Text>
          )}
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
  },
  pendingAdviceSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: SIZES.xxl,
    padding: SIZES.padding,
    marginBottom: SIZES.extraLarge,
    borderLeftWidth: 3,
    borderLeftColor: '#F9A825',
  },
  adviceRow: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.xl,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
  },
  adviceBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: SIZES.small,
    paddingVertical: 2,
    borderRadius: SIZES.small,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  adviceBadgeText: {
    ...FONTS.semiBold,
    fontSize: 10,
    color: '#E65100',
    textTransform: 'uppercase',
  },
  adviceText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SIZES.small,
  },
  adviceButtons: {
    flexDirection: 'row',
    gap: SIZES.small,
  },
  adviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.medium,
    paddingVertical: 6,
    borderRadius: SIZES.xl,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: COLORS.surface,
  },
  adviceBtnYes: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  adviceBtnNo: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  adviceBtnText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
});