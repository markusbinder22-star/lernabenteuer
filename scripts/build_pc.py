#!/usr/bin/env python3
"""Baut www/ zu einer einzigen Datei dist/Kivalu.html.
Alle Bilder, Töne und Schriften stecken als data:-URL darin, damit das Spiel per Doppelklick
offline über file:// läuft (Chrome/Edge). Das Spiel holt Dateien über K.url(), das hier nachschlägt."""
import base64, json, mimetypes, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
WWW = ROOT / "www"
MIME = {".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".ogg": "audio/ogg", ".woff2": "font/woff2"}

def data_url(p: pathlib.Path) -> str:
    mt = MIME.get(p.suffix) or mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    return f"data:{mt};base64," + base64.b64encode(p.read_bytes()).decode()

html = (WWW / "index.html").read_text(encoding="utf-8")

# alle Dateien unter assets/ einbetten
embed = {}
for f in sorted((WWW / "assets").rglob("*")):
    if f.is_file():
        embed[f.relative_to(WWW).as_posix()] = data_url(f)

def inline_script(m):
    code = (WWW / m.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script")
    return "<script>\n" + code + "\n</script>"

def inline_css(m):
    css = (WWW / m.group(1)).read_text(encoding="utf-8")
    css = re.sub(r"url\((\.\./fonts/[^)]+)\)", lambda u: f"url({data_url((WWW / 'css' / u.group(1)).resolve())})", css)
    return "<style>\n" + css + "\n</style>"

html = re.sub(r'<script src="([^"]+)"></script>', inline_script, html)
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
if (WWW / "icon.png").exists():
    html = html.replace('href="icon.png"', f'href="{data_url(WWW / "icon.png")}"')
# EMBED vor allen Skripten setzen
html = html.replace("<script>", "<script>window.EMBED=" + json.dumps(embed) + ";</script>\n<script>", 1)

rest = re.sub(r"<script>.*?</script>", "", html, flags=re.S)
assert 'src="' not in rest and 'href="css' not in rest, "externe Datei übrig"
out = ROOT / "dist" / "Kivalu.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(out, out.stat().st_size // 1024, "KB,", len(embed), "Dateien eingebettet")
