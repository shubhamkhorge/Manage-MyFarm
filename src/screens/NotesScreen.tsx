import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { colors, spacing } from '../theme';
import { Card, Button } from '../components/UI';
import { all } from '../storage/db';
import { createNote } from '../services/sync';

export default function NotesScreen() {
  const [plots, setPlots] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selPlot, setSelPlot] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');

  async function load() {
    const ps = await all('SELECT * FROM plots ORDER BY name ASC');
    const ns = await all(`SELECT n.*, p.name as plot_name FROM notes n LEFT JOIN plots p ON p.id = n.plot_id ORDER BY n.updated_at DESC LIMIT 50`);
    setPlots(ps);
    setNotes(ns);
  }

  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Add note</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm }}>
          <Pressable key={'no-plot'} onPress={() => setSelPlot(null)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: selPlot === null ? colors.primary : colors.border, backgroundColor: selPlot === null ? '#214d33' : 'transparent' }}>
            <Text style={{ color: colors.text }}>General</Text>
          </Pressable>
          {plots.map(p => (
            <Pressable key={p.id} onPress={() => setSelPlot(p.id)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: selPlot === p.id ? colors.primary : colors.border, backgroundColor: selPlot === p.id ? '#214d33' : 'transparent' }}>
              <Text style={{ color: colors.text }}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput placeholder="Note text" value={text} onChangeText={setText} placeholderTextColor={colors.muted} multiline
          style={{ minHeight: 80, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
        <View style={{ height: spacing.sm }} />
        <TextInput placeholder="Tags (comma separated)" value={tags} onChangeText={setTags} placeholderTextColor={colors.muted}
          style={{ color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 }} />
        <View style={{ height: spacing.sm }} />
        <Button title="Save" onPress={async () => {
          if (!text.trim()) return;
          await createNote(selPlot, text.trim(), tags.trim() || undefined);
          setText(''); setTags('');
          load();
        }} />
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>Recent notes</Text>
        {notes.length === 0 ? (
          <Text style={{ color: colors.muted }}>No notes yet</Text>
        ) : (
          <FlatList data={notes} keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{item.plot_name || 'General'}</Text>
                <Text style={{ color: colors.text }}>{item.text}</Text>
                {item.tags ? <Text style={{ color: colors.muted, fontSize: 12 }}>{item.tags}</Text> : null}
              </View>
            )} />
        )}
      </Card>
    </ScrollView>
  );
}

