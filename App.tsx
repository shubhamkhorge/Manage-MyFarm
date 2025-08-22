import React, { useEffect } from 'react';
import { Text, View, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import './src/i18n';
import { useTranslation } from 'react-i18next';
import HomeScreen from './src/screens/HomeScreen';
import PlotsScreen from './src/screens/PlotsScreen';
import LabourScreen from './src/screens/LabourScreen';
import IrrigationScreen from './src/screens/IrrigationScreen';
import SprayScreen from './src/screens/SprayScreen';
import NotesScreen from './src/screens/NotesScreen';
import CropPlanScreen from './src/screens/CropPlanScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import { colors } from './src/theme';
import { initDb } from './src/storage/db';

const Tab = createBottomTabNavigator();

function LangSwitcher() {
  const { i18n } = useTranslation();
  return (
    <View style={{ flexDirection: 'row' }}>
      {['en','hi','mr'].map(code => (
        <Pressable key={code} onPress={() => i18n.changeLanguage(code)} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <Text style={{ color: colors.text, opacity: i18n.language === code ? 1 : 0.6 }}>{code.toUpperCase()}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize local DB on app start
    initDb().catch(console.warn);
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          tabBarStyle: { backgroundColor: '#11261a', borderTopColor: '#1b3a26' },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          headerRight: () => <LangSwitcher />,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Plots" component={PlotsScreen} />
        <Tab.Screen name="Labour" component={LabourScreen} />
        <Tab.Screen name="Irrigation" component={IrrigationScreen} />
        <Tab.Screen name="Spray" component={SprayScreen} />
        <Tab.Screen name="Notes" component={NotesScreen} />
        <Tab.Screen name="Crop Plan" component={CropPlanScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

