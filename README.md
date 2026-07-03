# SchlauBox

**Verstehen. Üben. Besser werden.**

Mobile App für Eltern von Grundschulkindern (6–10): Schultests scannen, nach Fächern sortieren, Stärken und Schwächen per KI erkennen.

## Projektstruktur

```
schlaubox/
├── apps/mobile/          # Expo (React Native) App
├── packages/shared/      # Gemeinsame TypeScript-Typen
├── supabase/             # Migrationen & Edge Functions
├── docs/                 # GitHub Pages (Investoren-Pitch)
└── presentation/         # Lokale HTML-Präsentation
```

## Voraussetzungen

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (für lokale Supabase-Instanz)
- [Expo Go](https://expo.dev/go) oder Android/iOS Simulator

## Schnellstart

### 1. Abhängigkeiten

```bash
npm install
```

### 2. Supabase lokal starten

```bash
npm run supabase:start
npm run db:reset
```

Nach `supabase start` die ausgegebenen URL und Keys kopieren.

### 3. Mobile App konfigurieren

```bash
cp .env.example apps/mobile/.env
```

`apps/mobile/.env` ausfüllen:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key aus supabase start>
```

### 4. Edge Functions (lokal)

```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions serve
```

### 5. App starten

```bash
npm run mobile
```

## Produktion (Supabase EU — **schlaubox**)

Projekt: **https://zueyzjacgnnwxnzavyez.supabase.co** (eu-west-1)

Bereits eingerichtet:
- Datenbank-Schema + RLS + Storage-Bucket `scans`
- Edge Functions: `process-scan`, `delete-account`, `export-data`
- Mobile `.env` unter `apps/mobile/.env`

**Noch erforderlich — OpenAI für KI-Analyse:**

Im [Supabase Dashboard → Edge Functions → Secrets](https://supabase.com/dashboard/project/zueyzjacgnnwxnzavyez/settings/functions):

```
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-5.5
```

**App starten:**

```bash
npm run mobile
```

Für lokale Entwicklung mit Remote-Backend reicht die konfigurierte `apps/mobile/.env`.

## Mobile Builds (EAS)

```bash
cd apps/mobile
npx eas-cli login
npx eas init   # projectId in app.json eintragen
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
```

## Investoren-Pitch

- Online: https://daimoniac.github.io/schlaubox/index.html
- Lokal: `presentation/index.html`

## MVP-Funktionen

- Eltern-Registrierung & DSGVO-Einwilligung
- Kinderprofile verwalten
- Tests per Kamera/Galerie scannen
- KI-Analyse (Fach, Note, Stärken/Schwächen)
- Fächer-Übersicht pro Kind
- Fach manuell korrigieren
- Daten exportieren & Konto löschen

## Phase 2 (geplant)

- Automatisch generierte Übungstests mit Lösungen
