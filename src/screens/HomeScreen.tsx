import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../components/UI';
import { colors, spacing } from '../theme';
import { fetchWeather, WeatherDaily } from '../services/weather';
import { syncNow } from '../services/sync';

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [daily, setDaily] = useState<WeatherDaily[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('perm_denied');
        const loc = await Location.getCurrentPositionAsync({});
        const data = await fetchWeather(loc.coords.latitude, loc.coords.longitude, 7);
        setDaily(data.daily || null);
      } catch (e) {
        console.log('weather error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const today = daily?.[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <Card>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm }}>{t('home_weather')}</Text>
        {today ? (
          <View>
            <Text style={{ color: colors.text }}>Rain: {today.rain_prob ?? '-'}%</Text>
            <Text style={{ color: colors.text }}>Wind: {today.wind_max ?? '-'} km/h</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              <Badge good={today.advisory.spray === 'good'} text={today.advisory.spray === 'good' ? t('advisory_spray_good') : t('advisory_spray_bad')} />
              <Badge good={today.advisory.irrigate === 'good'} text={today.advisory.irrigate === 'good' ? t('advisory_irrigate_good') : t('advisory_irrigate_bad')} />
            </View>
          </View>
        ) : (
          <Text style={{ color: colors.muted }}>{loading ? 'Loading…' : 'No data'}</Text>
        )}
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm }}>{t('quick_actions')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Button title={t('add_labour')} onPress={() => navigation.navigate('Labour')} />
          <Button title={t('start_irrigation')} onPress={() => navigation.navigate('Irrigation')} />
          <Button title={t('log_spray')} onPress={() => navigation.navigate('Spray')} />
          <Button title={t('add_note')} onPress={() => navigation.navigate('Notes')} />
        </View>
      </Card>

      <Button title={t('sync_now')} onPress={async () => {
        try {
          const r = await syncNow();
          Alert.alert('Sync', r.ok ? 'Synced successfully' : 'Sync failed');
        } catch (e) {
          Alert.alert('Sync', 'Failed');
        }
      }} />
    </ScrollView>
  );
}

function Badge({ good, text }: { good: boolean; text: string }) {
  return (
    <View style={{ backgroundColor: good ? '#1f3f2a' : '#3f1f1f', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: good ? '#2dbd6e' : '#e55353' }}>
      <Text style={{ color: good ? '#a7eabc' : '#f3b0b0', fontSize: 12 }}>{text}</Text>
    </View>
  );
}

