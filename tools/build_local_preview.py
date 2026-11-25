"""Build design-system/xem-thu/: one standalone HTML per preview (opens straight from disk),
plus index.html listing them. Theme mặc định `sang`; preview lấy ảnh SP thật qua window.TF_IMG, cắt theo TF.photoCrop.
usage: python build_local_preview.py <design-system dir>"""
import os, re, sys, html

ds = sys.argv[1]
out = os.path.join(ds, 'xem-thu')
os.makedirs(out, exist_ok=True)
# Ảnh SP tạm trong bucket cũ. Preview gọi img('<mã SP>') -> URL; artifact không có TF_IMG nên hiện hình vẽ nét.
IMG = 'https://krtjhvqbdjbjibamgslg.supabase.co/storage/v1/object/public/bnb-product-images/manual-thumb/{id}.jpg'
# Ảnh cũ in logo và khuyến mãi của cửa hàng cũ ở bên phải: cắt lấy vùng SP, giống web/assets/js/app.js.
CROP = '{ x: 0.02, y: 0.13, w: 0.6, h: 0.8 }'

HEAD = '''<!doctype html>
<html lang="vi" data-theme="sang">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/bundle.css">
<script>var t=new URLSearchParams(location.search).get('theme');if(t)document.documentElement.setAttribute('data-theme',t);</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="../components/bundle.js"></script>
<script>window.TF_IMG = '{img}'; window.TF.photoCrop = {crop}; window.TF_HERO = '../assets/Hero/hero-bep.jpg';</script>
{extra}
</head>
'''

entries = []
comp_dir = os.path.join(ds, 'components')
for comp in sorted(os.listdir(comp_dir)):
    p = os.path.join(comp_dir, comp, 'preview.html')
    if not os.path.isfile(p):
        continue
    src = open(p, encoding='utf-8').read()
    marker = re.search(r'@dsCard([^\n]*)-->', src).group(1)
    width = int((re.search(r'width=(\d+)', marker) or [None, 960])[1])
    group = (re.search(r'group="([^"]*)"', marker) or [None, 'Bìa'])[1]
    sub = (re.search(r'subtitle="([^"]*)"', marker) or [None, ''])[1]
    extra = re.search(r'<head>([\s\S]*?)</head>', src).group(1)
    extra = re.sub(r'<title>[\s\S]*?</title>', '', extra).replace('<meta charset="utf-8">', '').strip()
    body = re.search(r'<body>[\s\S]*</body>', src).group(0)
    report = "<script>addEventListener('load',function(){setTimeout(function(){if(parent!==window)parent.postMessage({tfHeight:document.documentElement.scrollHeight},'*');},500);});</script>"
    page = HEAD.format(title=f'{comp} — Tefal Web', extra=extra, img=IMG, crop=CROP) + body.replace('</body>', report + '</body>') + '\n</html>\n'
    open(os.path.join(out, f'{comp}.html'), 'w', encoding='utf-8').write(page)
    entries.append((group, comp, sub, width))

order = ['Bìa', 'Khung trang', 'Khu vực trang', 'Sản phẩm', 'Giá & thông số', 'Điều hướng', 'Hành động', 'Trạng thái', 'Nhập liệu', 'Biểu tượng']
entries.sort(key=lambda e: (order.index(e[0]) if e[0] in order else 99, e[1]))
rows = []
for group, comp, sub, width in entries:
    rows.append(f'<section><h2>{html.escape(comp)} <small>{html.escape(group)}{" — " + html.escape(sub) if sub else ""}</small></h2>'
                f'<a href="{comp}.html" target="_blank">Mở riêng</a>'
                f'<div class="frame" style="max-width:{width}px"><iframe data-src="{comp}.html" title="{html.escape(comp)}" loading="lazy" style="width:{width}px"></iframe></div></section>')
index = '''<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Xem thử bộ khung — Tefal Web</title>
<style>
 body{margin:0;font:15px/1.5 system-ui,sans-serif;background:#ece7dd;color:#1d1c19}
 header{position:sticky;top:0;z-index:2;display:flex;gap:16px;align-items:center;padding:12px 24px;background:#1f1e1b;color:#f3efe7}
 header h1{font-size:16px;margin:0;flex:1}
 select{font:inherit;padding:6px 8px;background:#fff;color:#1d1c19;border:1px solid #877d69;border-radius:4px}
 main{padding:24px}
 section{margin:0 0 40px}
 h2{font-size:18px;margin:0 0 4px} h2 small{font-weight:400;color:#5f5a50;margin-left:8px}
 a{color:#d10a11}
 .frame{overflow:auto;border:1px solid #d8d1c3;border-radius:8px;margin-top:8px;background:#faf8f4}
 iframe{display:block;border:0;height:200px}
</style></head><body>
<header><h1>Tefal Web: xem thử bộ khung giao diện</h1>
<label>Theme <select id="theme"><option value="sang">Sáng (web)</option><option value="giay">Giấy (in, báo giá)</option><option value="dem">Đêm (bản đầu, tham khảo)</option></select></label></header>
<main>''' + '\n'.join(rows) + '''</main>
<script>
 var sel=document.getElementById('theme');
 function load(){document.querySelectorAll('iframe').forEach(function(f){f.src=f.dataset.src+'?theme='+sel.value;});}
 addEventListener('message',function(e){if(!e.data||!e.data.tfHeight)return;document.querySelectorAll('iframe').forEach(function(f){if(f.contentWindow===e.source)f.style.height=e.data.tfHeight+'px';});});
 sel.addEventListener('change',load); load();
</script></body></html>
'''
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(index)
print('built', len(entries), 'previews into', out)
