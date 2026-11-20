# Kivalu und die gestohlene Herzglut

Ein Lern-Jump-and-Run für Kinder von 4 bis 9 Jahren. Der kleine Drache Kivalu (Maskottchen von kivalu.at)
holt die gestohlene Herzglut von Baron Ketterich zurück. 7 Kapitel mit je 3 Levels, Endgegner im letzten Kapitel.

## Spielen

- **Android:** Unter *Releases* → `app-test` (Testversion) bzw. `app-aktuell` die Datei `Kivalu.apk` laden und am Gerät öffnen.
- **PC (offline):** Aus demselben Release `Kivalu-PC.html` laden und doppelklicken (Chrome oder Edge). Nichts zu installieren.

Beide Dateien baut GitHub Actions bei jedem Push automatisch (`.github/workflows/android.yml`), kostenlos.

## Lernen

- Fünf Bereiche: Mathe, Schreiben, Lesen, Englisch, Logik (`www/js/tasks.js`).
- Zwei Stufen: **Drachenei** (4–5 Jahre, alles vorgelesen) und **Jungdrache** (6–9 Jahre: Plus/Minus bis 100, Einmaleins bis 100, Diktat, Texte lesen, Englisch, Logikrätsel).
- Jede Kategorie hat einen eigenen Lernstand 1–10: 3 richtige in Folge → schwerer, 2 falsche → leichter. Im Elternbereich einsehbar und änderbar.
- Aufgaben stehen an Runentoren, Zauberbrücken, Sturmwänden und beim Endgegner.

## Aufbau

- `www/` – das Spiel (Phaser 3, ohne Build-Schritt). Einstieg `www/index.html`.
- `www/js/story.js` – Kapitel, Levels, Zwischensequenzen. `www/js/levels.js` – Level-Bausteine.
- `www/js/scenes/level.js` – Spielphysik, Gegner, Tore, Endgegner.
- `scripts/build_pc.py` – baut die PC-Einzeldatei. `scripts/patch_android.py` – passt das Android-Projekt an.
- `tools/` – Skripte, mit denen Kivalus Animationen und die Requisiten aus den 3D-Modellen gerendert wurden.
- Quellen und Lizenzen: `CREDITS.md`.

## Neues Kapitel anhängen

1. In `www/js/story.js` ein Kapitel in `CH` ergänzen (Name, Musik, Kategorien, 3 Levels).
2. Optional Zwischensequenzen in `C` und in `after()` eintragen.
3. Für eine neue Welt Farben in `WORLDS` (`www/js/art.js`) und Deko in `K.DECO` (`www/js/scenes/level.js`) ergänzen.
