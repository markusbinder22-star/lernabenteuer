#!/usr/bin/env python3
"""Baut www/ zu einer einzigen Datei dist/Purzeltal.html (alles inline, läuft per Doppelklick über file://)."""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
WWW = ROOT / "www"
html = (WWW / "index.html").read_text(encoding="utf-8")

def inline_script(m):
    code = (WWW / m.group(1)).read_text(encoding="utf-8")
    code = code.replace("</script", "<\\/script")
    return "<script>\n" + code + "\n</script>"

def inline_css(m):
    css = (WWW / m.group(1)).read_text(encoding="utf-8")
    return "<style>\n" + css + "\n</style>"

html = re.sub(r'<script src="([^"]+)"></script>', inline_script, html)
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
html = re.sub(r'\s*<link rel="manifest"[^>]*>', "", html)
icon = base64.b64encode((WWW / "icon.svg").read_bytes()).decode()
html = html.replace('href="icon.svg"', f'href="data:image/svg+xml;base64,{icon}"')

assert 'src="' not in re.sub(r"<script>.*?</script>", "", html, flags=re.S), "externe Datei übrig"
out = ROOT / "dist" / "Purzeltal.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(out, out.stat().st_size // 1024, "KB")
