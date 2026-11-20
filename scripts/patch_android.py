"""Passt das von Capacitor erzeugte Android-Projekt an Kivalu an.
Läuft automatisch in GitHub Actions nach `npx cap add android`."""
import re
from pathlib import Path

manifest = Path("android/app/src/main/AndroidManifest.xml")
xml = manifest.read_text(encoding="utf-8")

# Sprachausgabe: ab Android 11 muss die App angeben, dass sie TTS-Dienste sucht
if "android.intent.action.TTS_SERVICE" not in xml:
    xml = xml.replace(
        "</manifest>",
        '    <queries>\n        <intent>\n            <action android:name="android.intent.action.TTS_SERVICE" />\n        </intent>\n    </queries>\n</manifest>',
    )

# Querformat (Handy und Tablet drehen sich mit, bleiben aber quer)
if "android:screenOrientation" not in xml:
    xml = re.sub(r"<activity\b", '<activity\n            android:screenOrientation="sensorLandscape"', xml, count=1)

manifest.write_text(xml, encoding="utf-8")
print("AndroidManifest angepasst")

# Versionsnummer aus der Build-Nummer, damit Updates sauber über die alte App installiert werden
import os
gradle = Path("android/app/build.gradle")
g = gradle.read_text(encoding="utf-8")
run = os.environ.get("GITHUB_RUN_NUMBER", "1")
g = re.sub(r"versionCode \d+", f"versionCode {run}", g)
g = re.sub(r'versionName "[^"]*"', f'versionName "1.0.{run}"', g)
gradle.write_text(g, encoding="utf-8")
print(f"Version 1.0.{run} (Code {run})")
