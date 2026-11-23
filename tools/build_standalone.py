#!/usr/bin/env python3
"""Bundle index.html + css + js + assets into one self-contained HTML file.

Usage:  python3 tools/build_standalone.py            -> dist/cu-registration-demo.html
The bundled file works offline (except Google Fonts) and can be emailed or hosted anywhere.
"""
import base64, mimetypes, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "css/styles.css").read_text(encoding="utf-8")
js = (ROOT / "js/app.js").read_text(encoding="utf-8")


def data_uri(rel):
    p = ROOT / rel
    mime = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()


asset_re = re.compile(r"assets/[\w.\-]+\.(?:png|svg|jpg)")
html = html.replace('<link rel="stylesheet" href="css/styles.css">', "<style>\n" + css + "\n</style>")
html = html.replace('<script src="js/app.js"></script>', "<script>\n" + js + "\n</script>")
html = asset_re.sub(lambda m: data_uri(m.group(0)), html)

out = ROOT / "dist" / "cu-registration-demo.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
