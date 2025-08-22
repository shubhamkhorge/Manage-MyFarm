import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';

export default function CropPlanScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text }}>Crop stages timeline (stub)</Text>
    </View>
  );
}

