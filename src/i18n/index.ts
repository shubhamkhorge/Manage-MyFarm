import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {
    home_weather: 'Weather',
    advisory_spray_good: 'Good to spray',
    advisory_spray_bad: 'Avoid spraying',
    advisory_irrigate_good: 'Irrigate today',
    advisory_irrigate_bad: 'Delay irrigation',
    quick_actions: 'Quick actions',
    add_labour: 'Add Labour',
    start_irrigation: 'Start Irrigation',
    log_spray: 'Log Spray',
    add_note: 'Add Note',
    plots: 'Plots',
    labour: 'Labour',
    irrigation: 'Irrigation',
    spray: 'Spray',
    notes: 'Notes',
    crop_plan: 'Crop Plan',
    reports: 'Reports',
    sync_now: 'Sync now',
    language: 'Language'
  }},
  hi: { translation: {
    home_weather: 'मौसम',
    advisory_spray_good: 'छिड़काव के लिए अच्छा',
    advisory_spray_bad: 'छिड़काव टालें',
    advisory_irrigate_good: 'आज सिंचाई करें',
    advisory_irrigate_bad: 'सिंचाई रोकें',
    quick_actions: 'त्वरित क्रियाएँ',
    add_labour: 'मज़दूर जोड़ें',
    start_irrigation: 'सिंचाई शुरू',
    log_spray: 'स्प्रे दर्ज करें',
    add_note: 'नोट जोड़ें',
    plots: 'खेत/प्लॉट',
    labour: 'मज़दूरी',
    irrigation: 'सिंचाई',
    spray: 'स्प्रे',
    notes: 'नोट्स',
    crop_plan: 'फसल योजना',
    reports: 'रिपोर्ट्स',
    sync_now: 'सिंक करें',
    language: 'भाषा'
  }},
  mr: { translation: {
    home_weather: 'हवामान',
    advisory_spray_good: 'फवारणीसाठी ठीक',
    advisory_spray_bad: 'फवारणी टाळा',
    advisory_irrigate_good: 'आज पाणी द्या',
    advisory_irrigate_bad: 'पाणी देणे थांबवा',
    quick_actions: 'जलद क्रिया',
    add_labour: 'मजूर जोडा',
    start_irrigation: 'पाणी सुरू',
    log_spray: 'फवारणी नोंद',
    add_note: 'नोट जोडा',
    plots: 'शेत/प्लॉट',
    labour: 'मजुरी',
    irrigation: 'पाणी',
    spray: 'फवारणी',
    notes: 'नोट्स',
    crop_plan: 'पिक योजना',
    reports: 'अहवाल',
    sync_now: 'सिंक करा',
    language: 'भाषा'
  }}
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;

