import { SERVER_URL } from '../config';

export type WeatherDaily = { date: string; t_max: number | null; t_min: number | null; rain_prob: number | null; wind_max: number | null; advisory: { spray: 'good'|'bad'; irrigate: 'good'|'bad' } };

export async function fetchWeather(lat: number, lon: number, days = 7) {
  const url = `${SERVER_URL}/api/weather?lat=${lat}&lon=${lon}&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather_failed');
  return res.json() as Promise<{ current: any; daily: WeatherDaily[] }>;
}

