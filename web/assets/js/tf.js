/* @ds-bundle: {"format":4,"namespace":"TF","components":[{"name":"Button"},{"name":"Badge"},{"name":"SearchField"},{"name":"PriceTag"},{"name":"SpecFigure"},{"name":"SpecTable"},{"name":"ProductArt"},{"name":"ProductCard"},{"name":"CategoryIndex"},{"name":"SiteHeader"},{"name":"SectionTitle"},{"name":"TrustBar"},{"name":"CategoryTile"},{"name":"PromoBanner"},{"name":"Plate"},{"name":"Photo"},{"name":"Icon"},{"name":"Field"},{"name":"PasswordField"},{"name":"SelectField"},{"name":"ChoiceGroup"},{"name":"GoogleButton"},{"name":"LoginGate"},{"name":"QuickView"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(' ');
  }
  function omit(obj, keys) {
    var out = {};
    for (var k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) out[k] = obj[k];
    }
    return out;
  }
  /* 2679000 -> "2.679.000 ₫" (Vietnamese grouping, non-breaking space before the dong sign) */
  function vnd(n) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
  }

  /* ---------- Icons (drawn to match Lucide's outline set) ---------- */
  var ICONS = {
    search: [{ c: [11, 11, 7] }, 'M16.5 16.5L21 21'],
    bag: ['M5 8h14l-1.2 13H6.2L5 8z', 'M9 8V6.5a3 3 0 0 1 6 0V8'],
    menu: ['M4 7h16M4 12h16M4 17h16'],
    arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
    chevron: ['M6 9l6 6 6-6'],
    shield: ['M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z', 'M9 12l2 2 4-4'],
    award: [{ c: [12, 9, 6] }, 'M8.5 13.5L7 21l5-3 5 3-1.5-7.5'],
    tag: ['M3 12V4h8l10 10-8 8L3 12z', { c: [7.5, 8.5, 1.5] }],
    store: ['M4 10v10h16V10', 'M3 10l2-6h14l2 6H3z', 'M10 20v-5h4v5'],
    phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'],
    pot: ['M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z', 'M2 10h2M20 10h2', 'M9 6h6'],
    cooker: ['M5 11a7 5 0 0 1 14 0', 'M4 11h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5z', 'M10 6h4'],
    fryer: ['M7 3h10a2 2 0 0 1 2 2l.5 16h-15L5 5a2 2 0 0 1 2-2z', 'M5.3 12h13.4', { c: [12, 7.5, 1.5] }],
    blender: ['M7 3h10l-1.5 11h-7L7 3z', 'M8 14h8v7H8z', 'M11 17.5h2'],
    knife: ['M3 21L15 9', 'M15 9l5-5c1 3 0 6-3 8l-2-3z'],
    kettle: ['M6 9h11l1 11H5l1-11z', 'M17 11h2a2 2 0 0 1 0 4h-1.6', 'M9 5h5l1 4H8l1-4z'],
    drop: ['M12 3c3.5 4.5 6 7.7 6 11a6 6 0 0 1-12 0c0-3.3 2.5-6.5 6-11z'],
    home: ['M3 11l9-7 9 7', 'M5 10v10h14V10'],
    user: [{ c: [12, 8, 4] }, 'M4 21a8 8 0 0 1 16 0'],
    eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', { c: [12, 12, 3] }],
    eyeOff: ['M3 3l18 18', 'M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9', 'M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'],
    logout: ['M15 4h4v16h-4', 'M10 8l-4 4 4 4', 'M6 12h11'],
    heart: ['M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6.5 5 5 0 0 1 21.2 11C19 15.6 12 20 12 20z'],
    compare: ['M8 4v16', 'M16 4v16', 'M4 8l4-4 4 4', 'M12 16l4 4 4-4'],
    close: ['M6 6l12 12M18 6L6 18'],
    close: ['M6 6l12 12', 'M18 6L6 18']
  };
  function Icon(p) {
    var parts = ICONS[p.name] || ICONS.pot;
    var size = p.size || 20;
    return h('svg', { className: p.className, width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: p.stroke || 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' },
      parts.map(function (d, i) {
        if (typeof d === 'string') return h('path', { key: i, d: d });
        return h('circle', { key: i, cx: d.c[0], cy: d.c[1], r: d.c[2] });
      }));
  }

  /* ---------- Button ---------- */
  function Button(p) {
    var variant = p.variant || 'outline';
    var cls = cx('tf-btn', variant !== 'outline' && 'tf-btn-' + variant, p.size === 'sm' && 'tf-btn-sm', p.block && 'tf-btn-block', p.className);
    var rest = omit(p, ['variant', 'block', 'className', 'children', 'href', 'size']);
    if (p.href) return h('a', Object.assign({ className: cls, href: p.href }, rest), p.children);
    return h('button', Object.assign({ type: 'button', className: cls }, rest), p.children);
  }

  /* ---------- Badge ---------- */
  function Badge(p) {
    var tone = p.tone || 'neutral';
    return h('span', { className: cx('tf-badge', tone !== 'neutral' && 'tf-badge-' + tone) },
      p.dot ? h('span', { className: 'tf-badge-dot', 'aria-hidden': 'true' }) : null,
      p.children);
  }

  /* ---------- SearchField ---------- */
  function SearchField(p) {
    var id = p.id || 'tf-search';
    return h('div', { className: cx('tf-search', p.className), role: 'search' },
      h(Icon, { name: 'search', size: 18 }),
      h('label', { className: 'tf-sr', htmlFor: id }, p.label || 'Tìm sản phẩm'),
      h('input', { id: id, type: 'search', placeholder: p.placeholder || 'Tìm tên hoặc mã model', defaultValue: p.defaultValue, onChange: p.onChange }));
  }

  /* ---------- PriceTag ---------- */
  function PriceTag(p) {
    var hasWas = typeof p.original === 'number' && p.original > p.price;
    var off = hasWas ? Math.round((1 - p.price / p.original) * 100) : 0;
    return h('div', { className: cx('tf-price', p.size === 'lg' && 'tf-price-lg') },
      h('span', { className: 'tf-price-now' }, h('span', { className: 'tf-sr' }, 'Giá bán '), vnd(p.price)),
      hasWas ? h('span', { className: 'tf-price-was' }, h('span', { className: 'tf-sr' }, 'Giá gốc '), vnd(p.original)) : null,
      hasWas && off > 0 && p.showOff !== false ? h('span', { className: 'tf-price-off' }, h('span', { className: 'tf-sr' }, 'Giảm '), '−' + off + '%') : null,
      // Dòng "Tiết kiệm" làm mức giảm dễ thấy hơn (bật bằng prop save)
      hasWas && p.save ? h('span', { className: 'tf-price-save' }, 'Tiết kiệm ' + vnd(p.original - p.price)) : null);
  }

  /* ---------- SpecFigure ---------- */
  function SpecFigure(p) {
    if (p.chip) {
      return h('span', { className: cx('tf-figchip', p.className) },
        h('strong', null, p.value, p.unit ? ' ' + p.unit : null), p.label ? h('span', null, p.label) : null);
    }
    return h('div', { className: cx('tf-figure', p.size === 'sm' && 'tf-figure-sm', p.className) },
      h('span', { className: 'tf-figure-value' }, p.value, p.unit ? h('span', { className: 'tf-figure-unit' }, p.unit) : null),
      p.label ? h('span', { className: 'tf-figure-label' }, p.label) : null,
      p.note ? h('span', { className: 'tf-figure-note' }, p.note) : null);
  }

  /* ---------- SpecTable ---------- */
  function SpecTable(p) {
    return h('table', { className: 'tf-spec' },
      p.caption ? h('caption', null, p.caption) : null,
      h('tbody', null, (p.rows || []).map(function (r, i) {
        return h('tr', { key: i }, h('th', { scope: 'row' }, r[0]), h('td', null, r[1]));
      })));
  }

  /* ---------- ProductArt: line-drawn stand-ins when a photo fails to load ---------- */
  var ART = {
    pan: ['M15 80 Q17 114 85 116 Q153 114 155 80', 'M153 76 L194 61 Q199 60 198 66 L157 83', { e: [85, 80, 70, 26] }, { e: [85, 80, 60, 20] }],
    cooker: ['M38 72 Q38 142 100 142 Q162 142 162 72', 'M34 72 Q100 26 166 72 Z', { r: [88, 38, 24, 9] }, { r: [82, 96, 36, 16] }, 'M38 72 L162 72'],
    blender: ['M76 116 L68 32 L132 32 L124 116 Z', { r: [66, 22, 68, 10] }, { r: [70, 116, 60, 30] }, { c: [100, 131, 6] }, 'M88 92 L112 84'],
    fryer: ['M50 40 Q50 30 60 30 L140 30 Q150 30 150 40 L153 142 L47 142 Z', 'M49 94 L151 94', { r: [84, 108, 32, 10] }, { c: [100, 60, 13] }],
    knife: [{ r: [18, 80, 56, 15] }, 'M74 80 L168 80 Q184 82 188 95 L74 95', { c: [32, 87.5, 2] }, { c: [58, 87.5, 2] }],
    set: [{ e: [72, 56, 42, 11] }, 'M30 56 L35 122 Q72 134 109 122 L114 56', 'M66 45 L78 45', 'M114 66 L136 62', { e: [140, 112, 46, 14] }, 'M94 112 Q96 134 140 135 Q184 134 186 112']
  };
  function ProductArt(p) {
    var parts = ART[p.kind] || ART.pan;
    return h('svg', { className: 'tf-art', viewBox: '0 0 200 160', 'aria-hidden': 'true', focusable: 'false' },
      parts.map(function (d, i) {
        if (typeof d === 'string') return h('path', { key: i, d: d });
        if (d.e) return h('ellipse', { key: i, cx: d.e[0], cy: d.e[1], rx: d.e[2], ry: d.e[3] });
        if (d.r) return h('rect', { key: i, x: d.r[0], y: d.r[1], width: d.r[2], height: d.r[3], rx: 3 });
        return h('circle', { key: i, cx: d.c[0], cy: d.c[1], r: d.c[2] });
      }));
  }

  /* ---------- Photo: a product image, optionally cropped to the region set in TF.photoCrop
     ({x, y, w, h} as fractions of the source image). The crop box keeps that region's
     aspect ratio and is fitted inside whatever holds it. ---------- */
  function Photo(p) {
    var c = window.TF && window.TF.photoCrop;
    // width/height theo ảnh gốc 1200×1200 để trình duyệt giữ chỗ trước khi ảnh tải (giảm xô lệch bố cục)
    var img = h('img', { src: p.src, alt: p.alt || '', width: p.width || 1200, height: p.height || 1200, decoding: 'async',
      loading: p.eager ? 'eager' : 'lazy', fetchpriority: p.eager ? 'high' : undefined, onError: p.onError, onLoad: p.onLoad,
      style: c ? { width: 100 / c.w + '%', left: -c.x / c.w * 100 + '%', top: -c.y / c.h * 100 + '%' } : undefined });
    if (!c) return img;
    return h('span', { className: cx('tf-crop', p.className), style: { aspectRatio: String(c.w / c.h) } }, img);
  }

  // Ảnh lỗi, hoặc đã nằm trong màn hình quá 8 giây mà chưa tải xong (mạng chặn, máy chủ ảnh treo): đổi sang hình vẽ nét
  var PLATE_WAIT = 8000;
  function Plate(p) {
    var st = React.useState(false), failed = st[0], setFailed = st[1];
    var ld = React.useState(false), loaded = ld[0], setLoaded = ld[1];
    var ref = React.useRef(null);
    var showImg = p.image && !failed;
    React.useEffect(function () {
      if (!showImg || loaded) return;
      var seen = 0, t = setInterval(function () {
        var el = ref.current; if (!el) return;
        var r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < (window.innerHeight || 0) && r.width > 0) seen += 1000;
        if (seen >= PLATE_WAIT) { clearInterval(t); setFailed(true); }
      }, 1000);
      return function () { clearInterval(t); };
    }, [p.image, loaded, failed]);
    return h('div', { ref: ref, className: cx('tf-plate', p.className) },
      p.tag ? h('span', { className: 'tf-plate-tag' }, p.tag) : null,
      showImg ? h(Photo, { src: p.image, alt: p.alt, eager: p.eager, onError: function () { setFailed(true); }, onLoad: function () { setLoaded(true); } })
        : h(ProductArt, { kind: p.art }));
  }

  /* ---------- ProductCard ---------- */
  function ProductCard(p) {
    var off = p.original > p.price && p.price > 0 ? Math.round((1 - p.price / p.original) * 100) : 0;
    // Ba nút hiện khi rê chuột hoặc khi focus vào thẻ (luôn hiện trên màn hình cảm ứng):
    // Yêu thích, So sánh, Thêm vào giỏ. Nhãn đọc màn hình kèm tên SP để phân biệt giữa các thẻ.
    function tool(key, icon, label, onClick, pressed) {
      return h('button', { key: key, type: 'button', className: cx('tf-card-tool', 'tf-tool-' + key, pressed && 'is-on'), 'data-tip': label,
        'aria-label': label + ': ' + p.name, 'aria-pressed': pressed === undefined ? undefined : (pressed ? 'true' : 'false'), onClick: onClick },
        h(Icon, { name: icon, size: 18 }));
    }
    var tools = [];
    if (p.onWish) tools.push(tool('wish', 'heart', p.wished ? 'Bỏ yêu thích' : 'Yêu thích', p.onWish, !!p.wished));
    if (p.onCompare) tools.push(tool('cmp', 'compare', p.compared ? 'Bỏ so sánh' : 'So sánh', p.onCompare, !!p.compared));
    if (p.onAdd && p.price > 0) tools.push(tool('add', 'bag', p.addLabel || 'Thêm vào giỏ', p.onAdd));
    // onQuickView: a plain click opens the quick view; ctrl/cmd/shift/middle click still opens the product page
    function open(e) {
      if (!p.onQuickView || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      p.onQuickView(e.currentTarget);
    }
    return h('article', { className: cx('tf-card', p.className) },
      h('a', { className: 'tf-card-link', href: p.href || '#', onClick: open, 'aria-haspopup': p.onQuickView ? 'dialog' : undefined },
        h(Plate, { image: p.image, alt: '', art: p.art, tag: off > 0 ? h(React.Fragment, null, h('span', { className: 'tf-sr' }, 'Giảm '), '−' + off + '%') : p.tag }),
        h('div', { className: 'tf-card-body' },
          h('h3', { className: 'tf-card-name' }, p.name),
          p.meta ? h('p', { className: 'tf-card-meta' }, p.meta) : null,
          p.figure ? h(SpecFigure, { chip: true, value: p.figure.value, unit: p.figure.unit, label: p.figure.label }) : null,
          p.price > 0 ? h(PriceTag, { price: p.price, original: p.original, showOff: false, save: true }) : h('span', { className: 'tf-price-ask' }, 'Gọi để báo giá'))),
      p.badges && p.badges.length ? h('div', { className: 'tf-card-badges' }, p.badges.map(function (b, i) {
        return h(Badge, { key: i, tone: b.tone, dot: b.dot }, b.text);
      })) : null,
      tools.length ? h('div', { className: 'tf-card-tools', role: 'group', 'aria-label': 'Thao tác với ' + p.name }, tools) : null);
  }

  /* ---------- QuickView: modal opened from a product card. Photo left, facts and actions right
     (stacked as a bottom sheet on phones). Esc, the close button or a click outside closes it;
     Tab stays inside; focus returns to the card that opened it. ---------- */
  function QuickView(p) {
    if (!p.product) return null;
    return h(QuickViewDialog, p);
  }
  function QuickViewDialog(p) {
    var x = p.product;
    var imgs = (x.images || []).filter(Boolean);
    var st = React.useState(0), idx = st[0], setIdx = st[1];
    var boxRef = React.useRef(null), titleRef = React.useRef(null);
    var titleId = 'tf-qv-title', descId = 'tf-qv-desc';
    React.useEffect(function () {
      var back = p.returnFocus || document.activeElement;
      var overflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (titleRef.current) titleRef.current.focus();
      function key(e) {
        if (e.key === 'Escape') { e.stopPropagation(); p.onClose(); return; }
        if (e.key !== 'Tab' || !boxRef.current) return;
        var f = boxRef.current.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      document.addEventListener('keydown', key, true);
      return function () {
        document.removeEventListener('keydown', key, true);
        document.body.style.overflow = overflow;
        if (back && back.focus) back.focus();
      };
    }, []);
    var canBuy = x.price > 0;
    return h('div', { className: 'tf-qv-backdrop', onMouseDown: function (e) { if (e.target === e.currentTarget) p.onClose(); } },
      h('div', { ref: boxRef, className: 'tf-qv', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, 'aria-describedby': x.meta ? descId : undefined },
        h('button', { type: 'button', className: 'tf-qv-close', 'aria-label': 'Đóng xem nhanh', onClick: p.onClose }, h(Icon, { name: 'close', size: 22 })),
        h('div', { className: 'tf-qv-media' },
          h(Plate, { image: imgs[idx], alt: x.name, art: x.art, eager: true, tag: x.original > x.price && x.price > 0 ? '−' + Math.round((1 - x.price / x.original) * 100) + '%' : null }),
          imgs.length > 1 ? h('div', { className: 'tf-qv-thumbs', role: 'group', 'aria-label': 'Chọn ảnh' }, imgs.map(function (src, i) {
            return h('button', { key: i, type: 'button', 'aria-label': 'Ảnh ' + (i + 1), 'aria-pressed': i === idx ? 'true' : 'false', onClick: function () { setIdx(i); } },
              h(Plate, { image: src, alt: '', art: x.art }));
          })) : null),
        h('div', { className: 'tf-qv-info' },
          x.kicker ? h('p', { className: 'tf-qv-kicker' }, x.kicker) : null,
          h('h2', { id: titleId, ref: titleRef, tabIndex: -1, className: 'tf-qv-title' }, x.name),
          x.meta ? h('p', { id: descId, className: 'tf-buy-meta' }, x.meta) : null,
          canBuy ? h(PriceTag, { price: x.price, original: x.original, size: 'lg' }) : h('p', { className: 'tf-price-ask' }, 'Sản phẩm chưa có giá bán. Gọi để được báo giá.'),
          x.badges && x.badges.length ? h('div', { className: 'tf-card-badges' }, x.badges.map(function (b, i) { return h(Badge, { key: i, tone: b.tone, dot: b.dot }, b.text); })) : null,
          x.figures && x.figures.length ? h('div', { className: 'tf-figure-row' }, x.figures.slice(0, 3).map(function (f, i) {
            return h(SpecFigure, { key: i, value: f.value, unit: f.unit, label: f.label });
          })) : null,
          x.specs && x.specs.length ? h('dl', { className: 'tf-qv-specs' }, x.specs.slice(0, 4).map(function (r, i) {
            return h(React.Fragment, { key: i }, h('dt', null, r[0]), h('dd', null, r[1]));
          })) : null,
          h('div', { className: 'tf-qv-actions' },
            canBuy && p.onAdd ? h(Button, { variant: 'primary', onClick: p.onAdd }, p.addLabel || 'Thêm vào giỏ')
              : h(Button, { variant: 'primary', href: p.callHref || '#', onClick: p.onClose }, 'Gọi để báo giá'),
            h(Button, { href: x.href || '#' }, 'Xem chi tiết')),
          p.note ? h('p', { className: 'tf-buy-note' }, h(Icon, { name: 'store', size: 18 }), p.note) : null)));
  }

  /* ---------- CategoryIndex (list form, used in menus and empty states) ---------- */
  function CategoryIndex(p) {
    var unit = p.unit || 'mẫu';
    return h('nav', { 'aria-label': p.label || 'Danh mục' },
      h('ul', { className: 'tf-index' }, (p.items || []).map(function (it, i) {
        return h('li', { key: i }, h('a', { href: it.href || '#' },
          h('span', { className: 'tf-index-name' }, it.name),
          h('span', { className: 'tf-index-count' }, it.count, h('small', null, unit))));
      })),
      p.total ? h('p', { className: 'tf-index-total' }, p.total) : null);
  }

  /* ---------- SectionTitle: centred serif caps with a small rule ---------- */
  function SectionTitle(p) {
    return h('div', { className: cx('tf-stitle', p.className) },
      h('h2', { className: 'tf-stitle-text' }, p.title),
      p.moreHref ? h('a', { className: 'tf-stitle-more', href: p.moreHref }, p.moreLabel || 'Xem thêm', h(Icon, { name: 'arrow', size: 16 })) : null,
      p.note ? h('p', { className: 'tf-stitle-note' }, p.note) : null);
  }

  /* ---------- TrustBar: a row of promises with icons ---------- */
  function TrustBar(p) {
    return h('ul', { className: cx('tf-trust', p.dark && 'tf-trust-dark', p.className) }, (p.items || []).map(function (it, i) {
      return h('li', { key: i },
        h('span', { className: 'tf-trust-icon' }, h(Icon, { name: it.icon, size: p.dark ? 26 : 24, stroke: 1.4 })),
        h('span', null, h('strong', null, it.title), it.text ? h('span', null, it.text) : null));
    }));
  }

  /* ---------- CategoryTile: photo, round icon, name, link ---------- */
  function CategoryTile(p) {
    return h('a', { className: 'tf-ctile', href: p.href || '#' },
      h('span', { className: 'tf-ctile-media' },
        h(Plate, { image: p.image, alt: '', art: p.art }),
        h('span', { className: 'tf-ctile-icon' }, h(Icon, { name: p.icon, size: 18 }))),
      h('span', { className: 'tf-ctile-body' },
        h('span', { className: 'tf-ctile-name' }, p.name),
        h('span', { className: 'tf-ctile-more' }, p.count ? p.count + ' mẫu' : 'Xem ngay', h(Icon, { name: 'arrow', size: 14 }))));
  }

  /* ---------- PromoBanner: tinted panel, copy left, product photos right
     (no photos: the line drawing named by `art`) ---------- */
  function PromoBanner(p) {
    var imgs = (p.images || []).filter(Boolean).slice(0, 2);
    return h('a', { className: cx('tf-promo', p.className), href: p.href || '#' },
      h('span', { className: 'tf-promo-copy' },
        p.kicker ? h('span', { className: 'tf-promo-kicker' }, p.kicker) : null,
        h('span', { className: 'tf-promo-title' }, p.title),
        h('span', { className: cx('tf-promo-cta', p.solid && 'is-solid') }, p.cta || 'Xem ngay', p.solid ? null : h(Icon, { name: 'arrow', size: 14 }))),
      h('span', { className: 'tf-promo-art' }, imgs.length ? imgs.map(function (src, i) {
        return h(Photo, { key: i, src: src });
      }) : p.art ? h(ProductArt, { kind: p.art }) : null));
  }

  /* ---------- SiteHeader: dark promise strip + white bar ---------- */
  var DEFAULT_NAV = ['Nồi chảo', 'Nồi cơm điện', 'Nồi chiên', 'Máy xay & ép', 'Dao & dụng cụ'];
  var DEFAULT_TOP = [{ icon: 'shield', text: 'Hàng chính hãng Tefal' }, { icon: 'award', text: 'Bảo hành theo hãng' }, { icon: 'store', text: 'Xem thử tại showroom' }];
  /* ---------- NavDropdown: mục menu có bảng chọn bên dưới (vd. "Tất cả sản phẩm" → các danh mục).
     Bấm để mở/đóng; Esc hoặc bấm ra ngoài thì đóng, Esc trả focus về nút. ---------- */
  function NavDropdown(p) {
    var st = React.useState(false), open = st[0], setOpen = st[1];
    var boxRef = React.useRef(null), btnRef = React.useRef(null);
    var id = 'tf-navdrop-' + (p.id || 'menu');
    React.useEffect(function () {
      if (!open) return;
      function outside(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); }
      function esc(e) { if (e.key === 'Escape') { setOpen(false); if (btnRef.current) btnRef.current.focus(); } }
      document.addEventListener('mousedown', outside);
      document.addEventListener('keydown', esc);
      return function () { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', esc); };
    }, [open]);
    return h('div', { className: 'tf-navdrop', ref: boxRef },
      h('button', { type: 'button', ref: btnRef, className: cx('tf-navdrop-btn', p.active && 'is-active', open && 'is-open'), 'aria-expanded': open ? 'true' : 'false', 'aria-controls': id,
        onClick: function () { setOpen(!open); } }, p.label, h(Icon, { name: 'chevron', size: 14 })),
      h('div', { id: id, className: 'tf-navdrop-panel', hidden: !open },
        h('ul', { className: 'tf-navdrop-list' }, (p.children || []).map(function (c, i) {
          return h('li', { key: i }, h('a', { href: c.href, 'aria-current': c.current ? 'page' : undefined },
            c.icon ? h('span', { className: 'tf-navdrop-icon' }, h(Icon, { name: c.icon, size: 18 })) : null,
            h('span', { className: 'tf-navdrop-name' }, c.label),
            c.count != null ? h('span', { className: 'tf-navdrop-count' }, c.count) : null));
        })),
        p.allHref ? h('a', { className: 'tf-navdrop-all', href: p.allHref }, p.allLabel || 'Xem tất cả', h(Icon, { name: 'arrow', size: 14 })) : null));
  }

  /* ---------- MegaMenu: bảng chọn rộng hết màn hình dưới header (kiểu cửa hàng lớn).
     Hàng trên: các nhóm SP (rê chuột hoặc bấm để đổi nhóm). Cột trái: lối tắt của nhóm.
     Bên phải: lưới ảnh SP của nhóm. Bấm nút menu để mở/đóng; Esc hoặc bấm ra ngoài thì đóng. ---------- */
  function MegaMenu(p) {
    var st = React.useState(false), open = st[0], setOpen = st[1];
    var gs = React.useState(p.initial || 0), cur = gs[0], setCur = gs[1];
    var boxRef = React.useRef(null), btnRef = React.useRef(null);
    var id = 'tf-mega-' + (p.id || 'menu');
    React.useEffect(function () {
      if (!open) return;
      function outside(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); }
      function esc(e) { if (e.key === 'Escape') { setOpen(false); if (btnRef.current) btnRef.current.focus(); } }
      document.addEventListener('mousedown', outside);
      document.addEventListener('keydown', esc);
      return function () { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', esc); };
    }, [open]);
    var groups = p.groups || [], g = groups[cur] || {};
    return h('div', { className: 'tf-mega', ref: boxRef },
      h('button', { type: 'button', ref: btnRef, className: cx('tf-navdrop-btn', p.active && 'is-active', open && 'is-open'), 'aria-expanded': open ? 'true' : 'false', 'aria-controls': id,
        onClick: function () { setOpen(!open); } }, p.label, h(Icon, { name: 'chevron', size: 14 })),
      h('div', { id: id, className: 'tf-mega-panel', hidden: !open },
        h('div', { className: 'tf-mega-inner' },
          h('nav', { className: 'tf-mega-tabs', 'aria-label': 'Nhóm sản phẩm' }, groups.map(function (x, i) {
            // Rê chuột / focus: xem trước nhóm bên dưới. Bấm: mở trang danh mục của nhóm.
            return h('a', { key: i, href: x.href, className: cx('tf-mega-tab', i === cur && 'is-on'),
              onMouseEnter: function () { setCur(i); }, onFocus: function () { setCur(i); } }, x.label);
          })),
          h('div', { className: 'tf-mega-body' },
            h('ul', { className: 'tf-mega-side' }, (g.links || []).map(function (l, i) {
              return h('li', { key: i }, h('a', { href: l.href, className: i === 0 ? 'is-first' : undefined }, l.label));
            })),
            h('ul', { className: 'tf-mega-grid' }, (g.items || []).map(function (it, i) {
              return h('li', { key: i }, h('a', { href: it.href },
                h(Plate, { image: it.image, alt: '', art: it.art }),
                h('span', null, it.label)));
            }))),
          p.allHref ? h('a', { className: 'tf-navdrop-all', href: p.allHref }, p.allLabel || 'Xem tất cả', h(Icon, { name: 'arrow', size: 14 })) : null)));
  }

  function SiteHeader(p) {
    var nav = (p.items || DEFAULT_NAV).map(function (n) { return typeof n === 'string' ? { label: n, href: '#' } : n; });
    var top = p.top || DEFAULT_TOP;
    function submit(e) {
      e.preventDefault();
      var q = e.currentTarget.querySelector('input').value.trim();
      if (p.onSearch) p.onSearch(q);
    }
    var cart = h(p.cartHref ? 'a' : 'button', { className: 'tf-icon-btn', type: p.cartHref ? undefined : 'button', href: p.cartHref, onClick: p.onCart, 'aria-label': 'Giỏ hàng, ' + (p.cartCount || 0) + ' sản phẩm' },
      h(Icon, { name: 'bag', size: 22 }), p.cartCount ? h('span', { className: 'tf-cart-count', 'aria-hidden': 'true' }, p.cartCount) : null);
    return h('header', { className: cx('tf-site-header', p.compact && 'tf-header-compact') },
      h('div', { className: 'tf-topbar' },
        h('div', { className: 'tf-topbar-inner' },
          (p.compact ? top.slice(0, 1) : top).map(function (t, i) {
            return h('span', { key: i, className: 'tf-topbar-item' }, h(Icon, { name: t.icon, size: 16 }), t.text);
          }),
          p.compact ? null : h('span', { className: 'tf-topbar-end' },
            p.contact ? h('a', { className: 'tf-topbar-item', href: p.contact.href || '#' }, h(Icon, { name: 'phone', size: 16 }), p.contact.text) : null,
            p.account ? h('a', { className: 'tf-topbar-item', href: p.account.href || '#' }, h(Icon, { name: 'user', size: 16 }), p.account.text) : null))),
      h('div', { className: 'tf-header' },
        p.compact ? h('button', { className: 'tf-icon-btn', type: 'button', 'aria-label': 'Mở menu', 'aria-expanded': p.menuOpen ? 'true' : 'false', onClick: p.onMenu }, h(Icon, { name: 'menu', size: 22 })) : null,
        h('a', { className: 'tf-wordmark', href: p.homeHref || '/' },
          h('span', { className: 'tf-wordmark-name' }, p.name || 'Tefal'),
          h('span', { className: 'tf-wordmark-sub' }, p.sub || 'Thương hiệu danh tiếng từ Pháp')),
        p.compact ? null : h('nav', { className: 'tf-nav', 'aria-label': 'Danh mục chính' }, nav.map(function (n, i) {
          if (n.mega) return h(MegaMenu, { key: i, id: String(i), label: n.label, groups: n.mega, initial: n.megaInitial, allHref: n.href, allLabel: n.allLabel, active: n.label === p.active });
          if (n.children) return h(NavDropdown, { key: i, id: String(i), label: n.label, children: n.children, allHref: n.href, allLabel: n.allLabel, active: n.label === p.active });
          return h('a', { key: i, href: n.href, 'aria-current': n.label === p.active ? 'page' : undefined }, n.label);
        })),
        h('div', { className: 'tf-header-tools' },
          p.compact ? null : h('form', { onSubmit: submit, className: 'tf-search-form' }, h(SearchField, { id: 'tf-header-search', defaultValue: p.query })),
          p.compact ? h('button', { className: 'tf-icon-btn', type: 'button', 'aria-label': 'Tìm sản phẩm', onClick: p.onSearchOpen }, h(Icon, { name: 'search', size: 22 })) : null,
          p.account ? h('a', { className: 'tf-icon-btn' + (p.account.signedIn ? ' is-signed' : ''), href: p.account.href || '#', 'aria-label': p.account.label || p.account.text }, h(Icon, { name: 'user', size: 22 })) : null,
          cart)));
  }

  /* ---------- Form fields: label above, hint and error below, error tied by aria-describedby ---------- */
  function Field(p) {
    var errId = p.id + '-loi', hintId = p.id + '-goi-y';
    var desc = [p.hint ? hintId : null, p.error ? errId : null].filter(Boolean).join(' ') || undefined;
    return h('div', { className: 'tf-field' + (p.error ? ' is-invalid' : '') },
      h('label', { htmlFor: p.id }, p.label, p.optional ? h('span', { className: 'tf-field-opt' }, ' (không bắt buộc)') : null),
      h('div', { className: 'tf-field-control' },
        h('input', {
          id: p.id, name: p.name || p.id, type: p.type || 'text', value: p.value, autoComplete: p.autoComplete, inputMode: p.inputMode,
          required: !p.optional, 'aria-invalid': p.error ? 'true' : undefined, 'aria-describedby': desc, spellCheck: false,
          onChange: function (e) { if (p.onChange) p.onChange(e.target.value); }
        }),
        p.addon || null),
      p.hint ? h('p', { id: hintId, className: 'tf-field-hint' }, p.hint) : null,
      p.error ? h('p', { id: errId, className: 'tf-field-error' }, p.error) : null);
  }

  function PasswordField(p) {
    var s = React.useState(false), show = s[0], setShow = s[1];
    return h(Field, Object.assign({}, p, {
      type: show ? 'text' : 'password',
      addon: h('button', { type: 'button', className: 'tf-field-eye', 'aria-pressed': show ? 'true' : 'false', 'aria-label': 'Hiện mật khẩu', onClick: function () { setShow(!show); } },
        h(Icon, { name: show ? 'eyeOff' : 'eye', size: 18 }))
    }));
  }

  function SelectField(p) {
    var errId = p.id + '-loi';
    return h('div', { className: 'tf-field' + (p.error ? ' is-invalid' : '') },
      h('label', { htmlFor: p.id }, p.label),
      h('div', { className: 'tf-field-control tf-select' },
        h('select', { id: p.id, name: p.id, value: p.value, autoComplete: p.autoComplete, required: true, 'aria-invalid': p.error ? 'true' : undefined, 'aria-describedby': p.error ? errId : undefined,
          onChange: function (e) { if (p.onChange) p.onChange(e.target.value); } },
          h('option', { value: '' }, p.placeholder || 'Chọn'),
          (p.options || []).map(function (o) { return h('option', { key: o, value: o }, o); }))),
      p.error ? h('p', { id: errId, className: 'tf-field-error' }, p.error) : null);
  }

  /* ---------- ChoiceGroup: radio choices drawn as cards ---------- */
  function ChoiceGroup(p) {
    return h('fieldset', { className: 'tf-choices' },
      h('legend', null, p.legend),
      p.items.map(function (it) {
        var id = p.name + '-' + it.key;
        return h('label', { key: it.key, htmlFor: id, className: 'tf-choice' + (p.value === it.key ? ' is-on' : '') + (it.disabled ? ' is-off' : '') },
          h('input', { type: 'radio', id: id, name: p.name, value: it.key, checked: p.value === it.key, disabled: it.disabled, onChange: function () { if (p.onChange) p.onChange(it.key); } }),
          it.icon ? h('span', { className: 'tf-choice-icon' }, h(Icon, { name: it.icon, size: 20 })) : null,
          h('span', { className: 'tf-choice-text' }, h('strong', null, it.title), h('span', null, it.text)));
      }));
  }

  /* ---------- GoogleButton: the multicolour G per Google's sign-in button guidance ---------- */
  function GoogleButton(p) {
    return h('button', { type: 'button', className: 'tf-google', onClick: p.onClick },
      h('svg', { width: 18, height: 18, viewBox: '0 0 48 48', 'aria-hidden': 'true', focusable: 'false' },
        h('path', { fill: '#EA4335', d: 'M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z' }),
        h('path', { fill: '#4285F4', d: 'M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z' }),
        h('path', { fill: '#FBBC05', d: 'M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z' }),
        h('path', { fill: '#34A853', d: 'M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z' })),
      p.children || 'Tiếp tục với Google');
  }

  /* ---------- LoginGate: shown in place of a page that needs an account ---------- */
  function LoginGate(p) {
    return h('div', { className: 'tf-gate' },
      h('span', { className: 'tf-placed-icon' }, h(Icon, { name: 'user', size: 28 })),
      h('h1', { className: 'tf-auth-title' }, p.title),
      h('p', null, p.text || 'Bạn cần đăng nhập để tiếp tục. Chưa có tài khoản thì đăng ký mất chưa tới một phút.'),
      h('div', { className: 'tf-hero-actions' },
        h(Button, { variant: 'primary', href: p.signInHref || '#' }, 'Đăng nhập'),
        h(Button, { href: p.signUpHref || '#' }, 'Đăng ký')),
      h('a', { className: 'tf-link', href: p.browseHref || '#' }, p.browseLabel || 'Tiếp tục xem sản phẩm'));
  }

  var api = {
    Button: Button, Badge: Badge, SearchField: SearchField, PriceTag: PriceTag, SpecFigure: SpecFigure,
    SpecTable: SpecTable, ProductArt: ProductArt, ProductCard: ProductCard, CategoryIndex: CategoryIndex,
    SiteHeader: SiteHeader, NavDropdown: NavDropdown, MegaMenu: MegaMenu, SectionTitle: SectionTitle, TrustBar: TrustBar, CategoryTile: CategoryTile,
    PromoBanner: PromoBanner, Plate: Plate, Photo: Photo, Icon: Icon, Field: Field, PasswordField: PasswordField,
    SelectField: SelectField, ChoiceGroup: ChoiceGroup, GoogleButton: GoogleButton, LoginGate: LoginGate, QuickView: QuickView, photoCrop: null, formatVND: vnd
  };
  window.TF = Object.assign(window.TF || {}, api);
})();
