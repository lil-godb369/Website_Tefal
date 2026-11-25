"""Compile tokens.json into tokens.css, laid out like the Design System page's own compiler:
:root,[data-theme=<first>] {colors, shadows}, one block per further theme,
:root {other families, --font-<key>}, a class per type style."""
import json, re, sys

src, out = sys.argv[1], sys.argv[2]
t = json.load(open(src, encoding='utf-8'))
themes = [th['id'] for th in t['color']['themes']]
first = themes[0]


def val(v, theme):
    if isinstance(v, str):
        return v
    return v.get(theme, v.get(first))


def css_value(v):
    m = re.fullmatch(r'\{([A-Za-z0-9][A-Za-z0-9_.-]*)\}', v)
    return f'var(--{m.group(1)})' if m else v


lines = [f"/* {t.get('name', 'tokens')} — generated from tokens.json */"]
for i, th in enumerate(themes):
    sel = f':root, [data-theme="{th}"]' if i == 0 else f'[data-theme="{th}"]'
    decl = []
    for tok in t['color']['tokens']:
        decl.append(f"  --{tok['name']}: {css_value(val(tok['value'], th))};")
    for tok in t.get('shadow', {}).get('tokens', []):
        decl.append(f"  --{tok['name']}: {val(tok['value'], th)};")
    lines.append(sel + ' {\n' + '\n'.join(decl) + '\n}')

decl = []
for fam, body in t.items():
    if fam in ('name', 'version', 'color', 'type', 'shadow', 'meta'):
        continue
    if isinstance(body, dict) and 'tokens' in body:
        for tok in body['tokens']:
            decl.append(f"  --{tok['name']}: {tok['value']};")
for key, stack in t['type']['families'].items():
    decl.append(f"  --font-{key}: {stack};")
lines.append(':root {\n' + '\n'.join(decl) + '\n}')

for g in t['type']['groups']:
    for s in g['styles']:
        fam = s.get('family', g['family'])
        props = [f"font-family: var(--font-{fam})", f"font-size: {s['fontSize']}"]
        if 'lineHeight' in s: props.append(f"line-height: {s['lineHeight']}")
        if 'fontWeight' in s: props.append(f"font-weight: {s['fontWeight']}")
        if 'fontStyle' in s: props.append(f"font-style: {s['fontStyle']}")
        if 'letterSpacing' in s: props.append(f"letter-spacing: {s['letterSpacing']}")
        lines.append(f".{s['name']} {{ {'; '.join(props)}; }}")

open(out, 'w', encoding='utf-8').write('\n\n'.join(lines) + '\n')
print('wrote', out)
