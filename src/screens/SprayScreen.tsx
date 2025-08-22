import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { colors, spacing } from '../theme';
import { Card, Button } from '../components/UI';
import { all } from '../storage/db';
import { createSprayLog } from '../services/sync';

export default function SprayScreen() {
  const [plots, setPlots] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selPlot, setSelPlot] = useState<string | null>(null);
  const [product, setProduct] = useState('');
  const [target, setTarget] = useState('');
  const [dosage, setDosage] = useState('');
  const [water, setWater] = useState('');
  const [operator, setOperator] = useState('');

  async function load() {
    const ps = await all('SELECT * FROM plots ORDER BY name ASC');
    const ls = await all(`SELECT s.*, p.name as plot_name FROM sprays s LEFT JOIN plots p ON p.id = s.plot_id ORDER BY s.updated_at DESC LIMIT 30`);
    setPlots(ps);
    setLogs(ls);
  }

  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Log spray</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm }}>
          {plots.length === 0 ? (
            <Text style={{ color: colors.muted }}>Create a plot first</Text>
          ) : (
            plots.map(p => (
              <Pressable key={p.id} onPress={() => setSelPlot(p.id)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: selPlot === p.id ? colors.primary : colors.border, backgroundColor: selPlot === p.id ? '#214d33' : 'transparent' }}>
                <Text style={{ color: colors.text }}>{p.name}</Text>
              </Pressable>
            ))
          )}
        </View>
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TextInput placeholder="Product" value={product} onChangeText={setProduct} placeholderTextColor={colors.muted}
              style={{ flex: 1, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
            <TextInput placeholder="Target pest" value={target} onChangeText={setTarget} placeholderTextColor={colors.muted}
              style={{ flex: 1, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TextInput placeholder="Dosage" value={dosage} onChangeText={setDosage} keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{ flex: 1, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
            <TextInput placeholder="Water (L)" value={water} onChangeText={setWater} keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{ flex: 1, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
          </View>
          <TextInput placeholder="Operator" value={operator} onChangeText={setOperator} placeholderTextColor={colors.muted}
            style={{ color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
          <Button title="Save" onPress={async () => {
            if (!selPlot || !product.trim()) return;
            await createSprayLog(selPlot, product.trim(), target.trim() || undefined, parseFloat(dosage) || undefined, parseFloat(water) || undefined, operator.trim() || undefined);
            setProduct(''); setTarget(''); setDosage(''); setWater(''); setOperator('');
            load();
          }} />
        </View>
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Recent sprays</Text>
        {logs.length === 0 ? (
          <Text style={{ color: colors.muted }}>No records</Text>
        ) : (
          <FlatList data={logs} keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text }}>{item.plot_name || item.plot_id} — {item.product}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{item.target_pest || '-'} • {item.dosage ?? '-'} • {item.water_l ?? '-'}L</Text>
              </View>
            )} />
        )}
      </Card>
    </ScrollView>
  );
}

