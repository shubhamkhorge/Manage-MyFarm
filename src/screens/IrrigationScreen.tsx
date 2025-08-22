import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { colors, spacing } from '../theme';
import { Card, Button } from '../components/UI';
import { all } from '../storage/db';
import { createIrrigationLog } from '../services/sync';

export default function IrrigationScreen() {
  const [plots, setPlots] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selPlot, setSelPlot] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [schedule, setSchedule] = useState('manual');

  async function load() {
    const ps = await all('SELECT * FROM plots ORDER BY name ASC');
    const ls = await all(`SELECT i.*, p.name as plot_name FROM irrigation i LEFT JOIN plots p ON p.id = i.plot_id ORDER BY i.updated_at DESC LIMIT 30`);
    setPlots(ps);
    setLogs(ls);
  }

  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Log irrigation</Text>
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
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TextInput placeholder="Duration (min)" value={duration} onChangeText={setDuration} keyboardType="numeric" placeholderTextColor={colors.muted}
            style={{ width: 140, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
          <TextInput placeholder="Schedule (e.g. drip/manual)" value={schedule} onChangeText={setSchedule} placeholderTextColor={colors.muted}
            style={{ flex: 1, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
        </View>
        <Button title="Save" onPress={async () => {
          if (!selPlot) return;
          await createIrrigationLog(selPlot, parseFloat(duration) || 0, schedule.trim() || 'manual');
          setDuration('');
          load();
        }} />
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Recent logs</Text>
        {logs.length === 0 ? (
          <Text style={{ color: colors.muted }}>No records</Text>
        ) : (
          <FlatList data={logs} keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text }}>{item.plot_name || item.plot_id} — {item.duration ?? '-'} min ({item.schedule || '-'})</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{item.actual_start ? new Date(item.actual_start).toLocaleString() : ''}</Text>
              </View>
            )} />
        )}
      </Card>
    </ScrollView>
  );
}

