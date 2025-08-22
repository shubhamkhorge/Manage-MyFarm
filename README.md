# FarmMVP (Expo + React Native)

A simple farm management MVP built with Expo (SDK 51), React Native 0.74, and React Navigation. It includes localization (i18next), basic tab navigation, and local SQLite storage.

## Quick start

- Install dependencies (if needed):
  - npm install
- Start the dev server:
  - npm start
- Open the app:
  - Press "a" in the terminal to launch Android emulator, or scan the QR code with Expo Go on your device.

Notes:
- Location permissions are configured via the Expo Location plugin. You’ll be prompted on first use.
- Server URL defaults per platform via a helper:
  - Android emulator -> http://10.0.2.2:3000
  - iOS/web/others -> http://localhost:3000
  - You can override with process.env.SERVER_URL if you wire an env solution.

## Scripts

- npm start – Start Expo dev server
- npm run android – Build/run Android
- npm run ios – Build/run iOS
- npm run web – Run on web

## Directory structure

- App.tsx – App entry, navigation setup
- index.js – Expo entry
- src/
  - screens/ – Feature tabs
  - storage/ – SQLite initialization
  - i18n/ – Localization setup
  - theme.ts – Colors and UI tokens
  - config/ – SERVER_URL helper

## Permissions

- Location (foreground) via expo-location plugin configuration in app.json.

## Troubleshooting

- Android emulator cannot reach localhost on the host; use 10.0.2.2.
- If Metro cache causes oddities, stop server and run: npx expo start --clear
- Windows line-endings: repo prefers LF; your Git may auto-convert. You can set core.autocrlf=input to avoid warnings.

