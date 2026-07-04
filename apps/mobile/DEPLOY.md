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

## 2. Umgebungsvariablen für EAS (einmalig)

Lokale Entwicklung nutzt `apps/mobile/.env` (nicht in Git). **EAS-Builds** brauchen dieselben Werte — sonst stürzt die App beim Start ab.

```bash
cd apps/mobile

# Anon-Key auf Expo hinterlegen (Wert aus .env oder Supabase Dashboard)
eas env:create \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "DEIN_ANON_KEY" \
  --environment preview \
  --environment production \
  --visibility plaintext

# URL steht bereits in eas.json; alternativ auch per eas env:create setzen
```

Prüfen:

```bash
eas env:list --environment preview
```

## 3. Preview-Build zum Testen

```bash
npm run eas:build:android   # APK-Download-Link per E-Mail
npm run eas:build:ios       # TestFlight (Apple-Account nötig)
```

Oder beide Plattformen:

```bash
npm run eas:build:preview
```

Build-Status: https://expo.dev/accounts/[dein-account]/projects/schlaubox/builds

## 4. Production-Build für Stores

```bash
npm run eas:build:production
```

## 5. In Stores einreichen

`eas.json` → `submit.production` anpassen:

- **iOS:** `appleId`, `ascAppId`, `appleTeamId`
- **Android:** Google Play Service-Account JSON als `google-play-service-account.json` (nicht committen!)

```bash
npm run eas:submit
```

## 6. Web-App hosten (schlaubox.expo.app)

Die Web-Version der App (Login, Scannen, Analysen) wird separat von der Marketing-Landing-Page gehostet.

### Continuous Deployment (GitHub Actions)

Bei jedem Push auf `main` (Änderungen an `apps/mobile/` oder `packages/`) deployed automatisch:

`.github/workflows/deploy-web-prod.yml` → https://schlaubox.expo.app

**Einmalig einrichten:** [Expo Access Token](https://expo.dev/accounts/[account]/settings/access-tokens) erstellen und als GitHub Repository Secret `EXPO_TOKEN` hinterlegen:

`GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret`

Manuell auslösen: **Actions → Deploy Web to Production → Run workflow**

### Manuell deployen

```bash
cd apps/mobile
npm run web:deploy          # Production → https://schlaubox.expo.app
npm run web:deploy:preview    # Preview-Deployment
```

Das Script lädt Supabase-Env-Variablen aus EAS (`production`), exportiert die Web-App nach `dist/` und deployed via EAS Hosting.

Lokal testen:

```bash
npm run web                   # Dev-Server http://localhost:8081
npm run web:export            # Statischer Export nach dist/ (nutzt lokale .env)
```

**Hinweis:** Galerie-Upload funktioniert im Browser zuverlässig; Kamera hängt vom Browser ab.

## 7. Store-Links auf Landing Page

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
