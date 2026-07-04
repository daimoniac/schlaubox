export const strings = {
  appName: 'SchlauBox',
  tagline: 'Verstehen. Üben. Besser werden.',
  login: 'Anmelden',
  register: 'Registrieren',
  email: 'E-Mail',
  password: 'Passwort',
  displayName: 'Anzeigename',
  logout: 'Abmelden',
  home: 'Start',
  scan: 'Scannen',
  settings: 'Einstellungen',
  consentTitle: 'Datenschutz & Einwilligung',
  consentBody:
    'SchlauBox speichert Fotos von Schultests und KI-Analysen in der EU. ' +
    'Es gibt kein Kinder-Login — nur Sie als Elternteil verwalten die Daten. ' +
    'Sie können Daten jederzeit exportieren oder löschen.',
  consentAccept: 'Ich stimme zu',
  addChild: 'Kind hinzufügen',
  childName: 'Name des Kindes',
  birthYear: 'Geburtsjahr',
  save: 'Speichern',
  cancel: 'Abbrechen',
  noChildren: 'Noch kein Kind angelegt',
  noChildrenHint: 'Legen Sie ein Kind an, um Tests zu scannen.',
  scanTest: 'Test scannen',
  fromCamera: 'Kamera',
  fromGallery: 'Galerie',
  processing: 'Wird analysiert…',
  scanFailed: 'Analyse fehlgeschlagen',
  retry: 'Erneut versuchen',
  subjects: 'Fächer',
  strengths: 'Stärken',
  weaknesses: 'Schwächen',
  analysis: 'Analyse',
  grade: 'Note',
  overrideSubject: 'Fach korrigieren',
  exportData: 'Daten exportieren',
  deleteAccount: 'Konto löschen',
  deleteAccountConfirm:
    'Alle Kinder, Scans und Analysen werden unwiderruflich gelöscht.',
  privacy: 'Datenschutzerklärung',
  recentScans: 'Letzte Tests',
  selectChild: 'Kind auswählen',
  deleteScan: 'Test löschen',
  deleteScanConfirm:
    'Foto und Analyse werden unwiderruflich gelöscht.',
  registerSuccess:
    'Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte öffnen Sie den Link, bevor Sie sich anmelden.',
  resendConfirmation: 'Bestätigungs-E-Mail erneut senden',
  resendConfirmationSuccess:
    'E-Mail wurde erneut gesendet. Bitte auch den Spam-Ordner prüfen.',
  errors: {
    generic: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
    auth: 'Anmeldung fehlgeschlagen.',
    invalidCredentials: 'E-Mail oder Passwort ist falsch.',
    emailNotConfirmed:
      'Ihre E-Mail-Adresse ist noch nicht bestätigt. Bitte öffnen Sie den Link in der Aktivierungs-E-Mail und versuchen Sie es danach erneut.',
    userAlreadyExists:
      'Mit dieser E-Mail-Adresse gibt es bereits ein Konto. Melden Sie sich an oder fordern Sie unten eine neue Bestätigungs-E-Mail an.',
    emailRateLimit:
      'Zu viele E-Mails in kurzer Zeit. Bitte warten Sie einige Minuten und versuchen Sie es erneut.',
    camera: 'Kamerazugriff verweigert.',
  },
} as const;
