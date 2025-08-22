import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

export function Card(props: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border }, props.style]}>
      {props.children}
    </View>
  );
}

export function Button(props: { title: string; onPress?: () => void; type?: 'primary'|'danger'|'default' }) {
  const bg = props.type === 'danger' ? colors.danger : props.type === 'primary' ? colors.primary : '#214d33';
  return (
    <Pressable onPress={props.onPress} style={{ backgroundColor: bg, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: 10, alignItems: 'center' }}>
      <Text style={{ color: 'white', fontWeight: '600' }}>{props.title}</Text>
    </Pressable>
  );
}

