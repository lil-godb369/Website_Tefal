"""Turn the raw export (data/chunk*.jsonl, one JSON array per product) into web/assets/js/data.js.
Cleans names, fixes groups, picks each product's deciding number, formats specs Vietnamese-style.
usage: python build_data.py <data dir> <out data.js>"""
import json, re, sys, glob, os

src_dir, out = sys.argv[1], sys.argv[2]
rows = []
for f in sorted(glob.glob(os.path.join(src_dir, 'chunk*.jsonl'))):
    for line in open(f, encoding='utf-8'):
        if line.strip():
            rows.append(json.loads(line))

IMG_BASE = 'https://krtjhvqbdjbjibamgslg.supabase.co/storage/v1/object/public/bnb-product-images/'

GROUPS = [
    ('noi-chao', 'Nồi chảo', 'set'),
    ('noi-com-dien', 'Nồi cơm điện', 'cooker'),
    ('noi-chien', 'Nồi chiên không dầu', 'fryer'),
    ('noi-ap-suat', 'Nồi áp suất điện', 'cooker'),
    ('may-xay-ep', 'Máy xay & máy ép', 'blender'),
    ('dao-dung-cu', 'Dao & dụng cụ bếp', 'knife'),
    ('am-dun', 'Ấm đun siêu tốc', 'blender'),
    ('may-loc-nuoc', 'Máy lọc nước', 'blender'),
    ('khac', 'Đồ bếp khác', 'pan'),
    ('ngoai-bep', 'Ngoài bếp', 'pan'),
]
KITCHEN = [g[0] for g in GROUPS if g[0] != 'ngoai-bep']

DROP = {'K-089', 'K-09001', 'DK-228'}  # no model / duplicate of NC-135 / duplicate of DK-149
NAME_OVERRIDE = {
    'NC-064': 'Bộ 4 nồi inox Cook & Eat B922S784',
    'NC-062': 'Bộ 5 nồi chảo 2 cán rời Ingenio Serenity L827SB04',
}
ENGLISH = re.compile(r'\b(set|sets|pan|pans|pot|poele|sauteuse|piece|wokpan|chef|slicing|kitchen|knife|blocks)\b', re.I)


def spec(specs, *labels):
    for l, v in specs:
        if l in labels:
            return v
    return None


def num(v):
    if v is None:
        return None
    m = re.search(r'\d+(?:[.,]\d+)?', str(v).replace('1.000', '1000'))
    return float(m.group(0).replace(',', '.')) if m else None


def vn(x):
    """1.8 -> '1,8'; 7.0 -> '7'"""
    if x is None:
        return None
    if x >= 1000 and x == int(x):
        return '{:,}'.format(int(x)).replace(',', '.')  # 1400 -> '1.400'
    s = ('%g' % x)
    return s.replace('.', ',')


def group_of(name, grp):
    n = name.lower()
    if re.search(r'\bdao\b|kéo|mài dao', n):
        return 'dao-dung-cu'
    if 'vắt cam' in n:
        return 'may-xay-ep'
    if grp == 'khac' and re.search(r'chảo|nồi cán|quánh', n):
        return 'noi-chao'
    return grp


def clean_name(pid, name, model, specs):
    if pid in NAME_OVERRIDE:
        return NAME_OVERRIDE[pid]
    n = re.sub(r'\s*\bTefal\b\s*', ' ', name).strip()
    n = re.sub(r'\s{2,}', ' ', n)
    if model:
        n = n.replace('(' + model + ')', model)
    # generic "Nồi chảo MODEL": use the detailed type when it is Vietnamese
    if model and re.fullmatch(r'Nồi chảo ' + re.escape(model), n):
        detail = spec(specs, 'Loại sản phẩm (chi tiết)') or ''
        pieces = spec(specs, 'Số món trong bộ')
        dmin, dmax = num(spec(specs, 'Đường kính nhỏ nhất (cm)')), num(spec(specs, 'Đường kính lớn nhất (cm)'))
        if detail and not ENGLISH.search(detail) and not re.search(r'\(', detail):
            base = detail[0].upper() + detail[1:]
        elif pieces:
            base = 'Bộ nồi chảo %s món' % pieces
        else:
            base = 'Nồi chảo'
        if pieces and 'món' not in base:
            base += ' %s món' % pieces
        if dmin and dmax and dmin == dmax and not re.search(r'\d+\s?cm', base) and not base.lower().startswith('bộ'):
            base += ' %s cm' % vn(dmax)
        n = base + ' ' + model
    if model and model not in n:
        n = n + ' ' + model
    return n


def figure(group, name, specs, desc, strengths):
    cap = num(spec(specs, 'Dung tích (lít)', 'Dung tích'))
    power = num(spec(specs, 'Tổng công suất (W)', 'Công suất'))
    text = ' '.join([name, desc] + strengths)
    if group == 'noi-chao':
        pieces = spec(specs, 'Số món trong bộ')
        if pieces:
            return {'v': pieces, 'u': 'món', 'l': 'Trong bộ'}
        dmin, dmax = num(spec(specs, 'Đường kính nhỏ nhất (cm)')), num(spec(specs, 'Đường kính lớn nhất (cm)'))
        if dmax and dmin and dmin != dmax:
            return {'v': '%s–%s' % (vn(dmin), vn(dmax)), 'u': 'cm', 'l': 'Cỡ trong bộ'}
        if dmax:
            return {'v': vn(dmax), 'u': 'cm', 'l': 'Đường kính'}
        m = re.search(r'(\d{2})\s?cm', name)
        if m:
            return {'v': m.group(1), 'u': 'cm', 'l': 'Đường kính'}
        return None
    if group in ('noi-com-dien', 'noi-chien', 'noi-ap-suat', 'am-dun', 'may-loc-nuoc', 'khac'):
        return {'v': vn(cap), 'u': 'L', 'l': 'Dung tích'} if cap else None
    if group in ('may-xay-ep', 'ngoai-bep'):
        return {'v': vn(power), 'u': 'W', 'l': 'Công suất'} if power else None
    if group == 'dao-dung-cu':
        m = re.search(r'(\d+)\s*món', name) or re.search(r'(\d+)\s*món', desc)
        if m:
            return {'v': m.group(1), 'u': 'món', 'l': 'Trong bộ'}
        if '26°' in text:
            return {'v': '26', 'u': '°', 'l': 'Góc cắt'}
        m = re.search(r'(\d+)\s?cm', name)
        if m:
            return {'v': m.group(1), 'u': 'cm', 'l': 'Cỡ dao'}
    return None


HIDE = {'Mã sản phẩm', 'Model', 'Mã SKU', 'Tên sản phẩm', 'Hãng sản xuất', 'Thương hiệu', 'Xuất xứ', 'Bảo hành',
        'Đường kính nhỏ nhất (cm)', 'Đường kính lớn nhất (cm)'}


def fmt_specs(specs, origin, warranty):
    out = []
    dmin, dmax = num(spec(specs, 'Đường kính nhỏ nhất (cm)')), num(spec(specs, 'Đường kính lớn nhất (cm)'))
    for l, v in specs:
        if l in HIDE:
            continue
        v = v.strip()
        if l == 'Tổng công suất (W)':
            l, v = 'Công suất', vn(num(v)) + ' W'
        elif l == 'Dung tích (lít)':
            l, v = 'Dung tích', vn(num(v)) + ' lít'
        elif l == 'KT (R×S×C mm)':
            l, v = 'Kích thước (R × S × C)', re.sub(r'\s*x\s*', ' × ', v) + ' mm'
        elif l == 'Số món trong bộ':
            l, v = 'Số món', v + ' món'
        elif l == 'Loại sản phẩm (chi tiết)':
            if ENGLISH.search(v):
                continue
            l = 'Loại'
            v = v[0].upper() + v[1:]
        elif l == 'Dải nhiệt (°C)':
            l, v = 'Dải nhiệt', v.replace('-', '–') + ' °C'
        elif l == 'Lượng hơi (g/phút)':
            l, v = 'Lượng hơi', v + ' g/phút'
        elif l == 'Thời lượng pin (phút)':
            l, v = 'Thời lượng pin', v + ' phút'
        elif l == 'Số chương trình nấu':
            l = 'Số chương trình'
        elif l == 'Tốc độ (vòng/phút)':
            l, v = 'Tốc độ', v + ' vòng/phút'
        v = v.replace('Inox (chưa rõ mác)', 'Inox')
        out.append([l, v])
    if dmin and dmax:
        out.insert(0, ['Đường kính', ('%s cm' % vn(dmax)) if dmin == dmax else ('%s–%s cm' % (vn(dmin), vn(dmax)))])
    if warranty:
        out.append(['Bảo hành', '%d tháng' % warranty])
    if origin:
        out.append(['Xuất xứ', origin])
    return out


def clean_desc(desc, origin):
    if not desc:
        return ''
    if origin and origin != 'Pháp' and re.search(r'(sản xuất tại|xuất xứ và sản xuất tại) Pháp', desc):
        return ''
    return desc.replace(' Tefal ', ' ').strip()


def clean_strengths(items):
    out = []
    for s in items:
        s = s.strip()
        if len(s) < 25 or 'sárảnh' in s or s.startswith('Xuất xứ') or s.startswith('Là sản phẩm'):
            continue
        out.append(s.rstrip('.'))
    return out


products = []
for r in rows:
    pid, name, model, grp, price, orig, origin, warranty, instock, thumb, img2, specs, desc, strengths = r
    if pid in DROP:
        continue
    model = model or spec(specs, 'Mã sản phẩm', 'Model') or ''
    origin = (origin or '').replace('China (Trung Quốc)', 'Trung Quốc').strip() or None
    warranty = int(warranty) if warranty and warranty >= 6 else None
    group = group_of(name, grp)
    img = thumb or (IMG_BASE + 'manual-thumb/' + pid + '.jpg')
    img2 = img2 if (img2 and img2.startswith(IMG_BASE)) else None
    desc = clean_desc(desc, origin)
    strengths = clean_strengths(strengths)
    pct = round((1 - price / orig) * 100) if (orig and price and orig > price) else 0
    p = {
        'id': pid, 'name': clean_name(pid, name, model, specs), 'full': name, 'model': model, 'g': group,
        'price': int(price), 'orig': int(orig) if (orig and orig > price) else None, 'pct': pct,
        'origin': origin, 'w': warranty, 'stock': bool(instock), 'img': img,
        'fig': figure(group, name, specs, desc, strengths),
        'power': vn(num(spec(specs, 'Tổng công suất (W)', 'Công suất'))) if spec(specs, 'Tổng công suất (W)', 'Công suất') else None,
        'cap': vn(num(spec(specs, 'Dung tích (lít)', 'Dung tích'))) if spec(specs, 'Dung tích (lít)', 'Dung tích') else None,
        'specs': fmt_specs(specs, origin, warranty), 'desc': desc, 'pts': strengths,
    }
    if img2:
        p['img2'] = img2
    products.append(p)

counts = {}
for p in products:
    if p['price'] > 0:
        counts[p['g']] = counts.get(p['g'], 0) + 1
groups = [{'key': k, 'name': n, 'art': a, 'count': counts.get(k, 0), 'total': sum(1 for p in products if p['g'] == k)} for k, n, a in GROUPS]

data = {'groups': groups, 'products': products, 'kitchen': KITCHEN, 'built': '2026-10-12'}
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, 'w', encoding='utf-8') as fh:
    fh.write('/* Tefal Web — dữ liệu sản phẩm (ảnh chụp ngày 12/10/2026, %d sản phẩm). Sinh bởi tools/build_data.py, đừng sửa tay. */\n' % len(products))
    fh.write('window.TF_DATA = ')
    json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print(len(products), 'products;', {g['key']: (g['count'], g['total']) for g in groups})
print('size', os.path.getsize(out))
