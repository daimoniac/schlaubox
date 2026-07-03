# SchlauBox — App veröffentlichen (EAS)

## Voraussetzungen

- [Expo-Account](https://expo.dev/signup) (kostenlos)
- Apple Developer Program (~99 €/Jahr) für iOS App Store
- Google Play Console (~25 € einmalig) für Android

## 1. EAS einrichten (einmalig)

```bash
cd apps/mobile
npm install -g eas-cli   # optional
eas login
eas init               # verknüpft Projekt, schreibt projectId in app.json
```

## 2. Preview-Build zum Testen

```bash
npm run eas:build:android   # APK-Download-Link per E-Mail
npm run eas:build:ios       # TestFlight (Apple-Account nötig)
```

Oder beide Plattformen:

```bash
npm run eas:build:preview
```

Build-Status: https://expo.dev/accounts/[dein-account]/projects/schlaubox/builds

## 3. Production-Build für Stores

```bash
npm run eas:build:production
```

## 4. In Stores einreichen

`eas.json` → `submit.production` anpassen:

- **iOS:** `appleId`, `ascAppId`, `appleTeamId`
- **Android:** Google Play Service-Account JSON als `google-play-service-account.json` (nicht committen!)

```bash
npm run eas:submit
```

## 5. Store-Links auf Landing Page

Nach Veröffentlichung in [`docs/index.html`](../../docs/index.html) die URLs eintragen:

```javascript
const STORES = {
  ios: 'https://apps.apple.com/app/id...',
  android: 'https://play.google.com/store/apps/details?id=io.schlaubox.app',
};
```

Push nach `main` → GitHub Pages aktualisiert automatisch.

## GitHub Pages (Marketing)

| URL | Inhalt |
|-----|--------|
| `/schlaubox/` | Landing Page |
| `/schlaubox/pitch/` | Investorenpräsentation |

Bundle-ID: `io.schlaubox.app` (iOS + Android)
