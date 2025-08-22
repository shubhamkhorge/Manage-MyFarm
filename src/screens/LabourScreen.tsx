import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { colors, spacing } from '../theme';
import { Card, Button } from '../components/UI';
import { all } from '../storage/db';
import { createWorker, markAttendance } from '../services/sync';

export default function LabourScreen() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [atts, setAtts] = useState<any[]>([]);

  const [wName, setWName] = useState('');
  const [wType, setWType] = useState<'daily'|'hourly'|'piece'>('daily');
  const [wRate, setWRate] = useState('');

  const [selWorker, setSelWorker] = useState<string | null>(null);
  const [selPlot, setSelPlot] = useState<string | null>(null);
  const [taskType, setTaskType] = useState('General');
  const [hours, setHours] = useState('');
  const [pieces, setPieces] = useState('');

  async function load() {
    const ws = await all('SELECT * FROM workers ORDER BY name ASC');
    const ps = await all('SELECT * FROM plots ORDER BY name ASC');
    const a = await all(`SELECT a.*, w.name as worker_name, p.name as plot_name
                         FROM attendance a
                         LEFT JOIN workers w ON w.id = a.worker_id
                         LEFT JOIN plots p ON p.id = a.plot_id
                         ORDER BY a.date DESC, a.updated_at DESC
                         LIMIT 30`);
    setWorkers(ws);
    setPlots(ps);
    setAtts(a);
  }

  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Add worker</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
          <TextInput placeholder="Name" value={wName} onChangeText={setWName} placeholderTextColor={colors.muted}
            style={{ flex: 1, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
          <TextInput placeholder="Rate" value={wRate} onChangeText={setWRate} keyboardType="numeric" placeholderTextColor={colors.muted}
            style={{ width: 90, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
          {(['daily','hourly','piece'] as const).map(t => (
            <Pressable key={t} onPress={() => setWType(t)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: wType === t ? '#214d33' : 'transparent' }}>
              <Text style={{ color: colors.text, opacity: wType === t ? 1 : 0.7 }}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Button title="Add" onPress={async () => {
          if (!wName) return;
          await createWorker(wName.trim(), wType, parseFloat(wRate) || 0);
          setWName(''); setWRate('');
          load();
        }} />
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Mark attendance</Text>
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {workers.map(w => (
              <Pressable key={w.id} onPress={() => setSelWorker(w.id)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: selWorker === w.id ? colors.primary : colors.border, backgroundColor: selWorker === w.id ? '#214d33' : 'transparent' }}>
                <Text style={{ color: colors.text }}>{w.name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Pressable key={'no-plot'} onPress={() => setSelPlot(null)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: selPlot === null ? colors.primary : colors.border, backgroundColor: selPlot === null ? '#214d33' : 'transparent' }}>
              <Text style={{ color: colors.text }}>No plot</Text>
            </Pressable>
            {plots.map(p => (
              <Pressable key={p.id} onPress={() => setSelPlot(p.id)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: selPlot === p.id ? colors.primary : colors.border, backgroundColor: selPlot === p.id ? '#214d33' : 'transparent' }}>
                <Text style={{ color: colors.text }}>{p.name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TextInput placeholder="Task type" value={taskType} onChangeText={setTaskType} placeholderTextColor={colors.muted}
              style={{ flex: 1, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
            <TextInput placeholder="Hours" value={hours} onChangeText={setHours} keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{ width: 90, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
            <TextInput placeholder="Pieces" value={pieces} onChangeText={setPieces} keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{ width: 90, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
          </View>
          <Button title="Save" onPress={async () => {
            if (!selWorker) return;
            const dateISO = new Date().toISOString();
            await markAttendance(selWorker, dateISO, selPlot, taskType.trim() || 'General', parseFloat(hours) || undefined, parseFloat(pieces) || undefined);
            setHours(''); setPieces('');
            load();
          }} />
        </View>
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Workers</Text>
        {workers.length === 0 ? (
          <Text style={{ color: colors.muted }}>No workers yet</Text>
        ) : (
          <FlatList data={workers} keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{item.wage_type} • {item.rate ?? 0}</Text>
              </View>
            )} />
        )}
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Recent attendance</Text>
        {atts.length === 0 ? (
          <Text style={{ color: colors.muted }}>No records</Text>
        ) : (
          <FlatList data={atts} keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text }}>{item.worker_name || item.worker_id} — {item.task_type}{item.plot_name ? ` @ ${item.plot_name}` : ''}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{item.hours ? `${item.hours}h` : ''}{item.pieces ? ` ${item.pieces} pcs` : ''}</Text>
              </View>
            )} />
        )}
      </Card>
    </ScrollView>
  );
}

