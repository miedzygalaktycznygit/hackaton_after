import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Activity, FileText } from 'lucide-react-native';
import EntryCard from '../components/EntryCard';
import TabBar from '../components/TabBar';
import { API_BASE, USER_ID } from '../constants/testConfig';

export default function EntriesHistoryScreen() {
  const navigation = useNavigation();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 15;

  const fetchNotes = useCallback(async (pageNum = 0, append = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const offset = pageNum * PAGE_SIZE;
      const res = await fetch(`${API_BASE}/notes/all/${USER_ID}?limit=${PAGE_SIZE}&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setNotes(prev => [...prev, ...data]);
        } else {
          setNotes(data);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.log('Błąd pobierania historii:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchNotes(0, false);
  }, [fetchNotes]));

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotes(nextPage, true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => navigation.navigate('EntryDetail', { note: item })}
    >
      <EntryCard note={item} />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    !loading ? (
      <View style={styles.emptyContainer}>
        <FileText size={48} color={COLORS.textSecondary} strokeWidth={1} />
        <Text style={styles.emptyTitle}>Brak wpisów</Text>
        <Text style={styles.emptyText}>Dodaj swój pierwszy wpis zdrowotny na ekranie głównym.</Text>
      </View>
    ) : null
  );

  const renderFooter = () => (
    loading && notes.length > 0 ? (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    ) : null
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Activity size={20} color={COLORS.primary} strokeWidth={3} />
          <Text style={styles.logoText}>MoodBook</Text>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.subtitle}>HISTORIA</Text>
        <Text style={styles.title}>Twoje{'\n'}<Text style={styles.titleItalic}>Wpisy</Text></Text>
      </View>

      {loading && notes.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingTop: SIZES.medium, paddingBottom: SIZES.small, paddingHorizontal: SIZES.padding,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { ...FONTS.bold, fontSize: SIZES.medium, color: COLORS.text },
  titleSection: { paddingHorizontal: SIZES.padding, marginBottom: SIZES.large },
  subtitle: {
    ...FONTS.medium, fontSize: 10, color: COLORS.textSecondary,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  title: { ...FONTS.bold, fontSize: 32, color: COLORS.text, lineHeight: 40, marginTop: 8 },
  titleItalic: { fontStyle: 'italic', fontWeight: 'normal', color: COLORS.primary },
  listContent: { paddingHorizontal: SIZES.padding, paddingBottom: 100, flexGrow: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { ...FONTS.semiBold, fontSize: SIZES.large, color: COLORS.text },
  emptyText: {
    ...FONTS.regular, fontSize: SIZES.font, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 22, maxWidth: 260,
  },
});
