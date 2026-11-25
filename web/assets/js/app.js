/* Tefal Web — bản chạy thử. Ghép các trang từ bộ khung (window.TF) và dữ liệu (window.TF_DATA).
   Mỗi file HTML đặt <body data-page="home|category|product|cart">. */
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
  var B = window.TF;
  var D = window.TF_DATA;
  // Ảnh tạm lấy từ bucket cũ đều theo một khuôn: sản phẩm bên trái, logo và ô khuyến mãi của cửa hàng cũ
  // bên phải. Cắt lấy vùng sản phẩm cho tới khi có ảnh sạch. Có ảnh sạch thì đặt lại null.
  B.photoCrop = { x: 0.02, y: 0.13, w: 0.6, h: 0.8 };

  /* ---------------- dữ liệu ---------------- */
  // Object.create(null): ?id=constructor, ?nhom=__proto__ không trúng thuộc tính có sẵn của Object
  var byId = Object.create(null);
  D.products.forEach(function (p) { byId[p.id] = p; });
  var groupByKey = Object.create(null);
  D.groups.forEach(function (g) { groupByKey[g.key] = g; });
  var KITCHEN = D.kitchen;
  // Menu chính. Danh mục SP vào qua "Tất cả sản phẩm" (hàng nhóm ở đầu trang) và 6 ô danh mục ở trang chủ.
  var NAV = [
    { label: 'Trang chủ', href: 'index.html' },
    { label: 'Tất cả sản phẩm', href: 'danh-muc.html' },
    { label: 'Thương hiệu', href: 'thuong-hieu.html' },
    { label: 'Xuất xứ', href: 'xuat-xu.html' },
    { label: 'Bài viết', href: 'bai-viet.html' }
  ];
  // Mục menu sáng lên theo trang đang xem
  var NAV_OF_PAGE = { home: 'Trang chủ', category: 'Tất cả sản phẩm', product: 'Tất cả sản phẩm', compare: 'Tất cả sản phẩm', brand: 'Thương hiệu', origin: 'Xuất xứ', blog: 'Bài viết' };
  var ORIGINS = ['Pháp', 'Trung Quốc', 'Việt Nam', 'Nhật Bản', 'Ý'];

  function catHref(key) { return 'danh-muc.html?nhom=' + key; }
  function prodHref(id) { return 'san-pham.html?id=' + encodeURIComponent(id); }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function norm(s) {
    return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }
  function metaOf(p) { return 'Model ' + p.model + (p.origin ? ', sản xuất tại ' + p.origin : ''); }
  function badgesOf(p) {
    var b = [];
    if (p.stock) b.push({ text: 'Còn hàng', tone: 'ok', dot: true });
    if (p.w) b.push({ text: 'Bảo hành ' + p.w + ' tháng' });
    return b;
  }
  function figOf(p) { return p.fig ? { value: p.fig.v, unit: p.fig.u, label: p.fig.l } : null; }
  function figNum(p) {
    if (!p.fig) return -1;
    var parts = String(p.fig.v).split('–');
    return parseFloat(parts[parts.length - 1].replace(',', '.')) || -1;
  }
  function artOf(p) { return (groupByKey[p.g] || {}).art || 'pan'; }

  /* ---------------- giỏ hàng, yêu thích, so sánh: khách không cần đăng nhập ----------------
     Đã đăng nhập: localStorage theo email (giữ lâu). Khách: sessionStorage (mất khi đóng tab).
     Khi khách đăng nhập hoặc đăng ký, danh sách trong phiên được gộp vào tài khoản (mergeGuestLists). */
  var CART_BASE = 'tefal-web-cart', WISH_BASE = 'tefal-web-yeu-thich', CMP_BASE = 'tefal-web-so-sanh', CMP_MAX = 4;
  var GUEST = 'khach';
  var memLists = {};
  function listKey(base) { var u = readUser(); return base + ':' + (u ? u.email : GUEST); }
  function listStore() { return readUser() ? localStorage : sessionStorage; }
  function readList(base) {
    var k = listKey(base);
    try { var v = JSON.parse(listStore().getItem(k)); return Array.isArray(v) ? v : []; } catch (e) { return (memLists[k] || []).slice(); }
  }
  function writeList(base, v) {
    var k = listKey(base); memLists[k] = v.slice();
    try { listStore().setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function mergeGuestLists(email) {
    function take(base) {
      try { var v = JSON.parse(sessionStorage.getItem(base + ':' + GUEST)); sessionStorage.removeItem(base + ':' + GUEST); return Array.isArray(v) ? v : []; } catch (e) { return []; }
    }
    function load(base) { try { var v = JSON.parse(localStorage.getItem(base + ':' + email)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
    function save(base, v) { try { localStorage.setItem(base + ':' + email, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
    var gc = take(CART_BASE), gw = take(WISH_BASE), gs = take(CMP_BASE);
    if (gc.length) {
      var cart = load(CART_BASE);
      gc.forEach(function (x) { var it = cart.filter(function (y) { return y.id === x.id; })[0]; if (it) it.qty += x.qty; else cart.push(x); });
      save(CART_BASE, cart);
    }
    if (gw.length) { var w = load(WISH_BASE); gw.forEach(function (id) { if (w.indexOf(id) < 0) w.push(id); }); save(WISH_BASE, w); }
    if (gs.length) { var c = load(CMP_BASE); gs.forEach(function (id) { if (c.indexOf(id) < 0) c.push(id); }); save(CMP_BASE, c.slice(0, CMP_MAX)); }
  }

  function readWish() { return readList(WISH_BASE).filter(function (id) { return byId[id]; }); }
  function toggleWish(id) {
    var a = readWish(), on = a.indexOf(id) < 0;
    a = on ? a.concat([id]) : a.filter(function (x) { return x !== id; });
    writeList(WISH_BASE, a);
    window.dispatchEvent(new Event('tf-wish'));
    toast((on ? 'Đã thêm vào yêu thích: ' : 'Đã bỏ khỏi yêu thích: ') + byId[id].name);
  }
  function readCmp() { return readList(CMP_BASE).filter(function (id) { return byId[id]; }).slice(0, CMP_MAX); }
  function writeCmp(a) { writeList(CMP_BASE, a); window.dispatchEvent(new Event('tf-compare')); }
  function toggleCompare(id) {
    var a = readCmp();
    if (a.indexOf(id) >= 0) { writeCmp(a.filter(function (x) { return x !== id; })); toast('Đã bỏ khỏi so sánh: ' + byId[id].name); return; }
    if (a.length >= CMP_MAX) { toast('Chỉ so sánh được ' + CMP_MAX + ' mẫu cùng lúc. Bỏ bớt một mẫu trước.'); return; }
    writeCmp(a.concat([id]));
    toast('Đã thêm vào so sánh (' + (a.length + 1) + '/' + CMP_MAX + '): ' + byId[id].name);
  }
  function cardProps(p) {
    return {
      key: p.id, name: p.name, href: prodHref(p.id), image: p.img, art: artOf(p),
      price: p.price, original: p.orig || undefined, figure: figOf(p),
      onAdd: function () { addToCart(p.id); },
      onWish: function () { toggleWish(p.id); }, wished: readWish().indexOf(p.id) >= 0,
      onCompare: function () { toggleCompare(p.id); }, compared: readCmp().indexOf(p.id) >= 0,
      onQuickView: function (el) { window.dispatchEvent(new CustomEvent('tf-quick', { detail: { id: p.id, el: el } })); }
    };
  }
  var ICON_OF = { 'noi-chao': 'pot', 'noi-com-dien': 'cooker', 'noi-chien': 'fryer', 'noi-ap-suat': 'cooker', 'may-xay-ep': 'blender', 'dao-dung-cu': 'knife', 'am-dun': 'kettle', 'may-loc-nuoc': 'drop', 'khac': 'pot', 'ngoai-bep': 'home' };
  var MAX_W = D.products.reduce(function (n, p) { return Math.max(n, p.w || 0); }, 0);
  var TRUST = [
    { icon: 'shield', title: 'Chính hãng Tefal', text: 'Thương hiệu của Groupe SEB' },
    { icon: 'award', title: 'Bảo hành đến ' + MAX_W + ' tháng', text: 'Theo chính sách của hãng' },
    { icon: 'tag', title: 'Giá niêm yết rõ', text: 'Hiện cả giá gốc và mức giảm' },
    { icon: 'store', title: 'Tư vấn tại showroom', text: 'Xem và nấu thử trước khi mua' }
  ];
  function vnd(n) { return B.formatVND(n); }

  /* ---------------- tiêu đề và mô tả trang (title, meta description, og) ---------------- */
  function setMetaTag(sel, attr, val) { var m = document.querySelector(sel); if (m && val) m.setAttribute(attr, val); }
  function setMeta(title, desc) {
    document.title = title;
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[name="description"]', 'content', desc);
    setMetaTag('meta[property="og:description"]', 'content', desc);
  }
  function groupDesc(g) {
    var ps = D.products.filter(function (p) { return p.g === g.key && p.price > 0; });
    if (!ps.length) return g.name + ' Tefal: ' + g.total + ' mẫu, gọi để được báo giá.';
    var lo = Math.min.apply(null, ps.map(function (p) { return p.price; }));
    var hi = Math.max.apply(null, ps.map(function (p) { return p.price; }));
    var sale = ps.filter(function (p) { return p.pct > 0; }).length;
    return g.name + ' Tefal: ' + ps.length + ' mẫu, giá từ ' + vnd(lo) + ' đến ' + vnd(hi) + (sale ? ', ' + sale + ' mẫu đang giảm giá' : '') + '. Xem thông số, so sánh rồi đặt hàng.';
  }
  function productDesc(p) {
    var bits = [p.full];
    if (p.fig) bits.push(p.fig.l.toLowerCase() + ' ' + p.fig.v + ' ' + p.fig.u);
    bits.push(p.price > 0 ? 'giá ' + vnd(p.price) + (p.pct > 0 ? ' (giảm ' + p.pct + '%)' : '') : 'gọi để báo giá');
    if (p.w) bits.push('bảo hành ' + p.w + ' tháng');
    if (p.origin) bits.push('sản xuất tại ' + p.origin);
    return bits.join(', ') + '.';
  }

  /* ---------------- giỏ hàng: khách thêm được (lưu trong phiên), đặt hàng mới cần đăng nhập ---------------- */
  function readCart() {
    return readList(CART_BASE).filter(function (x) { return x && byId[x.id]; })
      .map(function (x) { return { id: x.id, qty: Math.min(99, Math.max(1, parseInt(x.qty, 10) || 1)) }; });
  }
  function writeCart(c) {
    writeList(CART_BASE, c);
    window.dispatchEvent(new Event('tf-cart'));
  }
  function here() { return (location.pathname.split('/').pop() || 'index.html') + location.search; }
  function loginHref(next) { return 'tai-khoan.html?ly-do=mua-hang&tiep=' + encodeURIComponent(next || here()); }
  function addToCart(id) {
    var c = readCart();
    var it = c.filter(function (x) { return x.id === id; })[0];
    if (it) it.qty += 1; else c.push({ id: id, qty: 1 });
    writeCart(c);
    toast('Đã thêm vào giỏ: ' + byId[id].name);
  }
  function setQty(id, qty) {
    writeCart(readCart().map(function (x) { return x.id === id ? { id: id, qty: Math.max(1, qty) } : x; }));
  }
  function removeItem(id) {
    writeCart(readCart().filter(function (x) { return x.id !== id; }));
    toast('Đã bỏ khỏi giỏ: ' + byId[id].name);
  }
  function useCart() {
    var s = useState(readCart), cart = s[0], setCart = s[1];
    useEffect(function () {
      function sync() { setCart(readCart()); }
      window.addEventListener('tf-cart', sync);
      window.addEventListener('tf-user', sync);
      window.addEventListener('storage', sync);
      return function () { window.removeEventListener('tf-cart', sync); window.removeEventListener('tf-user', sync); window.removeEventListener('storage', sync); };
    }, []);
    return cart;
  }

  /* ---------------- tài khoản (bản chạy thử: chỉ lưu trong trình duyệt, KHÔNG lưu mật khẩu) ----------------
     Khi có Supabase riêng: thay các hàm dưới bằng Supabase Auth (signUp / signInWithPassword / signOut),
     thông tin khách (họ tên, số điện thoại) để ở bảng profiles. */
  var USER_KEY = 'tefal-web-user', ACC_KEY = 'tefal-web-accounts';
  var memoryUser = null, memoryAcc = [];
  // Dò một lần: trình duyệt chặn lưu trữ thì không cho đăng nhập giả (mất ngay khi chuyển trang)
  var STORAGE_OK = (function () { try { localStorage.setItem('tefal-web-thu', '1'); localStorage.removeItem('tefal-web-thu'); return true; } catch (e) { return false; } })();
  // fallback chỉ dùng khi không đọc được localStorage; khóa không có thì trả null (vd. tab khác đã đăng xuất)
  function readJSON(key, fallback) {
    if (!STORAGE_OK) return fallback;
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
  function writeJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function readUser() { var u = readJSON(USER_KEY, memoryUser); return u && u.email ? u : null; }
  function readAccounts() { var a = readJSON(ACC_KEY, memoryAcc); return Array.isArray(a) ? a : []; }
  function setUser(u) {
    memoryUser = u;
    if (u) { writeJSON(USER_KEY, u); mergeGuestLists(u.email); } else { try { localStorage.removeItem(USER_KEY); } catch (e) { /* bỏ qua */ } }
    window.dispatchEvent(new Event('tf-user'));
  }
  function findAccount(email) {
    var e = email.trim().toLowerCase();
    return readAccounts().filter(function (a) { return a.email === e; })[0];
  }
  function register(acc) {
    var list = readAccounts();
    list.push(acc);
    memoryAcc = list;
    writeJSON(ACC_KEY, list);
    setUser(acc);
  }
  function useUser() {
    var s = useState(readUser), user = s[0], set = s[1];
    useEffect(function () {
      function sync() { set(readUser()); }
      window.addEventListener('tf-user', sync);
      window.addEventListener('storage', sync);
      return function () { window.removeEventListener('tf-user', sync); window.removeEventListener('storage', sync); };
    }, []);
    return user;
  }
  function firstName(name) { var w = (name || '').trim().split(/\s+/); return w[w.length - 1] || ''; }

  /* ---------------- thông báo nhỏ ---------------- */
  function toast(msg) { window.dispatchEvent(new CustomEvent('tf-toast', { detail: msg })); }
  function Toast() {
    var s = useState(''), msg = s[0], setMsg = s[1];
    useEffect(function () {
      var t;
      // xóa rồi đặt lại để trình đọc màn hình đọc cả khi chữ trùng lần trước
      function show(e) { clearTimeout(t); setMsg(''); t = setTimeout(function () { setMsg(e.detail); t = setTimeout(function () { setMsg(''); }, 4000); }, 60); }
      window.addEventListener('tf-toast', show);
      return function () { window.removeEventListener('tf-toast', show); clearTimeout(t); };
    }, []);
    return h('div', { className: 'tf-toast' + (msg ? ' is-on' : ''), role: 'status', 'aria-live': 'polite' }, msg);
  }

  /* ---------------- bố cục điện thoại ----------------
     CSS dùng media query (max-width: 767px); hook này chỉ chọn khung header gọn (compact) của TF.SiteHeader.
     Header gọn tới 1023px (khớp mốc .tf-only-* trong tf.css): 768–1023px menu đầy đủ bị xuống dòng. */
  function usePhone() {
    var mq = window.matchMedia('(max-width: 1023px)');
    var s = useState(mq.matches), phone = s[0], setPhone = s[1];
    useEffect(function () {
      function f(e) { setPhone(e.matches); }
      mq.addEventListener('change', f);
      return function () { mq.removeEventListener('change', f); };
    }, []);
    return phone;
  }

  /* ---------------- lớp phủ: menu và tìm kiếm trên điện thoại ---------------- */
  function Sheet(p) {
    var closeRef = useRef(null);
    useEffect(function () {
      var opener = document.activeElement; // trả focus về nút đã mở lớp phủ khi đóng
      if (closeRef.current) closeRef.current.focus();
      function esc(e) { if (e.key === 'Escape') p.onClose(); }
      document.addEventListener('keydown', esc);
      document.body.style.overflow = 'hidden';
      var behind = Array.prototype.filter.call(document.getElementById('root').children, function (el) { return !el.classList.contains('tf-sheet'); });
      behind.forEach(function (el) { el.inert = true; });
      return function () {
        document.removeEventListener('keydown', esc); document.body.style.overflow = '';
        behind.forEach(function (el) { el.inert = false; });
        if (opener && opener.focus && document.contains(opener)) opener.focus();
      };
    }, []);
    return h('div', { className: 'tf-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': p.label },
      h('div', { className: 'tf-sheet-head' },
        h('span', { className: 'tf-sheet-title' }, p.label),
        h('button', { ref: closeRef, className: 'tf-btn tf-btn-quiet', type: 'button', onClick: p.onClose }, 'Đóng')),
      p.children);
  }

  function MenuSheet(p) {
    var items = D.groups.filter(function (g) { return g.total > 0; }).map(function (g) {
      return { name: g.name, count: g.count, href: catHref(g.key) };
    });
    return h(Sheet, { label: 'Menu', onClose: p.onClose },
      h('nav', { className: 'tf-sheet-nav', 'aria-label': 'Menu chính' }, NAV.map(function (n) { return h('a', { key: n.href, href: n.href }, n.label); })),
      h('h2', { className: 'tf-sheet-sub' }, 'Danh mục'),
      h(B.CategoryIndex, { items: items, label: 'Tất cả danh mục' }),
      h('p', { className: 'tf-sheet-foot' },
        h('a', { className: 'tf-link', href: 'tai-khoan.html' }, readUser() ? 'Tài khoản của tôi' : 'Đăng nhập / Đăng ký'),
        h('a', { className: 'tf-link', href: 'gio-hang.html' }, 'Xem giỏ hàng')));
  }

  function SearchSheet(p) {
    var inputRef = useRef(null);
    useEffect(function () { var i = document.getElementById('tf-sheet-search'); if (i) i.focus(); }, []);
    function submit(e) { e.preventDefault(); p.onSearch(e.currentTarget.querySelector('input').value.trim()); }
    return h(Sheet, { label: 'Tìm sản phẩm', onClose: p.onClose },
      h('form', { onSubmit: submit, className: 'tf-sheet-form' },
        h(B.SearchField, { id: 'tf-sheet-search' }),
        h(B.Button, { variant: 'primary', type: 'submit', block: true }, 'Tìm')));
  }

  /* ---------------- khung chung ---------------- */
  function Footer() {
    var links = D.groups.filter(function (g) { return g.count > 0; });
    function subscribe(e) { e.preventDefault(); toast('Bản chạy thử chưa lưu đăng ký nhận tin.'); }
    return h('footer', { className: 'tf-footer' },
      h('div', { className: 'tf-container' },
        h('div', { className: 'tf-footer-trust' }, h(B.TrustBar, { dark: true, items: TRUST })),
        h('div', { className: 'tf-footer-cols' },
          h('div', { id: 'showroom' },
            h('a', { className: 'tf-wordmark', href: 'index.html' }, h('span', { className: 'tf-wordmark-name' }, 'Tefal'), h('span', { className: 'tf-wordmark-sub' }, 'Thương hiệu danh tiếng từ Pháp')),
            h('p', null, 'Nồi chảo, nồi cơm, nồi chiên, máy xay và dụng cụ bếp Tefal. Mỗi sản phẩm hiện rõ thông số và giá.'),
            h('p', null, 'Showroom: địa chỉ, giờ mở cửa và số điện thoại tư vấn sẽ đặt ở đây.')),
          h('div', null,
            h('h2', null, 'Danh mục'),
            h('ul', null, links.map(function (g) { return h('li', { key: g.key }, h('a', { href: catHref(g.key) }, g.name)); }))),
          h('div', null,
            h('h2', null, 'Mua hàng'),
            h('ul', null,
              h('li', null, h('a', { href: 'danh-muc.html' }, 'Tất cả đồ bếp')),
              h('li', null, h('a', { href: 'danh-muc.html?sap=giam-gia' }, 'Đang giảm giá')),
              h('li', null, h('a', { href: 'gio-hang.html' }, 'Giỏ hàng')))),
          h('div', null,
            h('h2', null, 'Nhận tin ưu đãi'),
            h('p', null, 'Báo khi có mẫu mới hoặc đợt giảm giá.'),
            h('form', { className: 'tf-subscribe', onSubmit: subscribe },
              h('label', { className: 'tf-sr', htmlFor: 'tf-sub-email' }, 'Email của bạn'),
              h('input', { id: 'tf-sub-email', type: 'email', required: true, placeholder: 'Email của bạn', autoComplete: 'email' }),
              h('button', { type: 'submit' }, 'Đăng ký')))),
        h('div', { className: 'tf-footer-bottom' },
          h('span', null, 'Bản chạy thử. Giá và tồn kho lấy từ dữ liệu ngày 12/10/2026.'),
          h('span', null, 'Tefal là thương hiệu của Groupe SEB.'))));
  }

  function shortName(p) {
    // "Nồi cơm điện tử Delirice RK7711Y0 1.8L" -> bỏ mã model và dung tích ở cuối cho gọn
    return p.name.replace(new RegExp('\\s*' + p.model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*$'), '').replace(/,\s*$/, '') || p.name;
  }
  function megaGroup(g) {
    var ps = D.products.filter(function (p) { return p.g === g.key && p.img; })
      .sort(function (a, b) { return (b.price > 0) - (a.price > 0) || b.pct - a.pct || b.price - a.price; }).slice(0, 12);
    var links = [{ label: 'Tất cả ' + g.name.toLowerCase(), href: catHref(g.key) }];
    if (D.products.some(function (p) { return p.g === g.key && p.pct > 0; })) links.push({ label: 'Đang giảm giá', href: catHref(g.key) + '&sap=giam-gia' });
    links.push({ label: 'Giá thấp đến cao', href: catHref(g.key) + '&sap=gia-tang' });
    if (D.products.some(function (p) { return p.g === g.key && p.fig; })) links.push({ label: 'Xếp theo con số', href: catHref(g.key) + '&sap=con-so' });
    if (D.products.some(function (p) { return p.g === g.key && p.origin === 'Pháp'; })) links.push({ label: 'Sản xuất tại Pháp', href: catHref(g.key) + '&xuat-xu=' + encodeURIComponent('Pháp') });
    return {
      label: g.name, href: catHref(g.key), links: links,
      items: ps.map(function (p) { return { label: shortName(p), href: prodHref(p.id), image: p.img, art: artOf(p) }; })
    };
  }

  function Shell(p) {
    var phone = usePhone();
    var cart = useCart();
    var user = useUser();
    var m = useState(false), menu = m[0], setMenu = m[1];
    var s = useState(false), search = s[0], setSearch = s[1];
    var count = cart.reduce(function (n, x) { return n + x.qty; }, 0);
    function goSearch(q) { location.href = 'danh-muc.html' + (q ? '?q=' + encodeURIComponent(q) : ''); }
    return h(React.Fragment, null,
      h('a', { className: 'tf-skip', href: '#noi-dung' }, 'Bỏ qua, tới nội dung'),
      h(B.SiteHeader, {
        compact: phone, homeHref: 'index.html', active: p.active || NAV_OF_PAGE[document.body.getAttribute('data-page')], query: p.query,
        items: NAV.map(function (n) {
          if (n.href !== 'danh-muc.html') return n;
          // Bảng chọn lớn: mỗi nhóm có cột lối tắt và tối đa 12 mẫu có ảnh (giảm giá sâu trước, rồi giá cao)
          var groups = D.groups.filter(function (g) { return g.total > 0; });
          var cur = groups.map(function (g) { return g.key; }).indexOf(param('nhom'));
          return Object.assign({}, n, {
            allLabel: 'Xem tất cả ' + D.products.length + ' sản phẩm',
            megaInitial: cur < 0 ? 0 : cur,
            mega: groups.map(function (g) { return megaGroup(g); })
          });
        }),
        top: [{ icon: 'shield', text: 'Hàng chính hãng Tefal' }, { icon: 'award', text: 'Bảo hành đến ' + MAX_W + ' tháng' }, { icon: 'store', text: 'Xem và nấu thử tại showroom' }],
        contact: { text: 'Liên hệ showroom', href: '#showroom' },
        account: user
          ? { href: 'tai-khoan.html', text: 'Chào, ' + firstName(user.name), label: 'Tài khoản của ' + user.name, signedIn: true }
          : { href: 'tai-khoan.html', text: 'Đăng nhập / Đăng ký', label: 'Đăng nhập hoặc đăng ký' },
        cartCount: count, cartHref: 'gio-hang.html',
        onSearch: goSearch, onSearchOpen: function () { setSearch(true); },
        onMenu: function () { setMenu(true); }, menuOpen: menu
      }),
      menu ? h(MenuSheet, { onClose: function () { setMenu(false); } }) : null,
      search ? h(SearchSheet, { onClose: function () { setSearch(false); }, onSearch: goSearch }) : null,
      h('main', { id: 'noi-dung', className: 'tf-container', tabIndex: -1 }, p.children),
      h(Footer),
      p.after || null,
      h(QuickHost),
      h(CompareBar),
      h(Toast));
  }

  function CompareBar() {
    var ids = readCmp();
    if (!ids.length || document.body.getAttribute('data-page') === 'compare') return null;
    return h('div', { className: 'tf-cmpbar', role: 'region', 'aria-label': 'Sản phẩm đang so sánh' },
      h('span', { className: 'tf-cmpbar-thumbs', 'aria-hidden': 'true' }, ids.map(function (id) {
        return h('span', { key: id, className: 'tf-cmpbar-thumb' }, h(B.Plate, { image: byId[id].img, alt: '', art: artOf(byId[id]) }));
      })),
      h('span', { className: 'tf-cmpbar-text' }, 'So sánh ' + ids.length + '/' + CMP_MAX),
      h(B.Button, { variant: 'primary', size: 'sm', href: 'so-sanh.html' }, 'Xem so sánh'),
      h('button', { type: 'button', className: 'tf-cmpbar-clear', 'aria-label': 'Xóa hết sản phẩm so sánh', onClick: function () { writeCmp([]); } }, h(B.Icon, { name: 'close', size: 16 })));
  }

  /* ---------------- xem nhanh: bấm thẻ SP mở modal (ảnh trái, thông tin và nút phải) ---------------- */
  function QuickHost() {
    var s = useState(null), open = s[0], setOpen = s[1];
    useEffect(function () {
      function show(e) { if (byId[e.detail.id]) { setOpen(e.detail); noteViewed(e.detail.id); } }
      window.addEventListener('tf-quick', show);
      return function () { window.removeEventListener('tf-quick', show); };
    }, []);
    if (!open) return null;
    var p = byId[open.id];
    var g = groupByKey[p.g] || {};
    var figs = [];
    if (p.fig) figs.push({ value: p.fig.v, unit: p.fig.u, label: p.fig.l });
    if (p.power && !(p.fig && p.fig.u === 'W')) figs.push({ value: p.power, unit: 'W', label: 'Công suất' });
    if (p.w) figs.push({ value: String(p.w), unit: 'tháng', label: 'Bảo hành' });
    function close() { setOpen(null); }
    return h(B.QuickView, {
      returnFocus: open.el,
      onClose: close,
      product: {
        name: p.name, kicker: g.name, meta: metaOf(p), href: prodHref(p.id), art: artOf(p),
        images: [p.img, p.img2], price: p.price, original: p.orig || undefined,
        badges: badgesOf(p), figures: figs,
        specs: p.specs.filter(function (r) { return !/^(Bảo hành|Xuất xứ)$/.test(r[0]); })
      },
      onAdd: function () { close(); addToCart(p.id); },
      callHref: '#showroom',
      note: 'Xem và nấu thử tại showroom trước khi mua.'
    });
  }

  /* ---------------- trang chủ ---------------- */
  // Ảnh đại diện cho từng danh mục: mẫu có ảnh rõ, nhìn ra ngay là loại gì
  var TILES = [
    { key: 'noi-chao', img: 'NC-060' }, { key: 'noi-com-dien', img: 'DK-067' }, { key: 'noi-chien', img: 'DK-068' },
    { key: 'may-xay-ep', img: 'DK-050' }, { key: 'dao-dung-cu', img: 'DK-052' }, { key: 'am-dun', img: 'DK-088' }
  ];
  function imgOf(id) { return (byId[id] || {}).img; }

  /* ---------------- khối ưu đãi trong ngày có đếm ngược (viết riêng cho Tefal, bố cục tham khảo mẫu người dùng gửi) ----------------
     Khung giờ chạy lặp lại mỗi ngày; người dùng chốt 06:00–23:59 (16/10/2026). Đổi giờ thì sửa FLASH bên dưới. */
  var FLASH = { title: 'Giờ vàng giá tốt', from: '06:00:00', to: '23:59:59' };
  function atTime(hms) { var t = hms.split(':').map(Number), d = new Date(); d.setHours(t[0] || 0, t[1] || 0, t[2] || 0, 0); return d; }
  function useFlashClock() {
    var s = useState(Date.now()), now = s[0], setNow = s[1];
    useEffect(function () { var t = setInterval(function () { setNow(Date.now()); }, 1000); return function () { clearInterval(t); }; }, []);
    var start = atTime(FLASH.from).getTime(), end = atTime(FLASH.to).getTime();
    if (now < start) return { state: 'soon', left: start - now };
    if (now <= end) return { state: 'on', left: end - now };
    return { state: 'over', left: 0 };
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  // Số lăn (ý tưởng từ Counter của React Bits, viết lại gọn): mỗi chữ số là một dải 0–9 trượt dọc trong ô cao 1 dòng
  function RollNumber(props) {
    return h('strong', { className: 'tf-roll' }, pad2(props.value).split('').map(function (d, i) {
      return h('span', { key: i, className: 'tf-roll-d' },
        h('span', { className: 'tf-roll-strip', style: { transform: 'translateY(' + (-d * 10) + '%)' } },
          '0123456789'.split('').map(function (n) { return h('span', { key: n }, n); })));
    }));
  }
  function FlashSale(p) {
    var c = useFlashClock();
    // Tự trượt sang trái mỗi 2 giây, hết thì quay về đầu. Dừng khi rê chuột, khi focus vào trong,
    // hoặc khi người dùng bấm Tạm dừng (WCAG 2.2.2). Máy đặt giảm chuyển động thì nhảy thẳng, không trượt mượt.
    var listRef = useRef(null);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ps = useState(false), paused = ps[0], setPaused = ps[1];
    var how = reduce ? 'auto' : 'smooth';
    var hs = useState(false), hold = hs[0], setHold = hs[1];
    function step(dir) {
      var el = listRef.current; if (!el) return;
      var card = el.querySelector('.tf-flash-card'); if (!card) return;
      var w = card.getBoundingClientRect().width;
      var atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: how });
      else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: how });
      else el.scrollBy({ left: dir * w, behavior: how });
    }
    useEffect(function () {
      if (paused || hold) return;
      var t = setInterval(function () { step(1); }, 3000);
      return function () { clearInterval(t); };
    }, [paused, hold]);
    var sec = Math.floor(c.left / 1000), hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60), ss = sec % 60;
    var label = c.state === 'soon' ? 'Chương trình bắt đầu sau' : c.state === 'on' ? 'Chương trình kết thúc sau' : 'Hôm nay đã kết thúc. Mở lại lúc ' + FLASH.from.slice(0, 5) + ' ngày mai';
    // Đọc cho trình đọc màn hình theo phút, không đọc từng giây
    var spoken = c.state === 'over' ? label : label + ' ' + hh + ' giờ ' + mm + ' phút';
    return h('section', { className: 'tf-flash', 'aria-labelledby': 'tf-flash-title' },
      h('div', { className: 'tf-flash-head' },
        h('h2', { id: 'tf-flash-title', className: 'tf-flash-title' }, h('a', { href: 'danh-muc.html?sap=giam-gia' }, FLASH.title)),
        h('div', { className: 'tf-flash-timer' },
          h('p', { className: 'tf-flash-label' }, label),
          c.state === 'over' ? null : h('div', { className: 'tf-flash-clock', 'aria-hidden': 'true' },
            [[hh, 'Giờ'], [mm, 'Phút'], [ss, 'Giây']].map(function (x) {
              return h('span', { key: x[1], className: 'tf-flash-box' }, h(RollNumber, { value: x[0] }), h('small', null, x[1]));
            })),
          h('span', { className: 'tf-sr', role: 'timer', 'aria-live': 'off' }, spoken))),
      h('div', { className: 'tf-flash-track', onMouseEnter: function () { setHold(true); }, onMouseLeave: function () { setHold(false); },
          onFocus: function () { setHold(true); }, onBlur: function (e) { if (!e.currentTarget.contains(e.relatedTarget)) setHold(false); } },
        h('button', { type: 'button', className: 'tf-flash-nav is-prev', 'aria-label': 'Sản phẩm trước', onClick: function () { step(-1); } }, h(B.Icon, { name: 'arrow', size: 18 })),
        h('button', { type: 'button', className: 'tf-flash-nav is-next', 'aria-label': 'Sản phẩm sau', onClick: function () { step(1); } }, h(B.Icon, { name: 'arrow', size: 18 })),
      h('ul', { className: 'tf-flash-list', ref: listRef }, p.items.map(function (x) {
        var off = x.orig > x.price ? Math.round((1 - x.price / x.orig) * 100) : 0;
        return h('li', { key: x.id, className: 'tf-flash-card' },
          // Bấm thường mở xem nhanh như thẻ SP khác; ctrl/cmd/shift/chuột giữa vẫn mở trang chi tiết
          h('a', { className: 'tf-flash-link', href: prodHref(x.id), 'aria-haspopup': 'dialog', onClick: function (e) {
              if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('tf-quick', { detail: { id: x.id, el: e.currentTarget } }));
            } },
            h(B.Plate, { image: x.img, alt: '', art: artOf(x) }),
            h('span', { className: 'tf-flash-name' }, x.name)),
          h('div', { className: 'tf-flash-foot' },
            h('div', { className: 'tf-flash-prices' },
              h('span', { className: 'tf-flash-now' }, h('span', { className: 'tf-sr' }, 'Giá bán '), vnd(x.price)),
              off ? h('span', { className: 'tf-flash-was' },
                h('s', null, h('span', { className: 'tf-sr' }, 'Giá gốc '), vnd(x.orig)),
                h('span', { className: 'tf-flash-off' }, h('span', { className: 'tf-sr' }, 'Giảm '), '−' + off + '%')) : null,
              off ? h('span', { className: 'tf-price-save' }, 'Tiết kiệm ' + vnd(x.orig - x.price)) : null),
            h('button', { type: 'button', className: 'tf-flash-add', 'aria-label': 'Thêm vào giỏ: ' + x.name, onClick: function () { addToCart(x.id); } },
              h(B.Icon, { name: 'bag', size: 18 }))),
          h('span', { className: 'tf-flash-stock' + (x.stock ? '' : ' is-out') }, x.stock ? 'Còn hàng' : 'Tạm hết hàng'));
      }))),
      h('button', { type: 'button', className: 'tf-flash-pause', 'aria-pressed': paused ? 'true' : 'false', onClick: function () { setPaused(!paused); } },
        paused ? 'Tự chạy' : 'Tạm dừng'),
      h('a', { className: 'tf-flash-more', href: 'danh-muc.html?sap=giam-gia' }, 'Xem tất cả sản phẩm đang giảm giá', h(B.Icon, { name: 'arrow', size: 14 })));
  }

  /* ---------------- trưng bày kiểu Apple: một mẫu lớn canh giữa, hai ô nhỏ bên dưới ----------------
     Chữ lấy từ dữ liệu SP (tên dòng, con số, xuất xứ, bảo hành); không thêm lời quảng cáo ngoài dữ liệu. */
  var SHOW = { main: 'DK-061', tiles: ['DK-069', 'DK-050'] };
  function showLine(p) {
    var bits = [];
    if (p.fig) bits.push(p.fig.l + ' ' + p.fig.v + (p.fig.u ? ' ' + p.fig.u : ''));
    if (p.power && (!p.fig || p.fig.u !== 'W')) bits.push(p.power + ' W');
    if (p.origin) bits.push('Sản xuất tại ' + p.origin);
    if (p.w) bits.push('Bảo hành ' + p.w + ' tháng');
    return bits.join(' · ');
  }
  function ShowItem(props) {
    var p = props.p, big = props.big;
    var Title = big ? 'h2' : 'h3';
    // Hiện dần khi cuộn tới (lần đầu vào màn hình), rồi một vệt sáng lướt qua ảnh; rê chuột vào thì lướt lại
    var ref = useRef(null);
    var st = useState(false), shown = st[0], setShown = st[1];
    var sw = useState(false), sweep = sw[0], setSweep = sw[1];
    useEffect(function () {
      var el = ref.current;
      if (!el || !('IntersectionObserver' in window)) { setShown(true); return; }
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { setShown(true); io.disconnect(); }
      }, { threshold: 0.2 });
      io.observe(el);
      return function () { io.disconnect(); };
    }, []);
    useEffect(function () {
      if (!shown) return;
      var t1 = setTimeout(function () { setSweep(true); }, 700 + (props.delay || 0));
      var t2 = setTimeout(function () { setSweep(false); }, 1900 + (props.delay || 0));
      return function () { clearTimeout(t1); clearTimeout(t2); };
    }, [shown]);
    return h('article', { ref: ref, className: 'tf-show tf-reveal ' + (big ? 'is-main' : 'is-tile') + (shown ? ' is-in' : '') + (sweep ? ' is-sweep' : ''),
        style: props.delay ? { transitionDelay: props.delay + 'ms' } : undefined },
      h('div', { className: 'tf-show-text' },
        h('p', { className: 'tf-show-kicker' }, (groupByKey[p.g] || {}).name),
        h(Title, { className: 'tf-show-title' }, p.name.replace(/\s+[A-Z0-9]{6,}$/, '')),
        h('p', { className: 'tf-show-lead' }, showLine(p)),
        h('p', { className: 'tf-show-price' },
          h('span', { className: p.orig > p.price ? 'is-sale' : null }, vnd(p.price)),
          p.orig > p.price ? h('s', null, vnd(p.orig)) : null),
        h('div', { className: 'tf-show-actions' },
          h('button', { type: 'button', className: 'tf-btn tf-btn-primary' + (big ? '' : ' tf-btn-sm'), onClick: function () { addToCart(p.id); },
            'aria-label': 'Thêm vào giỏ: ' + p.name }, 'Thêm vào giỏ'),
          h('a', { className: 'tf-show-link', href: prodHref(p.id), 'aria-label': 'Tìm hiểu thêm về ' + p.name }, 'Tìm hiểu thêm'))),
      h('a', { className: 'tf-show-media', href: prodHref(p.id), tabIndex: -1, 'aria-hidden': 'true' },
        h(B.Plate, { image: p.img, art: artOf(p), alt: '' })));
  }
  function Showcase() {
    var main = byId[SHOW.main];
    var tiles = SHOW.tiles.map(function (id) { return byId[id]; }).filter(Boolean);
    if (!main) return null;
    return h('section', { className: 'tf-showcase', 'aria-label': 'Sản phẩm nổi bật' },
      h(ShowItem, { p: main, big: true }),
      tiles.length ? h('div', { className: 'tf-show-grid' }, tiles.map(function (p, i) { return h(ShowItem, { key: p.id, p: p, delay: i * 120 }); })) : null);
  }

  function Home() {
    var hero = byId['DK-061'];
    var kitchen = D.products.filter(function (p) { return p.price > 0 && KITCHEN.indexOf(p.g) >= 0; });
    var byDeal = kitchen.filter(function (p) { return p.pct > 0 && p.img; }).sort(function (a, b) { return b.pct - a.pct || b.price - a.price; });
    // Ưu đãi: mỗi nhóm một mẫu trước, đủ 10 (2 dòng x 5) thì dừng; thiếu thì lấy tiếp theo mức giảm
    var deals = [], seen = {};
    byDeal.forEach(function (p) { if (deals.length < 10 && !seen[p.g]) { seen[p.g] = 1; deals.push(p); } });
    byDeal.forEach(function (p) { if (deals.length < 10 && deals.indexOf(p) < 0) deals.push(p); });
    // Giảm nhiều nhất: xếp thuần theo mức giảm, bỏ các mẫu đã có ở Ưu đãi nổi bật để không lặp
    var deepest = byDeal.filter(function (p) { return deals.indexOf(p) < 0; }).slice(0, 5);
    var user = useUser();
    var best = bestSellers(5);
    var viewed = user ? readViewed(user).map(function (id) { return byId[id]; }).filter(Boolean).slice(0, 5) : [];
    var maxPct = byDeal.length ? byDeal[0].pct : 0;
    var french = D.products.filter(function (p) { return p.g === 'noi-chao' && p.origin === 'Pháp'; }).length;
    var rice = groupByKey['noi-com-dien'];

    return h(Shell, null,
      // Ảnh bếp làm nền hero (như mẫu). URL tuyệt đối vì url() trong biến CSS được tính theo file CSS dùng nó
      h('section', { className: 'tf-hero tf-hero-photo', style: { '--hero-bg': 'url("' + new URL('assets/img/hero-bep.jpg', location.href).href + '")' } },
        h('div', null,
          h('p', { className: 'tf-hero-kicker' }, 'Nấu ngon, dọn nhanh, dùng bền'),
          h('h1', { className: 'tf-hero-title' }, 'Đồ bếp Tefal ', h('em', null, 'cho mỗi bữa cơm.')),
          h('p', { className: 'tf-hero-lead' }, 'Nồi chảo, nồi cơm điện, nồi chiên và máy xay chính hãng. Giá niêm yết rõ, thông số đầy đủ để so sánh trước khi mua.'),
          h('div', { className: 'tf-hero-actions' },
            h(B.Button, { variant: 'primary', href: 'danh-muc.html' }, 'Mua ngay'),
            h(B.Button, { href: '#danh-muc' }, 'Xem danh mục'))),),

      h('div', { className: 'tf-trust-wrap' }, h(B.TrustBar, { items: TRUST })),

      h('section', { className: 'tf-section', id: 'danh-muc' },
        h(B.SectionTitle, { title: 'Mua theo danh mục', moreHref: 'danh-muc.html' }),
        h('div', { className: 'tf-grid-6' }, TILES.map(function (t) {
          var g = groupByKey[t.key];
          return h(B.CategoryTile, { key: t.key, name: g.name, count: g.count, href: catHref(t.key), image: imgOf(t.img), art: g.art, icon: ICON_OF[t.key] });
        }))),

      h('div', { className: 'tf-section' }, h(FlashSale, { items: deals })),

      h('div', { className: 'tf-section' }, h(Showcase)),

      h('section', { className: 'tf-section' },
        h('div', { className: 'tf-grid-3 tf-promos' },
          h(B.PromoBanner, { kicker: 'Đang giảm giá', title: 'Giảm đến ' + maxPct + '% cho đồ bếp Tefal', cta: 'Xem ưu đãi', solid: true, href: 'danh-muc.html?sap=giam-gia', images: [byDeal[0] && byDeal[0].img, byDeal[1] && byDeal[1].img] }),
          h(B.PromoBanner, { kicker: rice.name, title: rice.count + ' mẫu cao tần và điện tử', cta: 'Xem nồi cơm', href: catHref('noi-com-dien'), images: [imgOf('DK-064'), imgOf('DK-090')] }),
          h(B.PromoBanner, { kicker: 'Sản xuất tại Pháp', title: french + ' mẫu nồi chảo từ nhà máy Pháp', cta: 'Xem nồi chảo', href: catHref('noi-chao') + '&phap=1', images: [imgOf('NC-059'), imgOf('NC-061')] }))),

      best.length ? h('section', { className: 'tf-section' },
        h(B.SectionTitle, { title: 'Được mua nhiều nhất', note: 'Tính từ các đơn đã đặt trên web này.' }),
        h('div', { className: 'tf-grid-5' }, best.map(function (p) { return h(B.ProductCard, cardProps(p)); }))) : null,

      deepest.length ? h('section', { className: 'tf-section' },
        h(B.SectionTitle, { title: 'Giảm nhiều nhất', note: 'Xếp theo mức giảm so với giá niêm yết, không lặp các mẫu ở trên.', moreHref: 'danh-muc.html?sap=giam-gia' }),
        h('div', { className: 'tf-grid-5' }, deepest.map(function (p) { return h(B.ProductCard, cardProps(p)); }))) : null,

      viewed.length ? h('section', { className: 'tf-section' },
        h(B.SectionTitle, { title: 'Bạn đã xem gần đây', note: 'Lưu theo tài khoản ' + user.email + ' trong trình duyệt này.' }),
        h('div', { className: 'tf-grid-5' }, viewed.map(function (p) { return h(B.ProductCard, cardProps(p)); }))) : null);
  }

  /* ---------------- đã xem gần đây (theo tài khoản) và mua nhiều nhất (theo đơn đã đặt) ----------------
     Bản chạy thử: lưu trong trình duyệt. Khi có Supabase riêng: bảng product_views và đếm từ order_items. */
  function viewedKey(u) { return 'tefal-web-viewed:' + u.email; }
  function readViewed(u) { var v = readJSON(viewedKey(u), []); return Array.isArray(v) ? v : []; }
  function noteViewed(id) {
    var u = readUser(); if (!u || !byId[id]) return;
    var list = readViewed(u).filter(function (x) { return x !== id; });
    list.unshift(id);
    writeJSON(viewedKey(u), list.slice(0, 20));
  }
  function bestSellers(n) {
    var qty = {};
    readOrders().forEach(function (o) { (o.items || []).forEach(function (x) { if (byId[x.id]) qty[x.id] = (qty[x.id] || 0) + (x.qty || 1); }); });
    return Object.keys(qty).sort(function (a, b) { return qty[b] - qty[a]; }).slice(0, n).map(function (id) { return byId[id]; });
  }

  /* ---------------- trang danh mục và tìm kiếm ---------------- */
  var SORTS = [
    { key: 'noi-bat', label: 'Nổi bật' },
    { key: 'con-so', label: 'Con số lớn trước' },
    { key: 'gia-tang', label: 'Giá thấp đến cao' },
    { key: 'gia-giam', label: 'Giá cao đến thấp' },
    { key: 'giam-gia', label: 'Giảm giá nhiều nhất' }
  ];
  var PRICE = [
    { key: 'duoi-1', label: 'Dưới 1 triệu', test: function (p) { return p.price > 0 && p.price < 1e6; } },
    { key: '1-3', label: '1 đến 3 triệu', test: function (p) { return p.price >= 1e6 && p.price <= 3e6; } },
    { key: 'tren-3', label: 'Trên 3 triệu', test: function (p) { return p.price > 3e6; } }
  ];
  function sorter(key) {
    return function (a, b) {
      var priced = (b.price > 0) - (a.price > 0);
      if (priced) return priced;
      if (key === 'gia-tang') return a.price - b.price;
      if (key === 'gia-giam') return b.price - a.price;
      if (key === 'giam-gia') return b.pct - a.pct || a.price - b.price;
      if (key === 'con-so') return figNum(b) - figNum(a) || a.price - b.price;
      return b.pct - a.pct || b.price - a.price;
    };
  }

  function Category() {
    var key = param('nhom');
    var q = (param('q') || '').trim();
    var g = key && groupByKey[key];
    var origin = ORIGINS.indexOf(param('xuat-xu')) >= 0 ? param('xuat-xu') : null;
    var base;
    if (g) base = D.products.filter(function (p) { return p.g === g.key; });
    else if (q) {
      var terms = norm(q).split(/\s+/).filter(Boolean);
      base = D.products.filter(function (p) {
        var hay = norm(p.name + ' ' + p.full + ' ' + p.model + ' ' + p.id + ' ' + (groupByKey[p.g] || {}).name);
        return terms.every(function (t) { return hay.indexOf(t) >= 0; });
      });
    } else base = D.products.slice(); // "Tất cả sản phẩm": gồm cả nhóm ngoài bếp
    if (origin) base = base.filter(function (p) { return p.origin === origin; });

    var title = (g ? g.name : (q ? 'Kết quả cho “' + q + '”' : origin ? 'Sản phẩm' : 'Tất cả sản phẩm')) + (origin ? ' sản xuất tại ' + origin : '');
    useEffect(function () { setMeta(title + ' — Tefal', g ? groupDesc(g) : q ? 'Kết quả tìm “' + q + '” trong đồ bếp Tefal: tên, mã model, giá và thông số.' : null); }, [title]);

    var s1 = useState(param('sap') || 'noi-bat'), sort = s1[0], setSort = s1[1];
    var s2 = useState(null), price = s2[0], setPrice = s2[1];
    var s3 = useState(param('phap') === '1'), france = s3[0], setFrance = s3[1];
    var s4 = useState(false), sale = s4[0], setSale = s4[1];
    var s5 = useState(24), limit = s5[0], setLimit = s5[1];

    var list = base.filter(function (p) {
      if (france && p.origin !== 'Pháp') return false;
      if (sale && !p.pct) return false;
      if (price) { var b = PRICE.filter(function (x) { return x.key === price; })[0]; if (!b.test(p)) return false; }
      return true;
    }).sort(sorter(sort));

    var hasFrance = base.some(function (p) { return p.origin === 'Pháp'; }) && base.some(function (p) { return p.origin !== 'Pháp'; });
    var hasSale = base.some(function (p) { return p.pct > 0; });
    var priced = base.filter(function (p) { return p.price > 0; }).length;

    function chip(label, pressed, onClick) {
      return h('button', { key: label, className: 'tf-chip', type: 'button', 'aria-pressed': pressed ? 'true' : 'false', onClick: onClick }, label);
    }

    var crumbs = h('nav', { className: 'tf-crumbs', 'aria-label': 'Đường dẫn' },
      h('a', { href: 'index.html' }, 'Trang chủ'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', null, title));

    var empty = h('div', { className: 'tf-empty' },
      h('p', null, q ? 'Không có sản phẩm khớp “' + q + '”. Thử mã model đầy đủ, hoặc chọn một danh mục:' : 'Không có sản phẩm khớp bộ lọc. Bỏ bớt một bộ lọc, hoặc chọn danh mục khác:'),
      h(B.CategoryIndex, { items: D.groups.filter(function (x) { return x.count > 0; }).map(function (x) { return { name: x.name, count: x.count, href: catHref(x.key) }; }) }));

    return h(Shell, { active: origin && !g ? 'Xuất xứ' : undefined, query: q },
      crumbs,
      h('header', { className: 'tf-cat-head' },
        h('h1', { className: 'tf-cat-title' }, title),
        h('span', { className: 'tf-cat-count' }, String(list.length), h('small', null, list.length === base.length ? 'mẫu' : 'trên ' + base.length + ' mẫu'))),
      g && g.key === 'ngoai-bep' ? h('p', { className: 'tf-cat-note' }, 'Máy hút bụi, bàn ủi, quạt và máy lọc không khí. Không thuộc đồ bếp nhưng vẫn là sản phẩm Tefal.') : null,
      priced < base.length ? h('p', { className: 'tf-cat-note' }, (base.length - priced) + ' mẫu chưa có giá bán, hiện cuối danh sách với nút gọi báo giá.') : null,
      h('div', { className: 'tf-toolbar' },
        h('div', { className: 'tf-chips', role: 'group', 'aria-label': 'Lọc sản phẩm' },
          chip('Tất cả', !price && !france && !sale, function () { setPrice(null); setFrance(false); setSale(false); setLimit(24); }),
          PRICE.map(function (b) { return chip(b.label, price === b.key, function () { setPrice(price === b.key ? null : b.key); setLimit(24); }); }),
          hasFrance ? chip('Sản xuất tại Pháp', france, function () { setFrance(!france); setLimit(24); }) : null,
          hasSale ? chip('Đang giảm giá', sale, function () { setSale(!sale); setLimit(24); }) : null),
        h('label', { className: 'tf-sort' }, 'Sắp xếp ',
          h('select', { value: sort, onChange: function (e) { setSort(e.target.value); } },
            SORTS.map(function (o) { return h('option', { key: o.key, value: o.key }, o.label); })))),
      h('h2', { className: 'tf-sr' }, 'Danh sách sản phẩm'),
      list.length ? h('div', { className: 'tf-grid-products' }, list.slice(0, limit).map(function (p) { return h(B.ProductCard, cardProps(p)); })) : empty,
      list.length > limit ? h('div', { className: 'tf-more' },
        h(B.Button, { onClick: function () { setLimit(limit + 24); }, 'aria-label': 'Xem thêm ' + Math.min(24, list.length - limit) + ' mẫu, đang hiện ' + limit + ' trên ' + list.length }, 'Xem thêm')) : null);
  }

  /* ---------------- trang chi tiết ---------------- */
  function Product() {
    var p = byId[param('id')];
    var actRef = React.useRef(null);
    var sb = useState(false), showBar = sb[0], setShowBar = sb[1];
    useEffect(function () { if (p) setMeta(p.name + ' — Tefal', productDesc(p)); }, [p]);
    useEffect(function () { if (p) noteViewed(p.id); }, [p]);
    // Thanh mua dưới đáy (điện thoại) chỉ hiện khi nút mua chính đã cuộn khỏi màn hình
    useEffect(function () {
      var el = actRef.current;
      if (!el) return;
      if (!('IntersectionObserver' in window)) { setShowBar(true); return; }
      var io = new IntersectionObserver(function (es) {
        setShowBar(!es[0].isIntersecting && es[0].boundingClientRect.top < 0);
      });
      io.observe(el);
      return function () { io.disconnect(); };
    }, [p]);
    if (!p) {
      return h(Shell, null, h('div', { className: 'tf-empty', style: { paddingTop: 'var(--space-16)' } },
        h('h1', { className: 'tf-section-title' }, 'Không tìm thấy sản phẩm'),
        h('p', null, 'Đường dẫn có thể đã cũ. Tìm theo mã model hoặc chọn một danh mục.'),
        h(B.Button, { href: 'danh-muc.html' }, 'Xem tất cả đồ bếp')));
    }
    var g = groupByKey[p.g];
    var images = [p.img, p.img2].filter(Boolean);
    var figs = [];
    if (p.fig) figs.push({ value: p.fig.v, unit: p.fig.u, label: p.fig.l });
    if (p.power && !(p.fig && p.fig.u === 'W')) figs.push({ value: p.power, unit: 'W', label: 'Công suất' });
    if (p.cap && !(p.fig && p.fig.u === 'L')) figs.push({ value: p.cap, unit: 'L', label: 'Dung tích' });
    if (p.w) figs.push({ value: String(p.w), unit: 'tháng', label: 'Bảo hành' });
    figs = figs.slice(0, 3);
    var related = D.products.filter(function (x) { return x.g === p.g && x.id !== p.id && x.price > 0; })
      .sort(function (a, b) { return Math.abs(a.price - p.price) - Math.abs(b.price - p.price); }).slice(0, 5);
    var addBtn = p.price > 0
      ? h(B.Button, { variant: 'primary', onClick: function () { addToCart(p.id); } }, 'Thêm vào giỏ')
      : h(B.Button, { variant: 'primary', href: '#showroom' }, 'Gọi để báo giá');

    var buybar = h('div', { className: 'tf-buybar' + (showBar ? ' is-on' : '') },
      p.price > 0 ? h(B.PriceTag, { price: p.price, original: p.orig }) : h('span', { className: 'tf-price-ask' }, 'Chưa có giá'),
      p.price > 0 ? h(B.Button, { variant: 'primary', block: true, onClick: function () { addToCart(p.id); } }, 'Thêm vào giỏ')
        : h(B.Button, { variant: 'primary', block: true, href: '#showroom' }, 'Gọi để báo giá'));

    return h(Shell, { after: buybar },
      h('nav', { className: 'tf-crumbs', 'aria-label': 'Đường dẫn' },
        h('a', { href: 'index.html' }, 'Trang chủ'), h('span', { 'aria-hidden': 'true' }, '/'),
        h('a', { href: catHref(g.key) }, g.name), h('span', { 'aria-hidden': 'true' }, '/'),
        h('span', null, p.model)),
      h('div', { className: 'tf-pdp' },
        h('div', { className: 'tf-gallery' + (images.length < 2 ? ' is-single' : ''), role: 'group', 'aria-label': 'Ảnh sản phẩm', tabIndex: images.length > 1 ? 0 : undefined },
          images.map(function (src, i) { return h(B.Plate, { key: i, image: src, alt: i === 0 ? p.full : p.name + ', ảnh thứ ' + (i + 1), art: artOf(p), eager: i === 0 }); })),
        h('aside', { className: 'tf-buy' },
          h('div', null,
            h('h1', { className: 'tf-buy-name' }, p.name),
            h('p', { className: 'tf-buy-meta' }, metaOf(p))),
          p.price > 0 ? h(B.PriceTag, { price: p.price, original: p.orig, size: 'lg' }) : h('p', { className: 'tf-price-ask' }, 'Sản phẩm chưa có giá bán. Gọi để được báo giá.'),
          h('div', { className: 'tf-card-badges' }, badgesOf(p).map(function (b, i) { return h(B.Badge, { key: i, tone: b.tone, dot: b.dot }, b.text); })),
          h('div', { className: 'tf-buy-actions', ref: actRef }, addBtn, h(B.Button, { href: '#showroom' }, 'Gọi tư vấn')),
          figs.length ? h('div', { className: 'tf-figure-row' }, figs.map(function (f, i) { return h(B.SpecFigure, { key: i, value: f.value, unit: f.unit, label: f.label }); })) : null,
          h('p', { className: 'tf-buy-note' }, h(B.Icon, { name: 'store', size: 18 }), 'Xem và nấu thử tại showroom trước khi mua.'))),
      h('section', { className: 'tf-section tf-section-tight' },
        h('div', { className: 'tf-split' },
          h('div', { className: 'tf-split-aside' }, h('h2', { className: 'tf-section-title' }, 'Thông số và mô tả')),
          h('div', { className: 'tf-detail' },
            p.specs.length ? h(B.SpecTable, { rows: p.specs }) : h('p', { className: 'tf-cat-note' }, 'Thông số chưa đầy đủ, gọi để được tư vấn.'),
            (p.desc || p.pts.length) ? h('div', { className: 'tf-prose' },
              p.desc ? h('p', null, p.desc) : null,
              p.pts.length ? h('ul', null, p.pts.map(function (t, i) { return h('li', { key: i }, t); })) : null) : null))),
      related.length ? h('section', { className: 'tf-section' },
        h(B.SectionTitle, { title: 'Cùng nhóm, giá gần nhất', note: g.name + ' có ' + g.count + ' mẫu đang bán.', moreHref: catHref(g.key) }),
        h('div', { className: 'tf-grid-products' }, related.map(function (x) { return h(B.ProductCard, cardProps(x)); }))) : null);
  }

  /* ---------------- giỏ hàng ---------------- */
  // Trang chỉ dành cho người đã đăng nhập: hiện lời mời đăng nhập thay vì nội dung
  function LoginGate(p) {
    return h(B.LoginGate, { title: p.title, signInHref: loginHref(p.next), signUpHref: loginHref(p.next).replace('?', '?che-do=dang-ky&'), browseHref: 'danh-muc.html', text: p.text });
  }

  function Cart() {
    var cart = useCart();
    var user = useUser();
    useEffect(function () { document.title = 'Giỏ hàng — Tefal'; }, []);
    var items = cart.map(function (c) { var p = byId[c.id]; return p ? { p: p, qty: c.qty } : null; }).filter(Boolean);
    var total = items.reduce(function (n, x) { return n + x.p.price * x.qty; }, 0);
    var count = items.reduce(function (n, x) { return n + x.qty; }, 0);
    var unpriced = items.filter(function (x) { return !x.p.price; }).length;

    var crumbs = h('nav', { className: 'tf-crumbs', 'aria-label': 'Đường dẫn' },
      h('a', { href: 'index.html' }, 'Trang chủ'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', null, 'Giỏ hàng'));
    var head = h('header', { className: 'tf-cat-head' },
      h('h1', { className: 'tf-cat-title', tabIndex: -1 }, 'Giỏ hàng'),
      h('span', { className: 'tf-cat-count' }, String(count), h('small', null, 'sản phẩm')));

    if (!items.length) {
      return h(Shell, null, crumbs, head,
        h('div', { className: 'tf-empty' },
          h('p', null, 'Giỏ hàng đang trống. Chọn một danh mục để bắt đầu:'),
          h(B.CategoryIndex, { items: D.groups.filter(function (x) { return KITCHEN.indexOf(x.key) >= 0 && x.count > 0; }).map(function (x) { return { name: x.name, count: x.count, href: catHref(x.key) }; }) })));
    }

    return h(Shell, null, crumbs, head,
      h('div', { className: 'tf-cart' },
        h('ul', { className: 'tf-cart-list' }, items.map(function (x) {
          var p = x.p;
          function removeRow(e) {
            var all = Array.prototype.slice.call(document.querySelectorAll('.tf-cart-remove'));
            var i = all.indexOf(e.currentTarget.closest('.tf-cart-row').querySelector('.tf-cart-remove'));
            removeItem(p.id);
            setTimeout(function () {
              var left = document.querySelectorAll('.tf-cart-remove');
              var to = left.length ? left[Math.min(i, left.length - 1)] : document.querySelector('main h1');
              if (to) to.focus();
            }, 0);
          }
          return h('li', { key: p.id, className: 'tf-cart-row' },
            h('a', { href: prodHref(p.id), className: 'tf-cart-thumb', tabIndex: -1, 'aria-hidden': 'true' }, h(B.Plate, { image: p.img, alt: '', art: artOf(p) })),
            h('div', { className: 'tf-cart-info' },
              h('a', { href: prodHref(p.id), className: 'tf-cart-name' }, p.name),
              h('span', { className: 'tf-card-meta' }, metaOf(p)),
              h('button', { type: 'button', className: 'tf-cart-remove', 'aria-label': 'Bỏ khỏi giỏ: ' + p.name, onClick: removeRow }, h(B.Icon, { name: 'close', size: 14 }), 'Bỏ khỏi giỏ')),
            h('div', { className: 'tf-qty', role: 'group', 'aria-label': 'Số lượng ' + p.name },
              // Số lượng 1 thì nút "−" thành nút bỏ món khỏi giỏ
              x.qty > 1
                ? h('button', { type: 'button', 'aria-label': 'Bớt một', onClick: function () { setQty(p.id, x.qty - 1); } }, '−')
                : h('button', { type: 'button', className: 'tf-qty-del', 'aria-label': 'Bỏ khỏi giỏ: ' + p.name, title: 'Bỏ khỏi giỏ', onClick: removeRow }, h(B.Icon, { name: 'close', size: 14 })),
              h('output', { 'aria-live': 'polite' }, x.qty),
              h('button', { type: 'button', 'aria-label': 'Thêm một', onClick: function () { setQty(p.id, x.qty + 1); } }, '+')),
            h('span', { className: 'tf-cart-line' }, p.price ? vnd(p.price * x.qty) : 'Gọi báo giá'));
        })),
        h('aside', { className: 'tf-cart-sum' },
          h('h2', { className: 'heading' }, 'Tạm tính'),
          h('dl', null,
            h('dt', null, 'Sản phẩm'), h('dd', null, count),
            h('dt', null, 'Giao hàng'), h('dd', null, 'Tính khi đặt hàng'),
            h('dt', { className: 'tf-cart-total' }, 'Tổng'), h('dd', { className: 'tf-cart-total' }, vnd(total))),
          unpriced ? h('p', { className: 'tf-cat-note' }, unpriced + ' sản phẩm chưa có giá, chưa tính vào tổng.') : null,
          user ? h(B.Button, { variant: 'primary', block: true, href: 'thanh-toan.html' }, 'Đặt hàng')
            : h(B.Button, { variant: 'primary', block: true, href: loginHref('thanh-toan.html') }, 'Đăng nhập để đặt hàng'),
          user ? null : h('p', { className: 'tf-cat-note' }, 'Giỏ hàng đang lưu tạm trong phiên này. Đăng nhập hoặc đăng ký thì giỏ, danh sách yêu thích và so sánh được giữ lại trong tài khoản.'),
          h('p', { className: 'tf-cat-note' }, 'Bản chạy thử: giỏ hàng lưu trong trình duyệt của bạn, chưa gửi đi đâu.'))));
  }

  /* ---------------- tài khoản: đăng nhập, đăng ký, thông tin ---------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function cleanPhone(v) { return (v || '').replace(/[\s.\-]/g, ''); }

  // Ô nhập, ô chọn, ô lựa chọn dạng thẻ, nút Google, khối mời đăng nhập: thành phần chung trong bundle (tf.js)
  var Field = B.Field, PasswordField = B.PasswordField, SelectField = B.SelectField, ChoiceGroup = B.ChoiceGroup;

  // Tóm tắt lỗi đầu form (từ 2 lỗi trở lên): người dùng trình đọc màn hình biết hết các chỗ cần sửa,
  // bấm từng dòng để tới ô đó. Một lỗi thì đưa focus thẳng vào ô lỗi.
  function ErrorSummary(p) {
    var keys = p.order.filter(function (k) { return p.errors[k]; });
    if (keys.length < 2) return null;
    return h('div', { className: 'tf-errsum', tabIndex: -1, role: 'group', 'aria-labelledby': p.id + '-tieu-de', id: p.id },
      h('p', { id: p.id + '-tieu-de', className: 'tf-errsum-title' }, 'Còn ' + keys.length + ' chỗ cần sửa'),
      h('ul', null, keys.map(function (k) {
        return h('li', { key: k }, h('a', { href: '#' + p.ids[k], onClick: function (e) {
          e.preventDefault(); var el = document.getElementById(p.ids[k]); if (el) el.focus();
        } }, p.errors[k]));
      })));
  }

  function focusErrors(form, count) {
    setTimeout(function () {
      var el = form && (count >= 2 ? form.querySelector('.tf-errsum') : form.querySelector('[aria-invalid="true"]'));
      if (el) el.focus();
    }, 0);
  }

  function SignIn(p) {
    var f = useState({ email: '', pw: '' }), v = f[0], setV = f[1];
    var e = useState({}), err = e[0], setErr = e[1];
    var formRef = useRef(null);
    function set(k) {
      return function (x) {
        setV(function (o) { var n = Object.assign({}, o); n[k] = x; return n; });
        setErr(function (o) { if (!o[k]) return o; var n = Object.assign({}, o); delete n[k]; return n; });
      };
    }
    function submit(ev) {
      ev.preventDefault();
      var x = {};
      if (!EMAIL_RE.test(v.email.trim())) x.email = 'Nhập email đúng dạng, ví dụ ten@gmail.com.';
      if (!v.pw) x.pw = 'Nhập mật khẩu.';
      if (!x.email) {
        var acc = findAccount(v.email);
        if (!acc) x.email = 'Chưa có tài khoản với email này. Kiểm tra lại, hoặc chuyển sang Đăng ký.';
        else if (!x.pw) { setUser(acc); p.onDone('Đã đăng nhập. Chào ' + firstName(acc.name) + '.'); return; }
      }
      setErr(x); focusErrors(formRef.current, Object.keys(x).length);
    }
    return h('form', { ref: formRef, className: 'tf-auth-form', noValidate: true, onSubmit: submit },
      h(ErrorSummary, { id: 'dn-loi', errors: err, ids: { email: 'dn-email', pw: 'dn-matkhau' }, order: ['email', 'pw'] }),
      h(Field, { id: 'dn-email', label: 'Email', type: 'email', autoComplete: 'email', inputMode: 'email', value: v.email, onChange: set('email'), error: err.email }),
      h(PasswordField, { id: 'dn-matkhau', label: 'Mật khẩu', autoComplete: 'current-password', value: v.pw, onChange: set('pw'), error: err.pw }),
      h('div', { className: 'tf-auth-row' },
        h('button', { type: 'button', className: 'tf-auth-text', onClick: function () { toast('Lấy lại mật khẩu sẽ có khi nối tài khoản thật.'); } }, 'Quên mật khẩu?')),
      h(B.Button, { variant: 'primary', block: true, type: 'submit' }, 'Đăng nhập'),
      h('p', { className: 'tf-auth-switch' }, 'Chưa có tài khoản? ', h('button', { type: 'button', className: 'tf-auth-text', onClick: p.onSwitch }, 'Đăng ký')));
  }

  function SignUp(p) {
    var f = useState({ name: '', email: '', phone: '', pw: '', pw2: '' }), v = f[0], setV = f[1];
    var e = useState({}), err = e[0], setErr = e[1];
    var formRef = useRef(null);
    function set(k) {
      return function (x) {
        setV(function (o) { var n = Object.assign({}, o); n[k] = x; return n; });
        setErr(function (o) { if (!o[k]) return o; var n = Object.assign({}, o); delete n[k]; return n; });
      };
    }
    function submit(ev) {
      ev.preventDefault();
      var x = {};
      var phone = cleanPhone(v.phone);
      if (v.name.trim().length < 2) x.name = 'Nhập họ tên để chúng tôi xưng hô và giao hàng.';
      if (!EMAIL_RE.test(v.email.trim())) x.email = 'Nhập email đúng dạng, ví dụ ten@gmail.com.';
      else if (findAccount(v.email)) x.email = 'Email này đã có tài khoản. Chuyển sang Đăng nhập.';
      if (phone && !/^(0|\+84)\d{9}$/.test(phone)) x.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0.';
      if (v.pw.length < 8) x.pw = 'Mật khẩu cần ít nhất 8 ký tự.';
      if (!x.pw && v.pw2 !== v.pw) x.pw2 = 'Hai mật khẩu chưa khớp.';
      if (Object.keys(x).length) { setErr(x); focusErrors(formRef.current, Object.keys(x).length); return; }
      // Bản chạy thử: không lưu mật khẩu ở bất cứ đâu
      register({ name: v.name.trim(), email: v.email.trim().toLowerCase(), phone: phone, since: new Date().toISOString().slice(0, 10) });
      p.onDone('Đã tạo tài khoản. Chào ' + firstName(v.name) + '.');
    }
    return h('form', { ref: formRef, className: 'tf-auth-form', noValidate: true, onSubmit: submit },
      h(ErrorSummary, { id: 'dk-loi', errors: err, ids: { name: 'dk-ten', email: 'dk-email', phone: 'dk-sdt', pw: 'dk-matkhau', pw2: 'dk-matkhau2' }, order: ['name', 'email', 'phone', 'pw', 'pw2'] }),
      h(Field, { id: 'dk-ten', label: 'Họ và tên', autoComplete: 'name', value: v.name, onChange: set('name'), error: err.name }),
      h(Field, { id: 'dk-email', label: 'Email', type: 'email', autoComplete: 'email', inputMode: 'email', value: v.email, onChange: set('email'), error: err.email }),
      h(Field, { id: 'dk-sdt', label: 'Số điện thoại', type: 'tel', autoComplete: 'tel', inputMode: 'tel', optional: true, value: v.phone, onChange: set('phone'), error: err.phone, hint: 'Để gọi xác nhận đơn và hẹn giờ giao.' }),
      h(PasswordField, { id: 'dk-matkhau', label: 'Mật khẩu', autoComplete: 'new-password', value: v.pw, onChange: set('pw'), error: err.pw, hint: 'Ít nhất 8 ký tự.' }),
      h(PasswordField, { id: 'dk-matkhau2', label: 'Nhập lại mật khẩu', autoComplete: 'new-password', value: v.pw2, onChange: set('pw2'), error: err.pw2 }),
      h(B.Button, { variant: 'primary', block: true, type: 'submit' }, 'Tạo tài khoản'),
      h('p', { className: 'tf-auth-switch' }, 'Đã có tài khoản? ', h('button', { type: 'button', className: 'tf-auth-text', onClick: p.onSwitch }, 'Đăng nhập')));
  }

  function Account() {
    var user = useUser();
    var cart = useCart();
    var md = useState(param('che-do') === 'dang-ky' ? 'up' : 'in'), mode = md[0], setMode = md[1];
    var next = param('tiep');
    if (next && !/^[a-z-]+\.html(\?[\w=&%.+()!'*~-]*)?$/.test(next)) next = null; // chỉ cho quay về trang trong web
    var why = param('ly-do') === 'mua-hang';
    useEffect(function () { document.title = (user ? 'Tài khoản' : mode === 'up' ? 'Đăng ký' : 'Đăng nhập') + ' — Tefal'; }, [user, mode]);
    function switchTo(m) {
      setMode(m);
      var q = [];
      if (m === 'up') q.push('che-do=dang-ky');
      if (why) q.push('ly-do=mua-hang');
      if (next) q.push('tiep=' + encodeURIComponent(next));
      try { history.replaceState(null, '', 'tai-khoan.html' + (q.length ? '?' + q.join('&') : '')); } catch (e) { /* mở từ ổ đĩa */ }
      setTimeout(function () { var i = document.querySelector('.tf-auth-form input'); if (i) i.focus(); }, 0);
    }
    function done(msg) {
      toast(msg);
      window.scrollTo(0, 0);
      setMode('in');
      try { history.replaceState(null, '', 'tai-khoan.html'); } catch (e) { /* mở từ ổ đĩa */ }
      if (next) setTimeout(function () { location.href = next; }, 600);
    }
    var crumbs = h('nav', { className: 'tf-crumbs', 'aria-label': 'Đường dẫn' },
      h('a', { href: 'index.html' }, 'Trang chủ'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', null, 'Tài khoản'));

    if (user) {
      var count = cart.reduce(function (n, x) { return n + x.qty; }, 0);
      var myOrders = readOrders().filter(function (o) { return o.email === user.email; });
      return h(Shell, null, crumbs,
        h('header', { className: 'tf-cat-head' },
          h('h1', { className: 'tf-cat-title' }, 'Chào ' + firstName(user.name)),
          h(B.Button, { onClick: function () { setUser(null); toast('Đã đăng xuất.'); } }, h(B.Icon, { name: 'logout', size: 16 }), 'Đăng xuất')),
        h('div', { className: 'tf-acc-grid' },
          h('section', { className: 'tf-acc-card' },
            h('h2', null, 'Thông tin'),
            h('dl', null,
              h('dt', null, 'Họ và tên'), h('dd', null, user.name),
              h('dt', null, 'Email'), h('dd', null, user.email),
              h('dt', null, 'Số điện thoại'), h('dd', null, user.phone || 'Chưa có'),
              h('dt', null, 'Tham gia'), h('dd', null, user.since ? user.since.split('-').reverse().join('/') : '—'))),
          h('section', { className: 'tf-acc-card' },
            h('h2', null, 'Đơn hàng'),
            myOrders.length ? h('ul', { className: 'tf-acc-orders' }, myOrders.slice(0, 5).map(function (o) {
              return h('li', { key: o.id },
                h('strong', null, o.id), h('span', null, viDate(o.at) + ' · ' + o.items.reduce(function (n, x) { return n + x.qty; }, 0) + ' sản phẩm'),
                h('span', null, vnd(o.total) + ' · ' + o.status));
            })) : h('p', null, 'Bạn chưa có đơn hàng nào.')),
          h('section', { className: 'tf-acc-card' },
            h('h2', null, 'Địa chỉ giao hàng'),
            user.address ? h('p', null, addressLine(user.address)) : h('p', null, 'Chưa có. Địa chỉ sẽ được lưu khi bạn đặt hàng.')),
          h('section', { className: 'tf-acc-card' },
            h('h2', null, 'Yêu thích'),
            readWish().length ? h('ul', { className: 'tf-acc-orders' }, readWish().map(function (id) {
              var x = byId[id];
              return h('li', { key: id }, h('a', { className: 'tf-link', href: prodHref(id) }, x.name), h('span', null, x.price > 0 ? vnd(x.price) : 'Gọi để báo giá'));
            })) : h('p', null, 'Chưa có. Rê chuột vào thẻ sản phẩm rồi bấm hình trái tim.')),
          h('section', { className: 'tf-acc-card' },
            h('h2', null, 'Giỏ hàng'),
            h('p', null, count ? count + ' sản phẩm đang chờ đặt.' : 'Giỏ hàng đang trống.'),
            h(B.Button, { href: count ? 'gio-hang.html' : 'danh-muc.html' }, count ? 'Xem giỏ hàng' : 'Xem đồ bếp'))),
        h('p', { className: 'tf-cat-note' }, 'Bản chạy thử: tài khoản chỉ lưu trong trình duyệt này.'));
    }

    return h(Shell, null, crumbs,
      h('div', { className: 'tf-auth' },
        h('div', { className: 'tf-auth-card' },
          h('h1', { className: 'tf-auth-title' }, mode === 'up' ? 'Tạo tài khoản' : 'Đăng nhập'),
          h('p', { className: 'tf-auth-lead' }, mode === 'up' ? 'Lưu thông tin nhận hàng và theo dõi đơn của bạn.' : 'Chào mừng bạn quay lại.'),
          STORAGE_OK ? null : h('p', { className: 'tf-field-error', role: 'alert' }, 'Trình duyệt đang chặn lưu dữ liệu trang web nên bản chạy thử không giữ được đăng nhập và giỏ hàng. Hãy cho phép lưu dữ liệu hoặc mở bằng cửa sổ thường.'),
          why ? h('p', { className: 'tf-auth-why', role: 'status' }, 'Đăng nhập để đặt hàng. Giỏ hàng, yêu thích và so sánh bạn đã chọn sẽ được giữ lại.') : null,
          h('div', { className: 'tf-auth-tabs', role: 'group', 'aria-label': 'Chọn đăng nhập hoặc đăng ký' },
            h('button', { type: 'button', 'aria-pressed': mode === 'in' ? 'true' : 'false', onClick: function () { switchTo('in'); } }, 'Đăng nhập'),
            h('button', { type: 'button', 'aria-pressed': mode === 'up' ? 'true' : 'false', onClick: function () { switchTo('up'); } }, 'Đăng ký')),
          h(B.GoogleButton, { onClick: function () { toast('Đăng nhập Google sẽ chạy khi nối tài khoản thật (Supabase Auth).'); } },
            mode === 'up' ? 'Đăng ký với Google' : 'Tiếp tục với Google'),
          h('p', { className: 'tf-auth-or' }, h('span', null, 'hoặc dùng email')),
          mode === 'up' ? h(SignUp, { key: 'up', onDone: done, onSwitch: function () { switchTo('in'); } })
            : h(SignIn, { key: 'in', onDone: done, onSwitch: function () { switchTo('up'); } }),
          h('p', { className: 'tf-auth-demo' }, 'Bản chạy thử: tài khoản chỉ lưu trong trình duyệt này, không lưu mật khẩu và chưa kiểm tra mật khẩu khi đăng nhập. Nút Google chưa nối.')),
        h('aside', { className: 'tf-auth-aside' },
          h('h2', null, 'Có tài khoản để'),
          h(B.TrustBar, { items: [
            { icon: 'bag', title: 'Đặt hàng nhanh', text: 'Không phải nhập lại địa chỉ' },
            { icon: 'award', title: 'Theo dõi bảo hành', text: 'Xem lại đơn và ngày mua' },
            { icon: 'tag', title: 'Nhận tin ưu đãi', text: 'Khi có đợt giảm giá mới' }
          ] }))));
  }

  /* ---------------- thanh toán: địa chỉ giao hàng, cách nhận, cách trả tiền ----------------
     Bản chạy thử: đơn lưu trong trình duyệt (tefal-web-orders), chưa gửi đi đâu.
     Khi có Supabase riêng: ghi đơn vào bảng orders + order_items; cổng thanh toán online cần đăng ký riêng. */
  // 34 tỉnh, thành từ 1/7/2025 (chính quyền hai cấp: tỉnh và phường/xã, không còn quận/huyện)
  var PROVINCES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Huế', 'Cần Thơ',
    'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai',
    'Hà Tĩnh', 'Hưng Yên', 'Khánh Hòa', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Nghệ An', 'Ninh Bình',
    'Phú Thọ', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sơn La', 'Tây Ninh', 'Thái Nguyên', 'Thanh Hóa',
    'Tuyên Quang', 'Vĩnh Long'];
  var DELIVERY = [
    { key: 'giao', title: 'Giao tận nơi', text: 'Phí giao báo khi gọi xác nhận đơn.' },
    { key: 'showroom', title: 'Nhận tại showroom', text: 'Xem hàng, nấu thử rồi nhận. Không mất phí giao.' }
  ];
  var PAYMENT = [
    { key: 'cod', icon: 'bag', title: 'Trả tiền mặt khi nhận hàng (COD)', text: 'Kiểm tra hàng rồi mới trả tiền.' },
    { key: 'chuyen-khoan', icon: 'tag', title: 'Chuyển khoản ngân hàng', text: 'Số tài khoản gửi kèm khi gọi xác nhận đơn.' },
    { key: 'online', icon: 'shield', title: 'Thẻ ATM, Visa, ví điện tử', text: 'Chưa mở: cần đăng ký cổng thanh toán.', disabled: true }
  ];
  var ORDER_KEY = 'tefal-web-orders';
  function readOrders() { var o = readJSON(ORDER_KEY, []); return Array.isArray(o) ? o : []; }
  function saveOrder(o) { var list = readOrders(); list.unshift(o); return writeJSON(ORDER_KEY, list); }
  function patchUser(patch) {
    var u = readUser(); if (!u) return;
    var n = Object.assign({}, u, patch);
    var list = readAccounts().map(function (a) { return a.email === n.email ? n : a; });
    memoryAcc = list; writeJSON(ACC_KEY, list); setUser(n);
  }
  function addressLine(a) { return [a.street, a.ward, a.province].filter(Boolean).join(', '); }
  function deliveryOf(k) { return DELIVERY.filter(function (d) { return d.key === k; })[0] || DELIVERY[0]; }
  function paymentOf(k) { return PAYMENT.filter(function (d) { return d.key === k; })[0] || PAYMENT[0]; }
  function viDate(iso) { return iso ? iso.slice(0, 10).split('-').reverse().join('/') : ''; }

  function OrderLines(p) {
    return h('ul', { className: 'tf-order-lines', tabIndex: 0, 'aria-label': 'Sản phẩm trong đơn' }, p.items.map(function (x) {
      return h('li', { key: x.id },
        h('span', { className: 'tf-order-thumb' }, h(B.Plate, { image: (byId[x.id] || {}).img, alt: '', art: artOf(byId[x.id] || {}) }),
          h('span', { className: 'tf-order-qty' }, h('span', { className: 'tf-sr' }, 'Số lượng '), x.qty)),
        h('span', { className: 'tf-order-name' }, x.name, h('small', null, 'Model ' + x.model)),
        h('span', { className: 'tf-order-price' }, x.price ? vnd(x.price * x.qty) : 'Báo giá'));
    }));
  }

  function OrderTotals(p) {
    return h('dl', { className: 'tf-order-totals' },
      h('dt', null, 'Tạm tính'), h('dd', null, vnd(p.subtotal)),
      h('dt', null, 'Giao hàng'), h('dd', null, p.delivery === 'showroom' ? 'Miễn phí' : 'Báo khi xác nhận'),
      h('dt', { className: 'tf-cart-total' }, 'Tổng'), h('dd', { className: 'tf-cart-total' }, vnd(p.subtotal)));
  }

  function Checkout() {
    var cart = useCart();
    var user = useUser();
    var a = (user && user.address) || {};
    var f = useState({
      name: (user && user.name) || '', phone: (user && user.phone) || '', email: (user && user.email) || '',
      province: a.province || '', ward: a.ward || '', street: a.street || '', note: ''
    }), v = f[0], setV = f[1];
    var dl = useState('giao'), delivery = dl[0], setDelivery = dl[1];
    var pm = useState('cod'), payment = pm[0], setPayment = pm[1];
    var sv = useState(true), save = sv[0], setSave = sv[1];
    var e = useState({}), err = e[0], setErr = e[1];
    var od = useState(null), placed = od[0], setPlaced = od[1];
    var formRef = useRef(null);
    useEffect(function () { document.title = (placed ? 'Đã đặt hàng' : 'Thanh toán') + ' — Tefal'; }, [placed]);
    function set(k) {
      return function (x) {
        setV(function (o) { var n = Object.assign({}, o); n[k] = x; return n; });
        setErr(function (o) { if (!o[k]) return o; var n = Object.assign({}, o); delete n[k]; return n; });
      };
    }

    var items = cart.map(function (c) { var p = byId[c.id]; return p ? { id: p.id, name: p.name, model: p.model, price: p.price, qty: c.qty } : null; }).filter(Boolean);
    var subtotal = items.reduce(function (n, x) { return n + x.price * x.qty; }, 0);
    var unpriced = items.filter(function (x) { return !x.price; }).length;
    var crumbs = h('nav', { className: 'tf-crumbs', 'aria-label': 'Đường dẫn' },
      h('a', { href: 'index.html' }, 'Trang chủ'), h('span', { 'aria-hidden': 'true' }, '/'),
      h('a', { href: 'gio-hang.html' }, 'Giỏ hàng'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', null, 'Thanh toán'));

    if (placed) {
      var pay = paymentOf(placed.payment);
      return h(Shell, null, crumbs,
        h('div', { className: 'tf-placed' },
          h('span', { className: 'tf-placed-icon' }, h(B.Icon, { name: 'shield', size: 28 })),
          h('h1', { className: 'tf-auth-title', tabIndex: -1, ref: function (el) { if (el && document.activeElement !== el) el.focus(); } }, 'Đã nhận đơn ' + placed.id),
          h('p', null, 'Cảm ơn ' + firstName(placed.name) + '. Showroom sẽ gọi số ' + placed.phone + ' để xác nhận đơn' + (placed.delivery === 'giao' ? ', báo phí giao và hẹn giờ giao.' : ' và hẹn giờ bạn qua nhận.')),
          h('div', { className: 'tf-placed-grid' },
            h('section', { className: 'tf-acc-card' },
              h('h2', null, placed.delivery === 'giao' ? 'Giao tới' : 'Nhận hàng'),
              h('p', null, placed.name + ' · ' + placed.phone),
              h('p', null, placed.delivery === 'giao' ? addressLine(placed.address) : 'Nhận tại showroom'),
              placed.note ? h('p', { className: 'tf-cat-note' }, 'Ghi chú: ' + placed.note) : null),
            h('section', { className: 'tf-acc-card' },
              h('h2', null, 'Thanh toán'),
              h('p', null, pay.title),
              h('p', { className: 'tf-cat-note' }, pay.key === 'cod' ? 'Chuẩn bị ' + vnd(placed.total) + (placed.delivery === 'giao' ? ' cộng phí giao' : '') + ' khi nhận hàng.' : pay.text))),
          h('section', { className: 'tf-acc-card tf-placed-items' },
            h('h2', null, 'Sản phẩm'),
            h(OrderLines, { items: placed.items }),
            h(OrderTotals, { subtotal: placed.total, delivery: placed.delivery })),
          h('div', { className: 'tf-hero-actions' },
            h(B.Button, { variant: 'primary', href: 'danh-muc.html' }, 'Tiếp tục mua sắm'),
            h(B.Button, { href: 'tai-khoan.html' }, 'Xem đơn trong tài khoản')),
          h('p', { className: 'tf-auth-demo' }, 'Bản chạy thử: đơn chỉ lưu trong trình duyệt này, chưa gửi tới showroom.')));
    }

    if (!user) return h(Shell, null, h(LoginGate, { title: 'Đăng nhập để đặt hàng', next: 'thanh-toan.html', text: 'Cần đăng nhập để giao hàng đúng người. Giỏ hàng bạn đã chọn vẫn được giữ lại sau khi đăng nhập.' }));

    if (!items.length) {
      return h(Shell, null, crumbs,
        h('div', { className: 'tf-empty' },
          h('h1', { className: 'tf-section-title' }, 'Giỏ hàng đang trống'),
          h('p', null, 'Thêm sản phẩm vào giỏ trước khi thanh toán.'),
          h(B.Button, { variant: 'primary', href: 'danh-muc.html' }, 'Xem đồ bếp')));
    }

    function submit(ev) {
      ev.preventDefault();
      var x = {};
      var phone = cleanPhone(v.phone);
      if (v.name.trim().length < 2) x.name = 'Nhập họ tên người nhận.';
      if (!/^(0|\+84)\d{9}$/.test(phone)) x.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0.';
      if (delivery === 'giao') {
        if (!v.province) x.province = 'Chọn tỉnh hoặc thành phố.';
        if (v.ward.trim().length < 2) x.ward = 'Nhập phường hoặc xã.';
        if (v.street.trim().length < 3) x.street = 'Nhập số nhà, tên đường hoặc thôn, ấp.';
      }
      if (Object.keys(x).length) { setErr(x); focusErrors(formRef.current, Object.keys(x).length); return; }
      var address = { province: v.province, ward: v.ward.trim(), street: v.street.trim() };
      var order = {
        id: 'TF' + Date.now().toString(36).toUpperCase(), at: new Date().toISOString(), email: user.email,
        name: v.name.trim(), phone: phone, delivery: delivery, address: delivery === 'giao' ? address : null,
        payment: payment, note: v.note.trim(), items: items, total: subtotal, status: 'Chờ xác nhận'
      };
      if (!saveOrder(order)) { toast('Chưa lưu được đơn: trình duyệt đang chặn lưu trữ. Giỏ hàng vẫn giữ nguyên.'); return; }
      if (save) patchUser(Object.assign({ phone: user.phone || phone }, delivery === 'giao' ? { address: address } : {}));
      writeCart([]);
      setPlaced(order);
      window.scrollTo(0, 0);
    }

    return h(Shell, null, crumbs,
      h('header', { className: 'tf-cat-head' },
        h('h1', { className: 'tf-cat-title' }, 'Thanh toán'),
        h('p', { className: 'tf-checkout-login' }, 'Đặt hàng với tài khoản ' + user.email)),
      h('form', { id: 'tf-checkout', ref: formRef, className: 'tf-checkout', noValidate: true, onSubmit: submit },
        h('div', { className: 'tf-checkout-main' },
          h(ErrorSummary, { id: 'tt-loi', errors: err, ids: { name: 'tt-ten', phone: 'tt-sdt', province: 'tt-tinh', ward: 'tt-xa', street: 'tt-duong' }, order: ['name', 'phone', 'province', 'ward', 'street'] }),
          h('section', { className: 'tf-acc-card tf-checkout-step' },
            h('h2', null, h('span', { className: 'tf-step-no' }, '1'), 'Người nhận'),
            h('div', { className: 'tf-form-grid' },
              h(Field, { id: 'tt-ten', label: 'Họ và tên', autoComplete: 'name', value: v.name, onChange: set('name'), error: err.name }),
              h(Field, { id: 'tt-sdt', label: 'Số điện thoại', type: 'tel', autoComplete: 'tel', inputMode: 'tel', value: v.phone, onChange: set('phone'), error: err.phone, hint: 'Để gọi xác nhận đơn.' }),
              null)),
          h('section', { className: 'tf-acc-card tf-checkout-step' },
            h('h2', null, h('span', { className: 'tf-step-no' }, '2'), 'Cách nhận hàng'),
            h(ChoiceGroup, { legend: 'Chọn cách nhận hàng', name: 'giao-hang', items: DELIVERY, value: delivery, onChange: setDelivery }),
            delivery === 'giao' ? h('div', { className: 'tf-form-grid' },
              h(SelectField, { id: 'tt-tinh', label: 'Tỉnh, thành phố', autoComplete: 'address-level1', placeholder: 'Chọn tỉnh, thành phố', options: PROVINCES, value: v.province, onChange: set('province'), error: err.province }),
              h(Field, { id: 'tt-xa', label: 'Phường, xã', autoComplete: 'address-level2', value: v.ward, onChange: set('ward'), error: err.ward }),
              h('div', { className: 'tf-form-wide' },
                h(Field, { id: 'tt-duong', label: 'Số nhà, tên đường', autoComplete: 'street-address', value: v.street, onChange: set('street'), error: err.street, hint: 'Ví dụ: 25 Lê Lợi. Ở nông thôn ghi thôn, ấp.' })),
              h('label', { className: 'tf-check tf-form-wide' },
                h('input', { type: 'checkbox', checked: save, onChange: function (e2) { setSave(e2.target.checked); } }),
                'Lưu địa chỉ này cho lần sau')) : null,
            h('div', { className: 'tf-field' },
              h('label', { htmlFor: 'tt-ghichu' }, 'Ghi chú', h('span', { className: 'tf-field-opt' }, ' (không bắt buộc)')),
              h('textarea', { id: 'tt-ghichu', rows: 2, value: v.note, placeholder: 'Giờ nhận hàng, chỉ đường, xuất hóa đơn…', onChange: function (e2) { set('note')(e2.target.value); } }))),
          h('section', { className: 'tf-acc-card tf-checkout-step' },
            h('h2', null, h('span', { className: 'tf-step-no' }, '3'), 'Thanh toán'),
            h(ChoiceGroup, { legend: 'Chọn cách thanh toán', name: 'thanh-toan', items: PAYMENT, value: payment, onChange: setPayment }))),
        h('aside', { className: 'tf-cart-sum tf-checkout-sum' },
          h('h2', { className: 'heading' }, 'Đơn hàng'),
          h(OrderLines, { items: items }),
          h(OrderTotals, { subtotal: subtotal, delivery: delivery }),
          unpriced ? h('p', { className: 'tf-cat-note' }, unpriced + ' sản phẩm chưa có giá, showroom báo giá khi gọi xác nhận.') : null,
          h(B.Button, { variant: 'primary', block: true, type: 'submit' }, 'Đặt hàng'),
          h('p', { className: 'tf-cat-note' }, 'Bản chạy thử: đơn chỉ lưu trong trình duyệt, chưa gửi đi.'))));
  }

  /* ---------------- so sánh: tối đa 4 mẫu, xếp cột, hàng là thông số ---------------- */
  function Compare() {
    useEffect(function () { setMeta('So sánh sản phẩm — Tefal', 'So sánh giá và thông số các mẫu đồ bếp Tefal cạnh nhau.'); }, []);
    var ids = readCmp();
    var ps = ids.map(function (id) { return byId[id]; });
    var crumbs = h('nav', { className: 'tf-crumbs', 'aria-label': 'Đường dẫn' },
      h('a', { href: 'index.html' }, 'Trang chủ'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', null, 'So sánh'));
    var head = h('header', { className: 'tf-cat-head' },
      h('h1', { className: 'tf-cat-title', tabIndex: -1 }, 'So sánh sản phẩm'),
      h('span', { className: 'tf-cat-count' }, String(ps.length), h('small', null, 'trên ' + CMP_MAX + ' mẫu')));
    if (!ps.length) {
      return h(Shell, null, crumbs, head,
        h('div', { className: 'tf-empty' },
          h('p', null, 'Chưa có mẫu nào để so sánh. Rê chuột vào thẻ sản phẩm rồi bấm nút So sánh, tối đa ' + CMP_MAX + ' mẫu.'),
          h(B.Button, { variant: 'primary', href: 'danh-muc.html' }, 'Xem đồ bếp')));
    }
    // Hàng thông số: hợp các tên thông số, theo thứ tự xuất hiện; ô trống ghi "—"
    var rows = [];
    ps.forEach(function (p) { p.specs.forEach(function (r) { if (rows.indexOf(r[0]) < 0) rows.push(r[0]); }); });
    function specOf(p, name) { var r = p.specs.filter(function (x) { return x[0] === name; })[0]; return r ? r[1] : '—'; }
    var groups = ps.map(function (p) { return p.g; }).filter(function (g, i, a) { return a.indexOf(g) === i; });
    function remove(id) {
      writeCmp(readCmp().filter(function (x) { return x !== id; }));
      setTimeout(function () { var b = document.querySelector('.tf-cmp-remove') || document.querySelector('main h1'); if (b) b.focus(); }, 0);
    }
    return h(Shell, null, crumbs, head,
      groups.length > 1 ? h('p', { className: 'tf-cat-note' }, 'Các mẫu thuộc nhóm khác nhau nên nhiều thông số không đặt cạnh nhau được.') : null,
      h('div', { className: 'tf-cmp-scroll', tabIndex: 0, role: 'region', 'aria-label': 'Bảng so sánh, cuộn ngang được' },
        h('table', { className: 'tf-cmp' },
          h('caption', { className: 'tf-sr' }, 'So sánh ' + ps.length + ' sản phẩm'),
          h('thead', null, h('tr', null,
            h('td', null),
            ps.map(function (p) {
              return h('th', { key: p.id, scope: 'col' },
                h('div', { className: 'tf-cmp-head' },
                  h('a', { href: prodHref(p.id), className: 'tf-cmp-img', tabIndex: -1, 'aria-hidden': 'true' }, h(B.Plate, { image: p.img, alt: '', art: artOf(p) })),
                  h('a', { href: prodHref(p.id), className: 'tf-cmp-name' }, p.name),
                  h('button', { type: 'button', className: 'tf-cmp-remove', 'aria-label': 'Bỏ khỏi so sánh: ' + p.name, onClick: function () { remove(p.id); } }, h(B.Icon, { name: 'close', size: 14 }), 'Bỏ')));
            }))),
          h('tbody', null,
            h('tr', null, h('th', { scope: 'row' }, 'Giá'), ps.map(function (p) {
              return h('td', { key: p.id }, p.price > 0 ? h(B.PriceTag, { price: p.price, original: p.orig || undefined }) : h('span', { className: 'tf-price-ask' }, 'Gọi để báo giá'));
            })),
            h('tr', null, h('th', { scope: 'row' }, 'Nhóm'), ps.map(function (p) { return h('td', { key: p.id }, (groupByKey[p.g] || {}).name || '—'); })),
            h('tr', null, h('th', { scope: 'row' }, 'Model'), ps.map(function (p) { return h('td', { key: p.id }, p.model); })),
            rows.map(function (name) {
              return h('tr', { key: name }, h('th', { scope: 'row' }, name), ps.map(function (p) { return h('td', { key: p.id }, specOf(p, name)); }));
            }),
            h('tr', null, h('td', null), ps.map(function (p) {
              return h('td', { key: p.id }, p.price > 0
                ? h(B.Button, { variant: 'primary', size: 'sm', onClick: function () { addToCart(p.id); }, 'aria-label': 'Thêm vào giỏ: ' + p.name }, 'Thêm vào giỏ')
                : h(B.Button, { size: 'sm', href: prodHref(p.id) }, 'Xem báo giá'));
            }))))));
  }

  /* ---------------- thương hiệu ---------------- */
  function Brand() {
    useEffect(function () { setMeta('Thương hiệu Tefal — Tefal', 'Tefal: thương hiệu đồ bếp ra đời năm 1956 tại Pháp, thuộc Groupe SEB. Xem các dòng sản phẩm Tefal đang bán.'); }, []);
    var kitchen = D.products.filter(function (p) { return KITCHEN.indexOf(p.g) >= 0; });
    var fr = D.products.filter(function (p) { return p.origin === 'Pháp'; }).length;
    var groups = D.groups.filter(function (x) { return KITCHEN.indexOf(x.key) >= 0 && x.count > 0; });
    return h(Shell, null,
      h('nav', { className: 'tf-crumbs', 'aria-label': 'Đường dẫn' }, h('a', { href: 'index.html' }, 'Trang chủ'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', null, 'Thương hiệu')),
      h('header', { className: 'tf-cat-head' }, h('h1', { className: 'tf-cat-title' }, 'Tefal')),
      h('div', { className: 'tf-brand' },
        h('div', { className: 'tf-prose' },
          h('p', null, 'Tefal là thương hiệu đồ gia dụng ra đời năm 1956 tại Pháp, gắn với chiếc chảo chống dính đầu tiên. Tên Tefal ghép từ TEFlon và ALuminium, hai vật liệu của chiếc chảo đó.'),
          h('p', null, 'Từ năm 1968, Tefal thuộc Groupe SEB, tập đoàn đồ gia dụng của Pháp.'),
          h('p', null, 'Trang này bán đồ bếp Tefal chính hãng: nồi chảo, nồi cơm điện, nồi chiên không dầu, máy xay, dao và dụng cụ bếp. Mỗi sản phẩm hiện rõ thông số, xuất xứ và giá.')),
        h('dl', { className: 'tf-brand-facts' },
          h('div', null, h('dt', null, 'Mẫu đồ bếp đang bán'), h('dd', null, kitchen.length)),
          h('div', null, h('dt', null, 'Nhóm sản phẩm'), h('dd', null, groups.length)),
          h('div', null, h('dt', null, 'Mẫu sản xuất tại Pháp'), h('dd', null, fr)))),
      h('section', { className: 'tf-section' },
        h(B.SectionTitle, { title: 'Các dòng sản phẩm', moreHref: 'danh-muc.html', moreLabel: 'Tất cả sản phẩm' }),
        h('div', { className: 'tf-grid-6' }, TILES.map(function (t) {
          var g = groupByKey[t.key];
          return h(B.CategoryTile, { key: t.key, name: g.name, count: g.count, href: catHref(t.key), image: imgOf(t.img), art: g.art, icon: ICON_OF[t.key] });
        }))));
  }

  /* ---------------- xuất xứ ---------------- */
  function Origin() {
    useEffect(function () { setMeta('Xuất xứ sản phẩm — Tefal', 'Đồ bếp Tefal theo nơi sản xuất: Pháp, Trung Quốc, Việt Nam, Nhật Bản, Ý.'); }, []);
    var rows = ORIGINS.map(function (o) {
      var ps = D.products.filter(function (p) { return p.origin === o; });
      var groups = ps.map(function (p) { return (groupByKey[p.g] || {}).name; }).filter(function (n, i, a) { return n && a.indexOf(n) === i; });
      return { origin: o, ps: ps, groups: groups };
    }).filter(function (r) { return r.ps.length; });
    var unknown = D.products.filter(function (p) { return !p.origin; }).length;
    return h(Shell, null,
      h('nav', { className: 'tf-crumbs', 'aria-label': 'Đường dẫn' }, h('a', { href: 'index.html' }, 'Trang chủ'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', null, 'Xuất xứ')),
      h('header', { className: 'tf-cat-head' }, h('h1', { className: 'tf-cat-title' }, 'Xuất xứ sản phẩm')),
      h('ul', { className: 'tf-origins' }, rows.map(function (r) {
        var pics = r.ps.filter(function (p) { return p.img; }).slice(0, 3);
        return h('li', { key: r.origin },
          h('a', { className: 'tf-origin', href: 'danh-muc.html?xuat-xu=' + encodeURIComponent(r.origin) },
            h('span', { className: 'tf-origin-pics', 'aria-hidden': 'true' }, pics.map(function (p) { return h(B.Plate, { key: p.id, image: p.img, alt: '', art: artOf(p) }); })),
            h('span', { className: 'tf-origin-body' },
              h('span', { className: 'tf-origin-name' }, 'Sản xuất tại ' + r.origin),
              h('span', { className: 'tf-origin-count' }, r.ps.length + ' mẫu'),
              h('span', { className: 'tf-origin-groups' }, r.groups.slice(0, 4).join(', ') + (r.groups.length > 4 ? '…' : '')))));
      })),
      h('p', { className: 'tf-cat-note' }, 'Xuất xứ theo thông tin sản phẩm.' + (unknown ? ' ' + unknown + ' mẫu chưa ghi xuất xứ.' : '')));
  }

  /* ---------------- bài viết: hướng dẫn chọn đồ bếp (đã duyệt 16/10/2026) ----------------
     Mọi con số trong bài tính từ dữ liệu SP lúc hiển thị, nên tự đúng khi dữ liệu đổi.
     Câu "phù hợp mấy người" lấy theo mô tả của chính các mẫu đó. Duyệt xong thì đặt POST_DRAFT = false. */
  var POST_DRAFT = false; // người dùng duyệt cả 3 bài ngày 16/10/2026
  function ofGroup(g) { return D.products.filter(function (p) { return p.g === g; }); }
  function priced(ps) { return ps.filter(function (p) { return p.price > 0; }); }
  function figV(p) { return p.fig ? parseFloat(String(p.fig.v).split('–').pop().replace(',', '.')) : NaN; }
  function specOf(p, k) { var r = p.specs.filter(function (x) { return x[0] === k; })[0]; return r ? r[1] : null; }
  function priceRange(ps) {
    ps = priced(ps); if (!ps.length) return '—';
    var lo = Math.min.apply(null, ps.map(function (p) { return p.price; })), hi = Math.max.apply(null, ps.map(function (p) { return p.price; }));
    return lo === hi ? vnd(lo) : vnd(lo) + ' – ' + vnd(hi);
  }
  function cheapest(ps) { return priced(ps).sort(function (a, b) { return a.price - b.price; })[0]; }
  function num(n) { return String(n).replace('.', ','); }

  var POSTS = [
    {
      slug: 'chon-noi-com-dien', group: 'noi-com-dien', title: 'Chọn nồi cơm điện Tefal theo số người ăn',
      body: function () {
        var all = priced(ofGroup('noi-com-dien'));
        var by = function (lo, hi) { return all.filter(function (p) { var v = figV(p); return v >= lo && v <= hi; }); };
        var mini = by(0, 1), mid = by(1.1, 1.6), big = by(1.7, 2.5);
        var co = all.filter(function (p) { return /(^|\s)cơ(\s|$)/.test(specOf(p, 'Loại') || ''); });
        var ih = all.filter(function (p) { return /cao tần|IH/.test(p.name + ' ' + (p.desc || '') + ' ' + p.pts.join(' ')); });
        var dt = all.filter(function (p) { return co.indexOf(p) < 0 && ih.indexOf(p) < 0; });
        var ceramic = all.filter(function (p) { return specOf(p, 'Chất liệu') === 'Ceramic'; });
        var caps = all.map(figV).filter(function (v) { return !isNaN(v); });
        return {
          lead: 'Tefal hiện có ' + all.length + ' mẫu nồi cơm điện đang bán, dung tích từ ' + num(Math.min.apply(null, caps)) + ' đến ' + num(Math.max.apply(null, caps)) + ' lít, giá ' + priceRange(all) + '. Chọn nhanh bằng ba câu hỏi: nhà mấy người ăn, muốn nấu kiểu nào, và chi bao nhiêu.',
          blocks: [
            ['h2', '1. Dung tích theo số người ăn'],
            ['p', 'Đây là bước quan trọng nhất. Nồi quá lớn tốn điện và cơm ít dễ khô; nồi quá nhỏ phải nấu hai lần.'],
            ['table', ['Dung tích', 'Hợp với', 'Số mẫu', 'Giá'], [
              ['0,7 lít', '1–2 người', mini.length, priceRange(mini)],
              ['1,5 lít', '2–4 người', mid.length, priceRange(mid)],
              ['1,8–2 lít', '4–6 người', big.length, priceRange(big)]
            ]],
            ['note', 'Cột "Hợp với" lấy theo mô tả của chính các mẫu trong nhóm. Mẫu 1,8 lít nấu được khoảng 10 cốc gạo.'],
            ['h2', '2. Cách nồi làm nóng'],
            ['ul', [
              'Nồi cơ (' + co.length + ' mẫu): nắp gài, một nút gạt nấu và giữ ấm. Đơn giản, giá thấp, công suất nhỏ.',
              'Nồi điện tử (' + dt.length + ' mẫu): bảng phím hoặc cảm ứng, nhiều chương trình nấu như cơm, cháo, hấp. Giá ' + priceRange(dt) + '.',
              'Nồi cao tần IH (' + ih.length + ' mẫu): làm nóng trực tiếp cả lòng nồi bằng cảm ứng điện từ, nhiệt lan đều hơn, công suất 1.200–1.400 W. Giá ' + priceRange(ih) + '.'
            ]],
            ['p', 'Nấu cơm trắng mỗi ngày thì nồi điện tử đã đủ. Nồi cao tần đáng cân nhắc khi muốn cơm chín đều hơn: các mẫu cao tần đều ghi công nghệ lan nhiệt khắp lòng nồi.'],
            ['h2', '3. Lòng nồi'],
            ['p', ceramic.length + ' trên ' + all.length + ' mẫu ghi chất liệu ceramic. Lòng nồi dày giữ nhiệt tốt hơn; thông số độ dày ghi trong trang chi tiết của từng mẫu. Dùng muỗng nhựa hoặc gỗ đi kèm để lớp phủ bền lâu.'],
            ['h2', 'Gợi ý theo nhu cầu'],
            ['picks', [cheapest(mini), cheapest(dt.filter(function (p) { return figV(p) >= 1.8; })), cheapest(ih)].filter(Boolean).map(function (p) { return p.id; })],
            ['cta', 'Xem ' + all.length + ' nồi cơm điện xếp theo dung tích', catHref('noi-com-dien') + '&sap=con-so']
          ]
        };
      }
    },
    {
      slug: 'chon-chao-chong-dinh', group: 'noi-chao', title: 'Chọn chảo chống dính Tefal: cỡ chảo, lớp phủ, loại bếp',
      body: function () {
        var pans = priced(ofGroup('noi-chao').filter(function (p) { return /^Chảo/.test(p.name); }));
        var dia = function (d) { return pans.filter(function (p) { return p.fig && p.fig.v === d; }); };
        var induction = pans.filter(function (p) { return specOf(p, 'Đáy nhiễm từ') === 'Có'; });
        var ti = pans.filter(function (p) { return specOf(p, 'Lớp phủ chống dính') === 'Titanium'; });
        var ce = pans.filter(function (p) { return specOf(p, 'Lớp phủ chống dính') === 'Ceramic'; });
        var signal = pans.filter(function (p) { return /Thermo-Signal|báo nhiệt/i.test(p.pts.join(' ') + ' ' + (p.desc || '')); });
        var fr = pans.filter(function (p) { return p.origin === 'Pháp'; });
        return {
          lead: 'Tefal có ' + pans.length + ' mẫu chảo đang bán, đường kính 16 đến 30 cm, giá ' + priceRange(pans) + '. Chọn theo ba điều: cỡ chảo hợp khẩu phần, lớp chống dính, và chảo có dùng được trên bếp nhà bạn không.',
          blocks: [
            ['h2', '1. Cỡ chảo'],
            ['table', ['Đường kính', 'Thường dùng cho', 'Số mẫu', 'Giá'], [
              ['20 cm', 'Chiên trứng, khẩu phần 1–2 người', dia('20').length, priceRange(dia('20'))],
              ['24–26 cm', 'Nấu hằng ngày cho 2–4 người', dia('24').length + dia('26').length, priceRange(dia('24').concat(dia('26')))],
              ['28–30 cm', 'Xào nhiều, chiên cá, nhà đông người', dia('28').length + dia('30').length, priceRange(dia('28').concat(dia('30')))]
            ]],
            ['p', 'Nếu chỉ mua một chiếc, cỡ 24–26 cm dùng được nhiều việc nhất. Nhà 4 người trở lên nên có thêm một chiếc 28 cm.'],
            ['h2', '2. Lớp chống dính'],
            ['ul', [
              'Titanium (' + ti.length + ' mẫu): lớp phủ gia cường, mô tả sản phẩm nhấn mạnh khả năng chống trầy xước.',
              'Ceramic (' + ce.length + ' mẫu): lớp phủ gốc khoáng, bề mặt sáng màu.',
              (pans.length - ti.length - ce.length) + ' mẫu còn lại không ghi loại lớp phủ trong thông số; xem mô tả trong trang chi tiết hoặc hỏi showroom.'
            ]],
            ['p', signal.length + ' mẫu có điểm báo nhiệt Thermo-Signal: chấm tròn giữa lòng chảo đổi màu khi chảo đủ nóng (khoảng 180 °C) để cho thức ăn vào.'],
            ['h2', '3. Loại bếp'],
            ['p', induction.length + ' trên ' + pans.length + ' mẫu ghi rõ đáy nhiễm từ, dùng được trên bếp từ, bếp gas và bếp hồng ngoại. Nhà dùng bếp từ nên chọn trong nhóm này; mẫu không ghi thì hỏi showroom trước khi mua.'],
            ['h2', '4. Dùng sao cho bền'],
            ['ul', [
              'Đun lửa vừa, không đun chảo không trên lửa lớn.',
              'Dùng sạn gỗ hoặc silicon, tránh dụng cụ kim loại sắc cạnh.',
              'Để chảo nguội rồi mới rửa, dùng miếng rửa mềm.'
            ]],
            ['p', fr.length + ' mẫu chảo trong danh sách sản xuất tại Pháp.'],
            ['h2', 'Gợi ý theo nhu cầu'],
            ['picks', [cheapest(dia('24')), cheapest(dia('28').filter(function (p) { return induction.indexOf(p) >= 0; })), cheapest(ti.filter(function (p) { return p.origin === 'Pháp'; }))].filter(Boolean).map(function (p) { return p.id; })],
            ['cta', 'Xem tất cả nồi chảo', catHref('noi-chao')]
          ]
        };
      }
    },
    {
      slug: 'chon-noi-chien-khong-dau', group: 'noi-chien', title: 'Chọn nồi chiên không dầu Tefal theo dung tích',
      body: function () {
        var all = ofGroup('noi-chien'), sold = priced(all);
        var caps = all.map(figV).filter(function (v) { return !isNaN(v); });
        var small = sold.filter(function (p) { return figV(p) <= 5; }), six = sold.filter(function (p) { return figV(p) === 6; });
        var big = sold.filter(function (p) { return figV(p) > 6 && figV(p) < 15; }), oven = sold.filter(function (p) { return figV(p) >= 15; });
        var win = sold.filter(function (p) { return /Window/i.test(p.name); });
        var unpriced = all.length - sold.length;
        return {
          lead: 'Tefal có ' + all.length + ' mẫu nồi chiên không dầu, dung tích ' + num(Math.min.apply(null, caps)) + ' đến ' + num(Math.max.apply(null, caps)) + ' lít. ' + sold.length + ' mẫu đang có giá, ' + priceRange(sold) + '. Dung tích là điều cần chọn đầu tiên, sau đó mới tới cách điều khiển và tính năng.',
          blocks: [
            ['h2', '1. Dung tích'],
            ['table', ['Dung tích', 'Hợp với', 'Số mẫu có giá', 'Giá'], [
              ['4,2–5 lít', 'Nhà ít người, món nhỏ', small.length, priceRange(small)],
              ['6 lít', 'Gia đình 4–6 người', six.length, priceRange(six)],
              ['7,5 lít', 'Khẩu phần lớn trong một lần nấu', big.length, priceRange(big)],
              ['20 lít', 'Kết hợp lò nướng', oven.length, priceRange(oven)]
            ]],
            ['note', 'Mẫu 6 lít ghi trong mô tả là hợp gia đình 4–6 người. Kích thước giỏ chiên ghi trong trang chi tiết của từng mẫu.'],
            unpriced ? ['p', unpriced + ' mẫu loại lớn nhiều ngăn chưa có giá bán; gọi showroom để được báo giá.'] : null,
            ['h2', '2. Điều khiển và chương trình nấu'],
            ['ul', [
              'Phím bấm hoặc cảm ứng: cả hai đều có màn hình số, chọn được nhiệt độ và thời gian.',
              'Các mẫu có ghi thông số đều có 8–10 chương trình cài sẵn; dải nhiệt 80–200 °C.',
              'Dòng Window (' + win.length + ' mẫu) có cửa sổ trên thân máy, xem thức ăn mà không cần kéo giỏ ra.'
            ]],
            ['h2', '3. Điện và chỗ đặt'],
            ['p', 'Công suất các mẫu từ 1.550 đến 2.020 W. Nên cắm vào ổ riêng, không dùng chung ổ chia với bếp điện hay ấm siêu tốc. Chừa khoảng trống phía sau và hai bên máy để hơi nóng thoát ra.'],
            ['h2', 'Gợi ý theo nhu cầu'],
            ['picks', [cheapest(small), cheapest(six), cheapest(big)].filter(Boolean).map(function (p) { return p.id; })],
            ['cta', 'Xem tất cả nồi chiên không dầu', catHref('noi-chien')]
          ].filter(Boolean)
        };
      }
    }
  ];

  function PostBlocks(p) {
    return p.blocks.map(function (b, i) {
      if (b[0] === 'h2') return h('h2', { key: i }, b[1]);
      if (b[0] === 'p') return h('p', { key: i }, b[1]);
      if (b[0] === 'note') return h('p', { key: i, className: 'tf-post-note' }, b[1]);
      if (b[0] === 'ul') return h('ul', { key: i }, b[1].map(function (t, j) { return h('li', { key: j }, t); }));
      if (b[0] === 'table') return h('div', { key: i, className: 'tf-post-table', tabIndex: 0, role: 'region', 'aria-label': 'Bảng ' + b[1][0].toLowerCase() },
        h('table', null,
          h('thead', null, h('tr', null, b[1].map(function (c, j) { return h('th', { key: j, scope: 'col' }, c); }))),
          h('tbody', null, b[2].map(function (r, j) { return h('tr', { key: j }, r.map(function (c, k) { return k === 0 ? h('th', { key: k, scope: 'row' }, c) : h('td', { key: k }, c); })); }))));
      if (b[0] === 'picks') return h('div', { key: i, className: 'tf-grid-products tf-post-picks' }, b[1].map(function (id) { return h(B.ProductCard, cardProps(byId[id])); }));
      if (b[0] === 'cta') return h('p', { key: i }, h(B.Button, { variant: 'primary', href: b[2] }, b[1]));
      return null;
    });
  }

  function Blog() {
    var slug = param('bai');
    var post = POSTS.filter(function (x) { return x.slug === slug; })[0];
    var body = post ? post.body() : null;
    useEffect(function () {
      if (post) setMeta(post.title + ' — Tefal', body.lead.slice(0, 155));
      else setMeta('Bài viết — Tefal', 'Hướng dẫn chọn đồ bếp Tefal: nồi cơm điện, chảo chống dính, nồi chiên không dầu.');
    }, [slug]);
    var draft = POST_DRAFT ? h('p', { className: 'tf-post-draft', role: 'note' }, 'Bản nháp chờ duyệt. Số liệu lấy từ dữ liệu sản phẩm hiện có.') : null;
    var crumbs = h('nav', { className: 'tf-crumbs', 'aria-label': 'Đường dẫn' },
      h('a', { href: 'index.html' }, 'Trang chủ'), h('span', { 'aria-hidden': 'true' }, '/'),
      post ? h('a', { href: 'bai-viet.html' }, 'Bài viết') : h('span', null, 'Bài viết'),
      post ? h('span', { 'aria-hidden': 'true' }, '/') : null, post ? h('span', null, post.title) : null);

    if (post) {
      var g = groupByKey[post.group];
      var others = POSTS.filter(function (x) { return x !== post; });
      return h(Shell, null, crumbs,
        h('article', { className: 'tf-post' },
          h('header', { className: 'tf-post-head' },
            h('p', { className: 'tf-hero-kicker' }, 'Hướng dẫn chọn · ' + g.name),
            h('h1', { className: 'tf-post-title' }, post.title),
            draft,
            h('p', { className: 'tf-post-lead' }, body.lead)),
          h('div', { className: 'tf-post-body tf-prose' }, PostBlocks(body))),
        h('section', { className: 'tf-section' },
          h(B.SectionTitle, { title: 'Bài khác', moreHref: 'bai-viet.html', moreLabel: 'Tất cả bài viết' }),
          h('ul', { className: 'tf-blog-cards' }, others.map(function (x) { return h('li', { key: x.slug }, PostCard(x)); }))));
    }
    return h(Shell, null, crumbs,
      h('header', { className: 'tf-cat-head' }, h('h1', { className: 'tf-cat-title' }, 'Bài viết')),
      draft,
      h('ul', { className: 'tf-blog-cards' }, POSTS.map(function (x) { return h('li', { key: x.slug }, PostCard(x)); })));
  }
  function PostCard(x) {
    var g = groupByKey[x.group];
    var pic = cheapest(priced(ofGroup(x.group)).filter(function (p) { return p.img; }));
    return h('a', { className: 'tf-blog-card', href: 'bai-viet.html?bai=' + x.slug },
      pic ? h('span', { className: 'tf-blog-pic', 'aria-hidden': 'true' }, h(B.Plate, { image: pic.img, alt: '', art: artOf(pic) })) : null,
      h('span', { className: 'tf-hero-kicker' }, 'Hướng dẫn chọn · ' + g.name),
      h('span', { className: 'tf-blog-title' }, x.title),
      h('span', { className: 'tf-blog-text' }, x.body().lead.split('. ')[0] + '.'),
      h('span', { className: 'tf-ctile-more' }, 'Đọc bài', h(B.Icon, { name: 'arrow', size: 14 })));
  }

  var PAGES = { home: Home, category: Category, product: Product, cart: Cart, account: Account, checkout: Checkout, compare: Compare, brand: Brand, origin: Origin, blog: Blog };
  var page = PAGES[document.body.getAttribute('data-page')] || Home;
  // Vẽ lại cả trang khi danh sách yêu thích, so sánh hoặc người dùng đổi, để các thẻ SP cập nhật trạng thái nút
  function Root() {
    var s = useState(0), setV = s[1];
    useEffect(function () {
      function bump() { setV(function (n) { return n + 1; }); }
      ['tf-wish', 'tf-compare', 'tf-user', 'storage'].forEach(function (ev) { window.addEventListener(ev, bump); });
      return function () { ['tf-wish', 'tf-compare', 'tf-user', 'storage'].forEach(function (ev) { window.removeEventListener(ev, bump); }); };
    }, []);
    return h(page, { v: s[0] });
  }
  ReactDOM.createRoot(document.getElementById('root')).render(h(Root));
})();
