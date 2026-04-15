import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES } from '../constants/theme';
import { Home, BarChart2, BookOpen } from 'lucide-react-native';

const TabBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    { name: 'Home', icon: Home, routes: ['Home', 'Calendar'] },
    { name: 'History', icon: BookOpen, routes: ['History'] },
    { name: 'Charts', icon: BarChart2, routes: ['Charts'] },
  ];

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = tab.routes.includes(route.name);
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tabItem, isActive && styles.activeTabBg]}
              onPress={() => navigation.navigate(tab.name)}
            >
              <Icon size={24} color={isActive ? COLORS.primary : COLORS.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#F7FBF8',
    paddingBottom: 2,
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
  },
});

export default TabBar;
