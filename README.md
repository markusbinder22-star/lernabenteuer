# Purzeltal – Lernabenteuer

Ein Lern-Jump'n'Run für Kinder von 4 bis 7 Jahren. Das Kind gestaltet sich selbst als Flicker-Lehrling,
zieht mit Ranzl, dem sprechenden Rucksack, durchs Purzeltal und repariert mit Rechenaufgaben den Mühlberg.

Läuft als **Android-App (APK)** und im **Browser**, komplett offline, ohne Werbung, ohne Konto, ohne Server.
Spielstände bleiben auf dem Gerät.

## Was in dieser Version drin ist

| Bereich | Inhalt |
|---|---|
| Prolog | Bilderbuch-Einstieg (Zausel wirbelt das Tal durcheinander), Ankunft mit dem Postbus, Meisterin Pfeffer übergibt Ranzl, erste Mini-Reparatur (3 Knöpfe einsammeln) |
| Zauberspiegel | Avatar ohne Lesen gestalten: Mädchen/Bub/Kind, 6 Hauttöne, 5 Frisuren, 6 Haarfarben, 3 Oberteile, Hose/Rock/Latzhose in je 4 Farben, Brille |
| Profile | Bis zu 6 Kinder pro Gerät, Startbild zeigt die Avatare (4-Jährige finden sich ohne Lesen) |
| Welt | Dorf (Werkstatt, Knopfladen, Baumhaus, Musikpavillon), Weg mit Grube, Silbensteinen, Rätselstein, Truhe auf dem Felsen, Mühlberg |
| Stationen | Brücke, Hühnerhof, Marktstand, Mühle – je 4 Aufgaben, jeweils in Spatzen- (4–5) und Füchse-Variante (6–7) |
| Lernen | Schwierigkeit passt sich pro Fähigkeit an (5 Stufen), Hilfe in 3 Stufen statt Strafe, Radiergummi rettet den Bonus-Stern |
| Bonus | Silbenspringen (für jede Silbe einmal springen) und Rätselstein (1 Rätsel pro Tag) |
| Belohnungen | Knopf-Taler, Knopfladen (4 Hüte, 2 Ranzl-Anhänger, 2 Baumhaus-Sachen, Radiergummi), Spar-Glas, 10 Sticker, Sprungfedern (Doppelsprung), Piratenhut in der Truhe, Fest mit Tuba |
| Speichern | Automatisch, Speicher-Knopf, Rastbänke, Sicherung im Elternbereich |
| Elternbereich | Erwachsenen-Tor, Lernstand als Ampel, Profile, Spielzeit-Wecker, Steuerung (Pfeile oder „Tipp dorthin“), eigene Stimme aufnehmen |

## Android-App

Die APK wird bei jeder Änderung automatisch von GitHub gebaut (Reiter **Actions** → „Android-App bauen“).
Die fertige Datei liegt unter **Releases**:

- `app-aktuell` – Stand von `main`
- `app-test` – Stand des letzten Entwicklungs-Zweigs (zum Ausprobieren vor dem Übernehmen)

Updates einfach über die alte App installieren: Der Signaturschlüssel ist immer derselbe, deshalb bleiben die Spielstände erhalten.
Achtung: **App deinstallieren löscht die Spielstände.** Vorher im Elternbereich eine Sicherung machen.

## Am PC spielen (ohne Installation)

Im selben Release liegt `Purzeltal-PC.html`: das ganze Spiel in einer Datei. Herunterladen, doppelklicken, läuft offline in Chrome oder Edge.
Steuerung: Pfeiltasten, Leertaste zum Springen, Enter zum Benutzen (oder mit der Maus klicken).
Spielstände liegen im Browser dieses PCs. Browserdaten löschen löscht sie, deshalb ab und zu im Elternbereich sichern.
Gebaut wird die Datei mit `python3 scripts/build_pc.py` → `dist/Purzeltal.html`.

## Im Browser spielen

Der Ordner `www/` ist das ganze Spiel (reines HTML/JavaScript, kein Build-Schritt).
Zum Hosten eignen sich z. B. GitHub Pages (für private Repos nur mit kostenpflichtigem GitHub-Plan) oder Cloudflare Pages (gratis, auch mit privatem Repo).

## Technik

- Reines HTML, CSS und JavaScript, alles im Code gezeichnet (keine Grafik- oder Audiodateien, keine Lizenzfragen)
- Sprachausgabe: eigene Aufnahmen → Android-Sprachausgabe (in der App) → Browser-Stimme
- Android-Hülle: Capacitor 6, gebaut in GitHub Actions (`.github/workflows/android.yml`)
- `android-signing/debug.keystore` ist ein reiner Debug-Schlüssel (Passwort `android`), damit Updates sich installieren lassen. Für eine Veröffentlichung im Play Store braucht es später einen eigenen, geheimen Schlüssel.
