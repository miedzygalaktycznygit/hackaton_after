import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/theme';
import { Home, Calendar, BarChart2, Settings } from 'lucide-react-native';

const TabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, (route.name === 'Home' || route.name === 'Calendar') && styles.activeTabBg]}
          onPress={() => navigation.navigate('Home')}
        >
          <Calendar
            size={24}
            color={(route.name === 'Home' || route.name === 'Calendar') ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, route.name === 'Charts' && styles.activeTabBg]}
          onPress={() => navigation.navigate('Charts')}
        >
          <BarChart2
            size={24}
            color={route.name === 'Charts' ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#F7FBF8',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  tabItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBg: {
    backgroundColor: COLORS.activeTab,
  }
});

export default TabBar;
