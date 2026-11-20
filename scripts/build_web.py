#!/usr/bin/env python3
"""Baut die Web-Version für die eigene Website: dist/kivalu-spiel/ und dist/Kivalu-Web.zip.
Normale Dateien statt einer großen Einzeldatei, damit der Browser nur lädt, was gerade gebraucht wird
(Musik erst, wenn das Kapitel sie braucht). Zu jeder .ogg kommt eine .m4a für Safari/iPhone.
Dazu: poster.webp (Vorschaubild für den Platzhalter) und einbau-beispiel.html (Klick-zum-Laden)."""
import pathlib, shutil, subprocess, zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
WWW, OUT = ROOT / "www", ROOT / "dist" / "kivalu-spiel"
if OUT.exists():
    shutil.rmtree(OUT)
shutil.copytree(WWW, OUT)

# .m4a-Fassungen (AAC) für Browser ohne Ogg
have_ffmpeg = shutil.which("ffmpeg") is not None
for f in sorted(OUT.rglob("*.ogg")):
    if not have_ffmpeg:
        break
    rate = "64k" if "music" in f.parts or "amb" in f.parts else "48k"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(f), "-vn", "-map_metadata", "-1", "-c:a", "aac", "-b:a", rate, "-movflags", "+faststart", str(f.with_suffix(".m4a"))], check=True)
if not have_ffmpeg:
    print("WARNUNG: kein ffmpeg, Web-Version ohne .m4a (iPhone hat dann evtl. keinen Ton)")

shutil.copy(ROOT / "scripts" / "web" / "poster.webp", OUT / "poster.webp")
shutil.copy(ROOT / "scripts" / "web" / "einbau-beispiel.html", OUT / "einbau-beispiel.html")

zp = ROOT / "dist" / "Kivalu-Web.zip"
with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted(OUT.rglob("*")):
        if f.is_file():
            z.write(f, pathlib.Path("kivalu-spiel") / f.relative_to(OUT))
total = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
print(f"{OUT}: {total / 1e6:.1f} MB, Zip {zp.stat().st_size / 1e6:.1f} MB")
