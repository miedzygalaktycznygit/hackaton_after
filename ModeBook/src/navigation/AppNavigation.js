import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import AddEntryScreen from '../screens/AddEntryScreen';
import ChartsScreen from '../screens/ChartsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="AddEntry"
          component={AddEntryScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen name="Calendar" component={HomeScreen} />
        <Stack.Screen name="Charts" component={ChartsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
