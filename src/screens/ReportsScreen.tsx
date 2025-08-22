import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';

export default function ReportsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text }}>Reports (stub): labour cost, spray log, irrigation hours</Text>
    </View>
  );
}

