import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { colors, spacing } from '../theme';
import { all } from '../storage/db';
import { createPlot } from '../services/sync';

export default function PlotsScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [plots, setPlots] = useState<any[]>([]);

  async function load() {
    const rows = await all('SELECT * FROM plots ORDER BY updated_at DESC');
    setPlots(rows);
  }
  useEffect(() => { load(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.md }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <TextInput placeholder="Plot name" value={name} onChangeText={setName} placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
        <TextInput placeholder="Area" value={area} onChangeText={setArea} keyboardType="numeric" placeholderTextColor={colors.muted} style={{ width: 100, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
        <Pressable onPress={async () => { if (!name) return; await createPlot(name, parseFloat(area)); setName(''); setArea(''); load(); }} style={{ backgroundColor: colors.primary, paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center' }}>
          <Text style={{ color: 'white' }}>Add</Text>
        </Pressable>
      </View>

      <FlatList data={plots} keyExtractor={(item) => item.id} renderItem={({ item }) => (
        <View style={{ padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginBottom: spacing.sm }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{item.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Area: {item.area ?? '-'}</Text>
        </View>
      )} />
    </View>
  );
}

