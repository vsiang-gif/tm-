// Runs entirely inside the user's own logged-in browser (Tampermonkey) on Temu / SHEIN / Etsy / Amazon / Shopee / Lazada / AliExpress.
// Kept as a plain-JS string so it ships verbatim, independent of the Next.js bundler.
// The body is a String.raw template: it must never contain backticks or a dollar-brace sequence.
export const PLATFORM_NAMES = {
  temu: 'Temu',
  shein: 'SHEIN',
  etsy: 'Etsy',
  amazon: 'Amazon',
  shopee: 'Shopee',
  lazada: 'Lazada',
  aliexpress: '速卖通',
} as const

type Platform = keyof typeof PLATFORM_NAMES
type Keywords = readonly [men: string, women: string]
type Site = { id: string; p: Platform; name: string; origin: string; prefix: string; lang: string; men: string; women: string }

const EN: Keywords = ['black graphic t shirt men', 'black graphic t shirt women']
const DE: Keywords = ['schwarzes t-shirt herren print', 'schwarzes t-shirt damen print']
const FR: Keywords = ['t-shirt noir homme imprimé', 't-shirt noir femme imprimé']
const IT: Keywords = ['maglietta nera uomo stampa', 'maglietta nera donna stampa']
const ES: Keywords = ['camiseta negra hombre estampada', 'camiseta negra mujer estampada']
const MX: Keywords = ['playera negra hombre estampada', 'playera negra mujer estampada']
const JP: Keywords = ['tシャツ 黒 メンズ プリント', 'tシャツ 黒 レディース プリント']
const TH: Keywords = ['เสื้อยืดสีดำ ผู้ชาย สกรีนลาย', 'เสื้อยืดสีดำ ผู้หญิง สกรีนลาย']
const VN: Keywords = ['áo thun đen nam in hình', 'áo thun đen nữ in hình']
const ID: Keywords = ['kaos hitam pria sablon', 'kaos hitam wanita sablon']
const TW: Keywords = ['黑色印花T恤 男', '黑色印花T恤 女']
const BR: Keywords = ['camiseta preta masculina estampada', 'camiseta preta feminina estampada']

function site(p: Platform, code: string, name: string, origin: string, lang: string, kw: Keywords, prefix = ''): Site {
  return { id: p + '-' + code, p, name, origin, prefix, lang, men: kw[0], women: kw[1] }
}

export const SITES: Site[] = [
  site('temu', 'us', '美国', 'https://www.temu.com', '英文', EN),
  site('temu', 'uk', '英国', 'https://www.temu.com', '英文', EN, 'uk'),
  site('temu', 'ca', '加拿大', 'https://www.temu.com', '英文', EN, 'ca'),
  site('temu', 'au', '澳大利亚', 'https://www.temu.com', '英文', EN, 'au'),
  site('temu', 'de', '德国', 'https://www.temu.com', '德文', DE, 'de'),
  site('temu', 'fr', '法国', 'https://www.temu.com', '法文', FR, 'fr'),
  site('temu', 'it', '意大利', 'https://www.temu.com', '意大利文', IT, 'it'),
  site('temu', 'es', '西班牙', 'https://www.temu.com', '西班牙文', ES, 'es'),
  site('temu', 'mx', '墨西哥', 'https://www.temu.com', '西班牙文', MX, 'mx'),
  site('temu', 'jp', '日本', 'https://www.temu.com', '日文', JP, 'jp'),

  site('shein', 'us', '美国', 'https://us.shein.com', '英文', EN),
  site('shein', 'uk', '英国', 'https://www.shein.co.uk', '英文', EN),
  site('shein', 'ca', '加拿大', 'https://ca.shein.com', '英文', EN),
  site('shein', 'au', '澳大利亚', 'https://au.shein.com', '英文', EN),
  site('shein', 'de', '德国', 'https://de.shein.com', '德文', DE),
  site('shein', 'fr', '法国', 'https://fr.shein.com', '法文', FR),
  site('shein', 'it', '意大利', 'https://it.shein.com', '意大利文', IT),
  site('shein', 'es', '西班牙', 'https://es.shein.com', '西班牙文', ES),
  site('shein', 'mx', '墨西哥', 'https://www.shein.com.mx', '西班牙文', MX),

  site('etsy', 'us', '全球', 'https://www.etsy.com', '英文', EN),
  site('etsy', 'uk', '英国', 'https://www.etsy.com', '英文', EN, 'uk'),
  site('etsy', 'de', '德国', 'https://www.etsy.com', '德文', DE, 'de'),
  site('etsy', 'fr', '法国', 'https://www.etsy.com', '法文', FR, 'fr'),

  site('amazon', 'us', '美国', 'https://www.amazon.com', '英文', EN),
  site('amazon', 'uk', '英国', 'https://www.amazon.co.uk', '英文', EN),
  site('amazon', 'ca', '加拿大', 'https://www.amazon.ca', '英文', EN),
  site('amazon', 'au', '澳大利亚', 'https://www.amazon.com.au', '英文', EN),
  site('amazon', 'de', '德国', 'https://www.amazon.de', '德文', DE),
  site('amazon', 'fr', '法国', 'https://www.amazon.fr', '法文', FR),
  site('amazon', 'it', '意大利', 'https://www.amazon.it', '意大利文', IT),
  site('amazon', 'es', '西班牙', 'https://www.amazon.es', '西班牙文', ES),
  site('amazon', 'mx', '墨西哥', 'https://www.amazon.com.mx', '西班牙文', MX),
  site('amazon', 'jp', '日本', 'https://www.amazon.co.jp', '日文', JP),

  site('shopee', 'sg', '新加坡', 'https://shopee.sg', '英文', EN),
  site('shopee', 'my', '马来西亚', 'https://shopee.com.my', '英文', EN),
  site('shopee', 'ph', '菲律宾', 'https://shopee.ph', '英文', EN),
  site('shopee', 'th', '泰国', 'https://shopee.co.th', '泰文', TH),
  site('shopee', 'vn', '越南', 'https://shopee.vn', '越南文', VN),
  site('shopee', 'id', '印尼', 'https://shopee.co.id', '印尼文', ID),
  site('shopee', 'tw', '台湾', 'https://shopee.tw', '繁体中文', TW),
  site('shopee', 'br', '巴西', 'https://shopee.com.br', '葡萄牙文', BR),

  site('lazada', 'sg', '新加坡', 'https://www.lazada.sg', '英文', EN),
  site('lazada', 'my', '马来西亚', 'https://www.lazada.com.my', '英文', EN),
  site('lazada', 'ph', '菲律宾', 'https://www.lazada.com.ph', '英文', EN),
  site('lazada', 'th', '泰国', 'https://www.lazada.co.th', '泰文', TH),
  site('lazada', 'vn', '越南', 'https://www.lazada.vn', '越南文', VN),
  site('lazada', 'id', '印尼', 'https://www.lazada.co.id', '印尼文', ID),

  site('aliexpress', 'global', '全球', 'https://www.aliexpress.com', '英文', EN),
  site('aliexpress', 'us', '美国', 'https://www.aliexpress.us', '英文', EN),
]

// Any hit means the product is not collected at all.
export const DEFAULT_SKIP_WORDS = [
  '毒品', '大麻', '吸毒', '可卡因', '冰毒', '海洛因', '摇头丸', '色情', '扫黄', '裸体', '情趣',
  'weed', 'marijuana', 'cannabis', '420', 'stoner', 'kush', 'cocaine', 'heroin', 'meth', 'lsd', 'drug', 'drugs', 'dope',
  'porn', 'nude', 'naked', 'sex', 'sexy', 'nsfw', 'xxx', 'boobs', 'fuck',
  '迪士尼', 'disney', '三丽鸥', 'sanrio', 'hello kitty', '怪物猎人', 'monster hunter',
  '双面', '前后印花', '背面印花', 'double sided', 'double-sided', 'front and back', 'back print',
  '满印', '全身印花', 'all over print', 'allover print', 'full print',
]

// Removed from the listing title (the product itself is still collected).
export const DEFAULT_REMOVE_WORDS = [
  '涤纶', '聚酯', '纤维', '混纺', '针织', '氨纶', '纯棉', '棉质', '棉衣', '棉服', '套装', '棉',
  '儿童', '小孩', '男孩', '女孩', '男童', '女童', '青少年', '学校',
  '卫衣', '衬衫', '连帽', '长袖', '无袖', '背心', '毛衣', '开衫', '夹克', '马甲',
  '修身', '露脐', '露肩', '运动衫', '套头衫', '外套', '拉链', '抓绒', '保暖', '摇粒绒', '加绒',
  '亲子', '婴儿', '帽衫', '套衫', '热卖', '限时优惠', '迪士尼', '三丽鸥', '怪物猎人', 'monster hunter',
  'polyester', 'fiber', 'blend', 'knit', 'knitted', 'spandex', 'elastane', '100% cotton', 'cotton', 'set',
  'kids', 'kid', 'children', 'child', 'boys', 'girls', 'boy', 'girl', 'teen', 'teens', 'youth', 'toddler', 'baby', 'school',
  'hoodie', 'hooded', 'sweatshirt', 'blouse', 'long sleeve', 'long-sleeve', 'sleeveless', 'tank top', 'vest', 'sweater',
  'cardigan', 'jacket', 'slim fit', 'crop top', 'cropped', 'off shoulder', 'pullover', 'coat', 'zipper', 'zip up',
  'fleece', 'thermal', 'warm', 'family matching', 'parent-child', 'hot sale', 'limited time', 'disney', 'sanrio',
]

const COLLECTOR_BODY = String.raw`
(function () {
  'use strict';
  if (window.top !== window.self || window.__temuPatternCollector) return;
  window.__temuPatternCollector = true;

  var SITES = __SITES__;
  var PNAMES = __PNAMES__;
  var DEFAULT_SKIP = __SKIP__;
  var DEFAULT_REMOVE = __REMOVE__;
  var ARK_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

  // ---------- per-platform adapters ----------
  function stripSuffix(u) { return u.split('?')[0].replace(/(\.(?:jpe?g|png|webp))_.*$/i, '$1'); }
  var PLATFORMS = {
    temu: {
      host: /(^|\.)temu\.com$/i, img: /(^|\.)(kwcdn\.com|temu\.com)$/i, metric: 'sales',
      search: function (s, k) { return s.origin + '/' + (s.prefix ? s.prefix + '/' : '') + 'search_result.html?search_key=' + encodeURIComponent(k); },
      isSearch: function () { return /search_result/.test(location.pathname); },
      goods: function (h) { var m = h.match(/-g-(\d{6,})\.html/) || h.match(/[?&]goods_id=(\d{6,})/); return m ? m[1] : null; },
      store: function (h) { var m = h.match(/-m-(\d{6,})\.html/) || h.match(/[?&]mall_id=(\d{6,})/); return m ? m[1] : null; },
      hi: function (u) { return u.split('?')[0]; }
    },
    shein: {
      host: /(^|\.)shein\.[a-z.]+$/i, img: /(ltwebstatic\.com|sheinimg\.com|shein\.[a-z.]+)$/i, metric: 'optional',
      search: function (s, k) { return s.origin + '/pdsearch/' + encodeURIComponent(k) + '/'; },
      isSearch: function () { return /\/pdsearch\//.test(location.pathname); },
      goods: function (h) { var m = h.match(/-p-(\d{5,})(?:-cat-\d+)?\.html/); return m ? m[1] : null; },
      store: function (h) { var m = h.match(/[?&]store_code=(\d+)/); return m ? m[1] : null; },
      hi: function (u) { return u.split('?')[0].replace(/_thumbnail_\d+x\d*/i, ''); }
    },
    etsy: {
      host: /(^|\.)etsy\.com$/i, img: /etsystatic\.com$/i, metric: 'reviews',
      search: function (s, k) { return s.origin + (s.prefix ? '/' + s.prefix : '') + '/search?q=' + encodeURIComponent(k); },
      isSearch: function () { return /\/search(\/|$)/.test(location.pathname); },
      goods: function (h) { var m = h.match(/\/listing\/(\d{6,})/); return m ? m[1] : null; },
      store: function (h) { var m = h.match(/\/shop\/([A-Za-z0-9]{3,})(?=[/?#]|$)/); return m ? m[1] : null; },
      hi: function (u) { return u.split('?')[0].replace(/il_\d+x[\dN]+\./, 'il_fullxfull.'); }
    },
    amazon: {
      host: /(^|\.)amazon\.[a-z.]+$/i, img: /(media-amazon\.com|ssl-images-amazon\.com)$/i, metric: 'reviews',
      search: function (s, k) { return s.origin + '/s?k=' + encodeURIComponent(k); },
      isSearch: function () { return location.pathname === '/s' && /[?&]k=/.test(location.search); },
      goods: function (h) { var m = h.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=[/?#]|$)/); return m ? m[1] : null; },
      store: function (h) { var m = h.match(/[?&](?:me|seller)=([A-Z0-9]{10,16})(?=[&#]|$)/); return m ? m[1] : null; },
      storeUrl: function (id) { return location.origin + '/s?me=' + id; },
      hi: function (u) { return u.split('?')[0].replace(/\._[^/]+_\.(jpe?g|png|webp)$/i, '.$1'); }
    },
    shopee: {
      host: /(^|\.)shopee\.[a-z.]+$/i, img: /(susercontent\.com|shopeemobile\.com|shopee\.[a-z.]+)$/i, metric: 'sales',
      search: function (s, k) { return s.origin + '/search?keyword=' + encodeURIComponent(k); },
      isSearch: function () { return location.pathname === '/search'; },
      goods: function (h) { var m = h.match(/-i\.(\d+)\.(\d+)/) || h.match(/\/product\/(\d+)\/(\d+)/); return m ? m[1] + '.' + m[2] : null; },
      store: function (h) { var m = h.match(/\/shop\/(\d+)/); return m ? m[1] : null; },
      storeFromGoods: function (g) { var id = g.split('.')[0]; return { storeId: id, url: location.origin + '/shop/' + id }; },
      hi: function (u) { return u.split('?')[0].replace(/_tn$/, ''); }
    },
    lazada: {
      host: /(^|\.)lazada\.[a-z.]+$/i, img: /(slatic\.net|lazcdn\.com|alicdn\.com)$/i, metric: 'sales',
      search: function (s, k) { return s.origin + '/catalog/?q=' + encodeURIComponent(k); },
      isSearch: function () { return /^\/catalog/.test(location.pathname) || /[?&]q=/.test(location.search); },
      goods: function (h) { var m = h.match(/-i(\d{5,})(?:-s\d+)?\.html/); return m ? m[1] : null; },
      store: function (h) { var m = h.match(/\/shop\/([a-z0-9-]{3,})/i); return m ? m[1] : null; },
      hi: stripSuffix
    },
    aliexpress: {
      host: /(^|\.)aliexpress\.[a-z.]+$/i, img: /(alicdn\.com|aliexpress-media\.com)$/i, metric: 'sales',
      search: function (s, k) { return s.origin + '/w/wholesale-' + encodeURIComponent(k.trim().replace(/\s+/g, '-')) + '.html'; },
      isSearch: function () { return /\/w\/wholesale-/.test(location.pathname); },
      goods: function (h) { var m = h.match(/\/item\/(\d{8,})\.html/); return m ? m[1] : null; },
      store: function (h) { var m = h.match(/\/store\/(\d{4,})/); return m ? m[1] : null; },
      hi: stripSuffix
    }
  };
  var PKEY = null;
  for (var pk in PLATFORMS) if (PLATFORMS[pk].host.test(location.hostname)) { PKEY = pk; break; }
  if (!PKEY) return;
  var PLAT = PLATFORMS[PKEY];

  var MULT = { '万': 10000, '萬': 10000, 'w': 10000, '千': 1000, 'k': 1000, 'rb': 1000, 'พัน': 1000, 'หมื่น': 10000, 'm': 1000000, 'jt': 1000000 };
  var UNIT = '(万|萬|千|rb|พัน|หมื่น|jt|[kwm])?';
  var SOLD_WORDS = '(?:sold|bought|verkauft|vendus?|vendidos?|venduti|verkocht|sprzedano|terjual|ขายแล้ว|đã bán|販売済み?|点販売|已售出?|售出|件已售)';
  var SALES_RES = [
    new RegExp('(\\d[\\d.,]*)\\s*' + UNIT + '\\s*\\+?\\s*(?:件|个|個|点)?\\s*' + SOLD_WORDS, 'i'),
    new RegExp(SOLD_WORDS + '\\s*(\\d[\\d.,]*)\\s*' + UNIT + '\\s*\\+?', 'i')
  ];
  var REVIEW_RES = [
    /\((\d[\d.,]*)\s*([kK])?\+?\)/,
    /(\d[\d.,]*)\s*([kK])?\s*(?:reviews?|ratings?|bewertungen|avis|valutazioni|reseñas|valoraciones|件の評価|評価)/i
  ];
  var MORE_RE = /^(查看更多|显示更多|更多商品|加载更多|See more|Show more|Load more|View more|Mehr anzeigen|Voir plus|Ver más|Ver mais|Mostra altro|もっと見る|Xem thêm|Lihat lainnya|ดูเพิ่มเติม)/i;
  var NEXT_SEL = 'a[rel="next"], .s-pagination-next:not(.s-pagination-disabled), a[aria-label*="next page" i], button[aria-label*="next page" i], .shopee-mini-page-controller__next-btn, .shopee-icon-button--right:not(.shopee-icon-button--disabled), li.ant-pagination-next:not(.ant-pagination-disabled) > *, li.comet-pagination-next:not(.comet-pagination-disabled) > *';
  var BLACK_RE = /黑|black|schwarz|noir|negr[ao]|ner[ao]|zwart|czarn|黒|ブラック|ดำ|đen|hitam|pret[ao]/i;
  var FEMALE_WORDS = ['女装', '女士', '女款', '女式', '女性', '女生', '女', "women's", 'womens', 'women', 'woman', 'ladies', 'lady', 'female', 'damen', 'femme', 'mujer', 'donna', 'feminina', 'wanita', 'レディース'];
  var MALE_WORDS = ['男装', '男士', '男款', '男式', '男性', '男生', '男', "men's", 'mens', 'men', 'man', 'male', 'herren', 'homme', 'hombre', 'uomo', 'masculina', 'pria', 'メンズ'];

  var DEFAULTS = {
    arkKey: '', arkModel: 'doubao-seed-2-0-pro',
    minSales: 20, target: 60, maxPages: 5, blackOnly: true, pixelCheck: true, darkMin: 40, gender: 'men',
    enterStore: false, storeCount: 3, storeTarget: 30,
    handoff: 'alt1', clickGap: 3, saveOriginal: false, aiCheck: true, aiVision: true,
    skipWords: DEFAULT_SKIP.join('，'), removeWords: DEFAULT_REMOVE.join('，'),
    sites: {}, v: 6
  };
  var cfg = Object.assign({}, DEFAULTS, GM_getValue('cfg', {}));
  if (!cfg.arkModel || /^doubao-seed-1-6/.test(cfg.arkModel)) cfg.arkModel = DEFAULTS.arkModel;
  if (cfg.v !== 6 && cfg.v !== 7 && cfg.v !== 8) { cfg.v = 6; cfg.aiCheck = true; cfg.saveOriginal = false; cfg.handoff = 'alt1'; }
  if (cfg.v === 6) { cfg.v = 7; if (cfg.minSales === 100) cfg.minSales = DEFAULTS.minSales; }
  if (cfg.v === 7) { cfg.v = 8; cfg.enterStore = false; GM_setValue('cfg', cfg); }
  if (['alt1', 'click', 'mark'].indexOf(cfg.handoff) < 0) cfg.handoff = 'alt1';
  ['apiBase', 'appId', 'secret', 'crop', 'matting', 'dress', 'stanceId', 'backgroundId', 'dressAr', 'dressNum', 'lingtuTitle'].forEach(function (k) { delete cfg[k]; });
  var oldCountries = cfg.countries || {};
  cfg.sites = Object.assign({}, cfg.sites);
  SITES.forEach(function (s) {
    var cur = cfg.sites[s.id] || (s.p === 'temu' ? oldCountries[s.id.slice(5)] : null) || {};
    cfg.sites[s.id] = { on: cur.on != null ? cur.on : s.id === 'temu-us', keyword: cur.keyword || s[cfg.gender] };
  });
  delete cfg.countries;
  var done = new Set(GM_getValue('done', []));
  var records = GM_getValue('records', []);
  var queue = [], working = 0, running = false;
  var stats = { found: 0, candidates: 0, skipped: 0, saved: 0, failed: 0 };
  var skipList = [], removeList = [], femaleList = [], maleList = [];

  function save() { GM_setValue('cfg', cfg); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function safe(s) { return String(s).replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40); }
  function pending() { return queue.length + working; }
  function siteBy(id) { for (var i = 0; i < SITES.length; i++) if (SITES[i].id === id) return SITES[i]; return SITES[0]; }
  function siteLabel(s) { return PNAMES[s.p] + ' ' + s.name; }
  function currentSite() {
    var seg = location.pathname.split('/')[1] || '', fallback = null, plain = null;
    for (var i = 0; i < SITES.length; i++) {
      var s = SITES[i];
      if (s.p !== PKEY) continue;
      if (!fallback) fallback = s;
      if (new URL(s.origin).hostname !== location.hostname) continue;
      if (s.prefix && s.prefix === seg) return s;
      if (!s.prefix && !plain) plain = s;
    }
    return plain || fallback;
  }
  var TEMU_CUR = { us: 'USD', uk: 'GBP', ca: 'CAD', au: 'AUD', de: 'EUR', fr: 'EUR', it: 'EUR', es: 'EUR', mx: 'MXN', jp: 'JPY' };
  var TEMU_CN = { '美国': 'us', '英国': 'uk', '加拿大': 'ca', '澳大利亚': 'au', '德国': 'de', '法国': 'fr', '意大利': 'it', '西班牙': 'es', '墨西哥': 'mx', '日本': 'jp' };
  function temuRealRegion() {
    var txt = (document.body && document.body.textContent) || '';
    var m = txt.match(/所在站点为\s*Temu\s*([\u4e00-\u9fa5]{2,4})/);
    if (m && TEMU_CN[m[1]]) return { code: TEMU_CN[m[1]], how: 'site' };
    var c = txt.match(/\b(USD|GBP|EUR|JPY|CAD|AUD|MXN)\s*:\s*\S/);
    if (c) return { cur: c[1], how: 'currency' };
    var counts = { GBP: (txt.match(/£\s?\d/g) || []).length, EUR: (txt.match(/€\s?\d|\d\s?€/g) || []).length, JPY: (txt.match(/[¥￥]\s?\d/g) || []).length };
    var best = null;
    for (var k in counts) if (counts[k] >= 3 && (!best || counts[k] > counts[best])) best = k;
    return best ? { cur: best, how: 'price' } : null;
  }
  function temuRegionMismatch(siteId) {
    var want = siteId.replace(/^temu-/, ''), real = temuRealRegion();
    if (!real) return null;
    if (real.code) return real.code === want ? null : real.code;
    if (real.cur === TEMU_CUR[want]) return null;
    for (var k in TEMU_CUR) if (TEMU_CUR[k] === real.cur) return k;
    return null;
  }
  function searchUrl(id, keyword) { var s = siteBy(id); return PLATFORMS[s.p].search(s, keyword); }
  function hrefHas(k) {
    try { return decodeURIComponent(location.href.replace(/\+/g, ' ')).toLowerCase().indexOf(String(k).toLowerCase()) >= 0; } catch (e) { return false; }
  }

  // ---------- keyword rules ----------
  function esc(s) { return s.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&'); }
  function compile(words) {
    return words.map(function (w) { return w.trim(); }).filter(Boolean)
      .sort(function (a, b) { return b.length - a.length; })
      .map(function (w) {
        var latin = /^[\x00-\x7f]+$/.test(w);
        var src = latin ? '(^|[^a-z0-9])' + esc(w) + '(?=$|[^a-z0-9])' : esc(w);
        return { word: w, test: new RegExp(src, 'i'), all: new RegExp(src, 'gi'), latin: latin };
      });
  }
  function splitWords(s) { return String(s || '').split(/[\n,，、;；]+/); }
  function compileRules() {
    skipList = compile(splitWords(cfg.skipWords));
    removeList = compile(splitWords(cfg.removeWords));
    femaleList = compile(FEMALE_WORDS);
    maleList = compile(MALE_WORDS);
  }
  function findHit(text, list) {
    for (var i = 0; i < list.length; i++) if (list[i].test.test(text)) return list[i].word;
    return null;
  }
  function stripWords(text, list) {
    for (var i = 0; i < list.length; i++) text = text.replace(list[i].all, list[i].latin ? '$1' : '');
    return text;
  }
  function cleanTitle(title) {
    var t = String(title || '');
    t = t.replace(/秋冬|春秋|秋季|冬季|秋款|冬款/g, '四季').replace(/(四季)+/g, '四季');
    t = t.replace(/\b(autumn\s*(and|&|\/)\s*winter|fall\s*(and|&|\/)\s*winter|autumn|winter)\b/gi, 'All Season').replace(/(All Season\s*)+/g, 'All Season ');
    t = stripWords(t, removeList);
    t = stripWords(t, cfg.gender === 'men' ? femaleList : maleList);
    t = t.replace(/加大码|大码|尺码|码数|[SMLX\d]+码/g, '');
    t = t.replace(/\b(plus[\s-]?size|big\s*(and|&)\s*tall|sizes?)\b/gi, '');
    t = t.replace(/\b(XXS|XS|S|M|L|XL|XXL|XXXL|[2-6]XL|[2-6]X)\b/g, '');
    t = t.replace(/\(\s*\)|（\s*）|\[\s*\]/g, '').replace(/(^|\s)[-–\/,，、|+&]+(?=\s|$)/g, '$1');
    return t.replace(/\s{2,}/g, ' ').replace(/^[\s,，、|\/-]+|[\s,，、|\/-]+$/g, '').trim();
  }

  // ---------- page parsing ----------
  function parseNum(m) {
    var n = parseFloat(m[1].replace(/,(?=\d{3}\b)/g, '').replace(',', '.'));
    return isFinite(n) ? Math.round(n * (MULT[String(m[2] || '').toLowerCase()] || 1)) : null;
  }
  // Sales first; platforms that hide sales (Etsy / Amazon / SHEIN) fall back to the review count.
  // Prices like "$13.48 已售 371件" must not be read as the sales count.
  function stripPrices(text) {
    return String(text || '')
      .replace(/(?:US\$|C\$|A\$|S\$|MX\$|R\$|NZ\$|HK\$|Rp|RM|₱|฿|₫|[$£€¥￥₩₹])\s*\d[\d.,]*/gi, ' ')
      .replace(/\d[\d.,]*\s*(?:€|zł|lei|kr|円|元|₫|đ)/gi, ' ');
  }
  function parseMetric(text) {
    text = stripPrices(text);
    var groups = [[SALES_RES, '']];
    if (PLAT.metric !== 'sales') groups.push([REVIEW_RES, '评价 ']);
    for (var g = 0; g < groups.length; g++) {
      for (var i = 0; i < groups[g][0].length; i++) {
        var m = text.match(groups[g][0][i]);
        if (!m) continue;
        var n = parseNum(m);
        if (n != null) return { text: groups[g][1] + m[0].replace(/\s+/g, ' ').trim(), count: n };
      }
    }
    return null;
  }
  function isGoodsPage() { return !!PLAT.goods(location.href); }
  function isStorePage() { return !!PLAT.store(location.href); }
  function cleanImage(src) {
    if (!src || src.indexOf('data:') === 0) return null;
    try {
      var u = new URL(src, location.href);
      if (!PLAT.img.test(u.hostname)) return null;
      return PLAT.hi('https://' + u.hostname + u.pathname + u.search);
    } catch (e) { return null; }
  }
  function distinctGoods(el) {
    var ids = {}, n = 0, links = el.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var g = PLAT.goods(links[i].href);
      if (g && !ids[g]) { ids[g] = 1; if (++n > 1) return n; }
    }
    return n;
  }
  function findCard(a, optional) {
    var el = a, best = null;
    for (var i = 0; i < 9 && el && el !== document.body; i++) {
      if (distinctGoods(el) > 1) break;
      if (el.querySelector && el.querySelector('img')) {
        best = el;
        var metric = parseMetric(el.innerText || '');
        if (metric) return { el: el, metric: metric };
      }
      el = el.parentElement;
    }
    return optional && best ? { el: best, metric: null } : null;
  }
  function pickImage(card) {
    var imgs = card.querySelectorAll('img'), best = null, bestArea = 0;
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var src = cleanImage(img.currentSrc || img.src || img.getAttribute('data-src'));
      if (!src) continue;
      var area = (img.naturalWidth || img.width || 1) * (img.naturalHeight || img.height || 1);
      if (area > bestArea) { bestArea = area; best = { src: src, alt: img.alt || '' }; }
    }
    return best;
  }
  function extract(optional) {
    var anchors = document.querySelectorAll('a[href]'), seen = {}, out = [];
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i], id = PLAT.goods(a.href);
      if (!id || seen[id]) continue;
      var found = findCard(a, optional);
      if (!found) continue;
      seen[id] = 1;
      var card = found.el, img = pickImage(card);
      if (!img) continue;
      var head = card.querySelector('h2, h3, [title]');
      var lines = (card.innerText || '').split('\n').filter(function (l) { return l.trim().length > 8; });
      var title = ((img.alt.length > 8 ? img.alt : '') || (head && (head.getAttribute('title') || head.innerText)) || a.getAttribute('title') || a.getAttribute('aria-label') || lines[0] || PNAMES[PKEY]);
      title = String(title).replace(/\s+/g, ' ').trim().slice(0, 200);
      var u = new URL(a.href, location.href);
      out.push({
        goodsId: id, key: PKEY === 'temu' ? id : PKEY + '_' + id, title: title, el: card,
        productUrl: 'https://' + u.hostname + u.pathname, imageUrl: img.src,
        salesText: found.metric ? found.metric.text : '无销量数据', salesCount: found.metric ? found.metric.count : 0, noMetric: !found.metric
      });
    }
    return out;
  }
  function findStoreLink() {
    var anchors = document.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var id = PLAT.store(anchors[i].href);
      if (id) return { storeId: id, url: PLAT.storeUrl ? PLAT.storeUrl(id) : anchors[i].href };
    }
    var g = PLAT.goods(location.href);
    return PLAT.storeFromGoods && g ? PLAT.storeFromGoods(g) : null;
  }

  // ---------- network ----------
  function gmRequest(opts) {
    return new Promise(function (resolve, reject) {
      GM_xmlhttpRequest(Object.assign({ timeout: 90000 }, opts, {
        onload: resolve,
        onerror: function () { reject(new Error('网络错误')); },
        ontimeout: function () { reject(new Error('请求超时')); }
      }));
    });
  }
  // ---------- hand-off to the 灵图卖家辅助工具 Chrome extension ----------
  // The extension injects a 「采集并同步 (Alt+1)」 button into each product card on hover.
  var LT_BTN_RE = /采集并同步|采集\s*[（(]\s*Alt\s*\+\s*1/i;
  function walkAll(root, fn) {
    var stack = [root];
    while (stack.length) {
      var node = stack.pop();
      if (!node) continue;
      if (node.nodeType === 1) { if (fn(node) === false) return; if (node.shadowRoot) stack.push(node.shadowRoot); }
      for (var c = node.lastElementChild; c; c = c.previousElementSibling) stack.push(c);
    }
  }
  function isLtButton(el) {
    if (el === host || host.contains(el)) return false;
    var t = (el.textContent || '').trim();
    if (t.length > 30 || !LT_BTN_RE.test(t)) return false;
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) if (LT_BTN_RE.test(c.textContent || '')) return false;
    return true;
  }
  function overlaps(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
  function findLtButton(card) {
    var hit = null;
    walkAll(card, function (el) { if (isLtButton(el)) { hit = el; return false; } });
    if (hit) return hit;
    var rect = card.getBoundingClientRect();
    walkAll(document.documentElement, function (el) {
      if (!isLtButton(el)) return;
      var r = el.getBoundingClientRect();
      if (r.width && overlaps(r, rect)) { hit = el; return false; }
    });
    return hit;
  }
  // Tampermonkey's sandbox can hand the page a proxied window, which makes UIEvent constructors throw.
  // Try the page's own constructors, then the sandbox ones, then a plain Event, so dispatching never fails.
  function makeEvent(kind, type, opts, el) {
    var wins = [];
    try { if (typeof unsafeWindow !== 'undefined') wins.push(unsafeWindow); } catch (e) {}
    try { if (el && el.ownerDocument && el.ownerDocument.defaultView) wins.push(el.ownerDocument.defaultView); } catch (e) {}
    wins.push(null);
    for (var i = 0; i < wins.length; i++) {
      try {
        var C = wins[i] ? wins[i][kind] : (typeof self !== 'undefined' ? self[kind] : null);
        if (typeof C === 'function') return new C(type, opts);
      } catch (e) {}
    }
    try { return new Event(type, { bubbles: true, cancelable: true, composed: true }); } catch (e) { return null; }
  }
  function dispatch(el, ev) { try { if (el && ev) el.dispatchEvent(ev); } catch (e) {} }
  function fire(el, types, x, y) {
    types.forEach(function (type) {
      var opts = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y };
      var kind = /^pointer/.test(type) ? 'PointerEvent' : 'MouseEvent';
      var ev = makeEvent(kind, type, opts, el);
      if (!ev && kind === 'PointerEvent') ev = makeEvent('MouseEvent', type.replace(/^pointer/, 'mouse'), opts, el);
      dispatch(el, ev);
    });
    if (types.indexOf('click') >= 0 && typeof el.click === 'function') { try { el.click(); } catch (e) {} }
  }
  function hover(el) {
    var r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 3;
    var targets = [el].concat(Array.prototype.slice.call(el.querySelectorAll('img')).slice(0, 2));
    targets.forEach(function (t) { fire(t, ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointermove', 'mousemove'], x, y); });
  }
  function pressAlt1(target) {
    ['keydown', 'keyup'].forEach(function (type) {
      [target, document.body, document].forEach(function (t) {
        if (t) dispatch(t, makeEvent('KeyboardEvent', type, { key: '1', code: 'Digit1', keyCode: 49, which: 49, altKey: true, bubbles: true, cancelable: true, composed: true }, target));
      });
    });
  }
  function liveCard(item) {
    if (item.el && item.el.isConnected) return item.el;
    var anchors = document.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      if (PLAT.goods(anchors[i].href) !== item.goodsId) continue;
      var f = findCard(anchors[i], true);
      if (f) return (item.el = f.el);
    }
    return null;
  }
  function markCard(el, kind, text) {
    if (!el) return;
    var color = { ok: '#1f9d55', bad: '#d93a2b', warn: '#d98a00' }[kind];
    el.style.outline = '3px solid ' + color;
    el.style.outlineOffset = '-3px';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var tag = el.querySelector(':scope > [data-collector-tag]');
    if (!tag) {
      tag = document.createElement('div');
      tag.setAttribute('data-collector-tag', '');
      el.appendChild(tag);
    }
    tag.setAttribute('style', 'position:absolute;left:4px;bottom:4px;right:4px;z-index:5;padding:3px 6px;border-radius:4px;font:12px/1.4 system-ui,"Microsoft YaHei",sans-serif;color:#fff;pointer-events:none;background:' + color);
    tag.textContent = text;
  }
  var handoffLock = Promise.resolve();
  function handoff(item) {
    var run = handoffLock.then(async function () {
      var card = liveCard(item);
      if (!card) return { ok: false, note: '卡片已不在页面上' };
      if (cfg.handoff === 'mark') { markCard(card, 'ok', '审核通过，鼠标移上去按 Alt+1'); return { ok: true, note: '已标记，待手动 Alt+1' }; }
      card.scrollIntoView({ block: 'center', behavior: 'instant' });
      await sleep(400);
      if (cfg.handoff === 'alt1') {
        for (var h = 0; h < 3; h++) { hover(card); await sleep(250); }
        pressAlt1(card);
        markCard(card, 'ok', '已按 Alt+1 采集并同步');
        await sleep(cfg.clickGap * 1000 + Math.random() * 800);
        return { ok: true, note: '已发送 Alt+1 采集并同步' };
      }
      var btn = null;
      for (var t = 0; t < 8 && !btn; t++) { hover(card); await sleep(300); btn = findLtButton(card); }
      if (btn) {
        var r = btn.getBoundingClientRect();
        fire(btn, ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'], r.left + r.width / 2, r.top + r.height / 2);
        markCard(card, 'ok', '已交给灵图采集并同步');
        await sleep(cfg.clickGap * 1000 + Math.random() * 800);
        return { ok: true, note: '已点击灵图「采集并同步」' };
      }
      hover(card);
      pressAlt1(card);
      markCard(card, 'warn', '没找到灵图按钮，已试 Alt+1，请确认');
      await sleep(cfg.clickGap * 1000);
      return { ok: true, note: '没找到灵图按钮，已发送 Alt+1，请到灵图核对' };
    });
    handoffLock = run.catch(function () {});
    return run;
  }

  async function doubao(content) {
    if (!cfg.arkKey) throw new Error('请先在「豆包/同步」里填写豆包 API Key');
    var r = await gmRequest({
      method: 'POST', url: ARK_URL,
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + cfg.arkKey },
      data: JSON.stringify({ model: cfg.arkModel, temperature: 0.1, messages: [{ role: 'user', content: content }] })
    });
    var json = null;
    try { json = JSON.parse(r.responseText); } catch (e) {}
    if (r.status >= 400 || !json || !json.choices) throw new Error('豆包接口出错：' + ((json && json.error && json.error.message) || ('HTTP ' + r.status)));
    var text = json.choices[0].message.content || '';
    var m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('豆包没有返回 JSON');
    return JSON.parse(m[0]);
  }

  function download(url, name) {
    return new Promise(function (resolve, reject) {
      GM_download({ url: url, name: name, saveAs: false, onload: resolve, onerror: function (e) { reject(new Error('下载失败：' + (e && e.error || ''))); }, ontimeout: function () { reject(new Error('下载超时')); } });
    });
  }
  function downloadText(text, name) {
    var url = URL.createObjectURL(new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' }));
    return download(url, name).finally(function () { URL.revokeObjectURL(url); });
  }
  function extOf(url, fallback) { return (url.split('?')[0].match(/\.(png|jpe?g|webp|psd)$/i) || [0, fallback])[1]; }

  // ---------- checks ----------
  // Share of near-black pixels in the torso area. Low = not a black shirt, or the print covers most of it.
  async function darkRatio(url) {
    var r = await gmRequest({ method: 'GET', url: url, responseType: 'blob' });
    if (r.status >= 400) throw new Error('图片 HTTP ' + r.status);
    var bmp = await createImageBitmap(r.response);
    var W = 160, H = 160, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var g = cv.getContext('2d');
    g.drawImage(bmp, 0, 0, W, H);
    var d = g.getImageData(Math.round(W * 0.22), Math.round(H * 0.28), Math.round(W * 0.56), Math.round(H * 0.54)).data;
    var dark = 0, n = 0;
    for (var i = 0; i < d.length; i += 4) {
      var mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
      n++;
      if (mx < 75 && mx - mn < 45) dark++;
    }
    return dark / n;
  }
  async function aiCheck(item) {
    var prompt = '你是跨境电商服装上架审核员，要判断能否采集这件 T 恤的印花图案。商品标题：' + item.title +
      '\n请根据标题' + (cfg.aiVision ? '和图片' : '') + '判断，���返回 JSON：{"violation":是否涉及毒品/大麻/色情/暴力/仇恨等违规内容,"ipRisk":是否是迪士尼/三丽鸥/动漫/游戏/影视等知名 IP 或品牌,"doubleSided":是否前后双面印花,"fullPrint":是否满身印花或图案特别满,"notBlack":衣服主体是否不是黑色,"reason":"一句话中文原因"}，布尔值用 true/false。';
    var content = cfg.aiVision
      ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: item.imageUrl } }]
      : prompt;
    var r = await doubao(content);
    var bad = r.violation ? '违规内容' : r.ipRisk ? 'IP/品牌侵权风险' : null;
    if (!bad && cfg.aiVision) bad = r.doubleSided ? '双面印花' : r.fullPrint ? '印花太满' : (cfg.blackOnly && r.notBlack) ? '不是黑色' : null;
    return bad ? bad + (r.reason ? '：' + r.reason : '') : null;
  }

  // ---------- pipeline ----------
  function markDone(item) { done.add(item.key); GM_setValue('done', Array.from(done)); }
  function markSkipped(item, reason) {
    markDone(item);
    records.push({ status: '跳过', reason: reason, country: siteLabel(item.ctx.country), source: item.ctx.source, goodsId: item.goodsId, title: item.title, sales: item.salesText, salesCount: item.salesCount, productUrl: item.productUrl, imageUrl: item.imageUrl, time: new Date().toISOString() });
    GM_setValue('records', records);
    stats.skipped++;
    log('跳过 ' + item.goodsId + '：' + reason);
    markCard(liveCard(item), 'bad', '不采：' + reason.slice(0, 40));
  }
  async function processItem(item) {
    var ctx = item.ctx;
    if (cfg.blackOnly && cfg.pixelCheck) {
      try {
        var ratio = await darkRatio(item.imageUrl);
        if (ratio < cfg.darkMin / 100) { markSkipped(item, '非黑色或印花太满（黑色占比 ' + Math.round(ratio * 100) + '%）'); return false; }
      } catch (e) { log('颜色检测失败，继续：' + e.message, true); }
    }
    if (cfg.aiCheck) {
      var bad = await aiCheck(item);
      if (bad) { markSkipped(item, '豆包：' + bad); return false; }
    }

    var clean = cleanTitle(item.title), files = [];
    if (cfg.saveOriginal) {
      var base = '爆款图案/' + safe(siteLabel(ctx.country)) + '_' + safe(ctx.label) + '_' + today() + '/' + item.salesCount + '_' + safe(item.goodsId);
      await download(item.imageUrl, base + '_原图.' + extOf(item.imageUrl, 'jpg'));
      await downloadText(['平台站点：' + siteLabel(ctx.country), '原标题：' + item.title, '清洗后标题：' + clean, '销量：' + item.salesText, '链接：' + item.productUrl].join('\n'), base + '_标题.txt');
      files.push(base + '_原图', base + '_标题.txt');
    }

    var res = await handoff(item);
    if (!res.ok) { stats.failed++; log('交给灵图失败 ' + item.goodsId + '：' + res.note, true); return false; }
    markDone(item);
    records.push({ status: cfg.handoff === 'mark' ? '已标记' : '已采集并同步', reason: res.note, country: siteLabel(ctx.country), source: ctx.source, goodsId: item.goodsId, title: item.title, cleanTitle: clean, sales: item.salesText, salesCount: item.salesCount, productUrl: item.productUrl, imageUrl: item.imageUrl, files: files.join(' | '), time: new Date().toISOString() });
    GM_setValue('records', records);
    return true;
  }

  async function worker() {
    working++;
    while (queue.length) {
      var item = queue.shift();
      try {
        if (await processItem(item)) { stats.saved++; item.ctx.saved++; log('已保存 ' + item.goodsId + '（' + item.salesText + '）'); }
      } catch (e) {
        stats.failed++;
        log('失败 ' + item.goodsId + '：' + e.message, true);
        if (/请先|豆包接口/.test(e.message)) { queue.length = 0; pause(); }
      }
      render();
    }
    working--;
    render();
  }
  function fill(ctx) {
    while (ctx.backlog.length && pending() < 3 && ctx.saved + pending() < ctx.target) {
      queue.push(ctx.backlog.shift());
      if (working < 2) worker();
    }
  }
  function scan(ctx) {
    var all = extract(ctx.optional), fresh = 0;
    stats.found = Math.max(stats.found, all.length);
    all.forEach(function (x) {
      if (ctx.seen.has(x.goodsId)) return;
      ctx.seen.add(x.goodsId);
      fresh++;
      if (!x.noMetric) ctx.maxSales = Math.max(ctx.maxSales || 0, x.salesCount);
      if (!x.noMetric && x.salesCount < cfg.minSales) {
        stats.skipped++;
        ctx.lowSales = (ctx.lowSales || 0) + 1;
        markCard(x.el, 'warn', '不采：' + x.salesText + '，低于最低销量 ' + cfg.minSales);
        return;
      }
      var hit = findHit(x.title, skipList);
      if (hit) { stats.skipped++; log('跳过 ' + x.goodsId + '：标题含「' + hit + '」'); markCard(x.el, 'bad', '不采：标题含「' + hit + '」'); return; }
      if (cfg.blackOnly && !cfg.pixelCheck && !BLACK_RE.test(x.title)) return;
      x.ctx = ctx;
      x.black = BLACK_RE.test(x.title);
      ctx.candidates.push(x);
      stats.candidates++;
      if (!done.has(x.key)) ctx.backlog.push(x);
    });
    ctx.backlog.sort(function (a, b) { return (b.black - a.black) || (b.salesCount - a.salesCount); });
    render();
    return fresh;
  }
  function visible(el) { return el.offsetParent !== null && !el.disabled && el.getAttribute('aria-disabled') !== 'true'; }
  function findMore() {
    var els = document.querySelectorAll('button, [role="button"], a, div, span');
    var best = null, bestBottom = -Infinity;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el === host || host.contains(el)) continue;
      var t = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!t || t.length > 24 || !MORE_RE.test(t)) continue;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      var bottom = r.bottom + window.scrollY;
      // Same button: keep the innermost match; otherwise prefer the one lowest on the page (the list's own "see more").
      if (best && best.contains(el)) { best = el; bestBottom = bottom; continue; }
      if (bottom > bestBottom) { best = el; bestBottom = bottom; }
    }
    return best;
  }
  function productCount() { return document.querySelectorAll('a[href]').length + document.querySelectorAll('img').length; }
  async function clickMore() {
    var hit = findMore();
    if (!hit) return false;
    var btn = hit.closest('button, [role="button"], a') || hit;
    var before = productCount();
    for (var attempt = 0; attempt < 3; attempt++) {
      try { btn.scrollIntoView({ block: 'center' }); } catch (e) {}
      await sleep(600 + Math.random() * 400);
      var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var target = document.elementFromPoint(x, y) || hit;
      if (host.contains(target)) target = hit;
      fire(target, ['pointerover', 'mouseover', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'], x, y);
      if (target !== btn && typeof btn.click === 'function') { try { btn.click(); } catch (e) {} }
      log('点击「查看更多」加载下一批' + (attempt ? '（第 ' + (attempt + 1) + ' 次尝试）' : ''));
      var grew = await waitFor(function () { return productCount() > before; }, 6000);
      if (grew) { await sleep(1200); return true; }
      hit = findMore();
      if (!hit) return productCount() > before;
      btn = hit.closest('button, [role="button"], a') || hit;
    }
    log('「查看更多」点了 3 次没加载出新商品，可能已到底');
    return false;
  }
  function clickNext() {
    var els = document.querySelectorAll(NEXT_SEL);
    for (var i = 0; i < els.length; i++) if (visible(els[i])) { els[i].click(); return true; }
    return false;
  }
  async function collectPage(ctx) {
    var idle = 0, t = ctx.task;
    while (running && ctx.saved < ctx.target) {
      fill(ctx);
      if (ctx.backlog.length) { await sleep(800); continue; }
      if (idle >= 6) {
        if (pending()) { await sleep(800); continue; }
        if (await clickMore()) { idle = 0; continue; }
        // Paginated sites: go to the next page. Full reloads resume from t.page / t.carry; SPA pages just keep scanning.
        if ((t.page || 0) < cfg.maxPages - 1 && clickNext()) {
          t.page = (t.page || 0) + 1; t.carry = ctx.saved; setJob(ctx.job);
          log('翻到第 ' + (t.page + 1) + ' 页');
          idle = 0;
          await sleep(3500 + Math.random() * 1500);
          continue;
        }
        break;
      }
      if (scan(ctx) > 0) { idle = 0; continue; }
      if (pending()) { await sleep(800); continue; }
      if (findMore() && await clickMore()) { idle = 0; continue; }
      idle++;
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      await sleep(1800 + Math.random() * 1500);
    }
    if (!running) queue.length = 0;
    while (pending()) await sleep(800);
    if (ctx.lowSales) log(ctx.lowSales + ' 个商品销量低于 ' + cfg.minSales + '，没采（本页最高销量 ' + (ctx.maxSales || 0) + '）。想多采可以到「过滤」把「最低销量」调低', !ctx.saved);
    log(ctx.source + '完成：本次保存 ' + ctx.saved + ' 个' + (ctx.saved < ctx.target ? '（没有更多达标商品）' : ''));
  }

  // ---------- multi-page job (survives page navigation, across platforms) ----------
  var JOB_VERSION = 4;
  function getJob() { return GM_getValue('job', null); }
  function setJob(j) { GM_setValue('job', j); }
  function taskLabel(t) {
    if (t.type === 'search') return siteLabel(siteBy(t.site)) + ' 搜索「' + t.keyword + '」';
    if (t.type === 'goods') return PNAMES[siteBy(t.site).p] + ' 商品 ' + t.goodsId + ' → 找店铺';
    if (t.type === 'store') return PNAMES[siteBy(t.site).p] + ' 店铺 ' + t.storeId;
    return '当前页';
  }
  function taskUrl(t) { return t.type === 'search' ? searchUrl(t.site, t.keyword) : t.url; }
  function onTaskPage(t) {
    if (t.type === 'here') return location.pathname === t.path;
    if (siteBy(t.site).p !== PKEY) return false;
    if (t.type === 'search') return currentSite().id === t.site && PLAT.isSearch() && (!!t.navigated || hrefHas(t.keyword));
    if (t.type === 'goods') return PLAT.goods(location.href) === t.goodsId;
    // Some stores (e.g. Shopee /shop/123) redirect to a vanity URL, so accept any non-search, non-product page after navigating.
    if (t.type === 'store') return PLAT.store(location.href) === t.storeId || (!!t.navigated && !PLAT.isSearch() && !PLAT.goods(location.href));
    return false;
  }
  async function waitFor(fn, ms) {
    for (var t = 0; t < ms; t += 500) { if (fn()) return true; await sleep(500); }
    return false;
  }
  async function runTask(t, job) {
    if (t.type === 'goods') {
      await waitFor(findStoreLink, 15000);
      var link = findStoreLink();
      if (!link) { log('商品 ' + t.goodsId + ' 没找到店铺入口', true); return; }
      var sk = PKEY + ':' + link.storeId;
      if (job.visitedStores.indexOf(sk) >= 0) { log('店铺 ' + link.storeId + ' 已采过，跳过'); return; }
      job.visitedStores.push(sk);
      job.tasks.splice(job.idx + 1, 0, { type: 'store', site: t.site, storeId: link.storeId, url: link.url });
      return;
    }
    var optional = PLAT.metric === 'optional' || t.type === 'store';
    if (!(await waitFor(function () { return extract(optional).length > 0; }, 15000))) {
      t.empty = (t.empty || 0) + 1;
      if (t.empty === 1) { log('「' + taskLabel(t) + '」没识别到商品：可能要先登录，或出现了验证码。在页面上处理好后点「继续」', true); running = false; return; }
      log('仍然没识别到商品，跳过「' + taskLabel(t) + '」', true);
      return;
    }
    var site = t.site ? siteBy(t.site) : currentSite();
    var ctx = {
      country: site, task: t, job: job, optional: optional,
      saved: t.carry || 0, backlog: [], seen: new Set(), candidates: [],
      target: t.type === 'store' ? cfg.storeTarget : cfg.target,
      source: t.type === 'store' ? '店铺' + t.storeId : t.type === 'search' ? siteLabel(site) + '搜索' : '当前页',
      label: t.type === 'search' ? t.keyword : t.type === 'store' ? '店铺' + t.storeId : (PLAT.isSearch() ? '搜索页' : '当前页')
    };
    await collectPage(ctx);
    if (!running || t.type !== 'search' || !cfg.enterStore) return;
    var picks = ctx.candidates.slice().sort(function (a, b) { return (b.black - a.black) || (b.salesCount - a.salesCount); })
      .filter(function (x) { return job.visitedGoods.indexOf(x.key) < 0; }).slice(0, cfg.storeCount);
    var added = 0;
    picks.forEach(function (x) {
      job.visitedGoods.push(x.key);
      var task;
      if (PLAT.storeFromGoods) {
        var st = PLAT.storeFromGoods(x.goodsId), key = PKEY + ':' + st.storeId;
        if (job.visitedStores.indexOf(key) >= 0) return;
        job.visitedStores.push(key);
        task = { type: 'store', site: t.site, storeId: st.storeId, url: st.url };
      } else {
        task = { type: 'goods', site: t.site, goodsId: x.goodsId, url: x.productUrl };
      }
      job.tasks.splice(job.idx + 1 + added, 0, task);
      added++;
    });
    if (added) log('将进入 ' + added + ' 个高销量商品的店铺继续采集');
  }
  async function runJob() {
    var job = getJob();
    if (job && job.v !== JOB_VERSION) { setJob(null); job = null; }
    if (!job || job.paused) { render(); return; }
    running = true; render();
    while (job.idx < job.tasks.length) {
      var t = job.tasks[job.idx];
      if (!onTaskPage(t)) {
        t.tries = (t.tries || 0) + 1;
        if (t.tries > 3) { log('打不开「' + taskLabel(t) + '」，跳过', true); job.idx++; setJob(job); continue; }
        t.navigated = true; setJob(job);
        log('前往：' + taskLabel(t));
        await sleep(1500 + Math.random() * 1500);
        location.href = taskUrl(t);
        return;
      }
      if (PKEY === 'temu' && t.site) {
        await sleep(2000);
        var wrong = temuRegionMismatch(t.site);
        if (wrong) {
          var realName = siteBy('temu-' + wrong).name, wantName = siteBy(t.site).name;
          job.paused = true; t.tries = 0; t.navigated = false; setJob(job); running = false;
          log('当前 Temu 实际是「' + realName + '」站，不是你选的「' + wantName + '」。Temu 的国家记在账号/浏览器里，脚本改不了网址切换。请点页面顶部语言旁的「更改国家/地区」→ 选「' + wantName + '」，切好后点面板「继续」', true);
          render();
          return;
        }
      }
      log('开始：' + taskLabel(t) + '（' + (job.idx + 1) + '/' + job.tasks.length + '）');
      await runTask(t, job);
      if (!running) { job.paused = true; setJob(job); render(); return; }
      job.idx++; setJob(job); render();
    }
    setJob(null); running = false;
    log('全部任务完成，可以导出 CSV');
    render();
  }
  function startJob(tasks) {
    setJob({ v: JOB_VERSION, tasks: tasks, idx: 0, paused: false, visitedGoods: [], visitedStores: [] });
    runJob();
  }
  function pause() { running = false; var j = getJob(); if (j) { j.paused = true; setJob(j); } render(); }

  async function recommendSites() {
    var list = SITES.map(function (s) { return s.id + '=' + siteLabel(s); }).join('，');
    log('正在问豆包哪些平台和国家黑色印花 T 恤卖得好…');
    var r = await doubao('我做跨境电商，卖' + (cfg.gender === 'men' ? '男士' : '女士') + '黑色印花短袖 T 恤，想去销量高的平台和国家站点采集爆款图案��请从这些站点里推荐 5-8 个黑色印花 T 恤需求最大的：' + list + '。只返回 JSON：{"sites":["站点代码"],"reason":"一句话中文原因"}');
    var ids = (r.sites || r.countries || []).map(function (x) { return String(x).toLowerCase(); });
    SITES.forEach(function (s) { cfg.sites[s.id].on = ids.indexOf(s.id) >= 0; });
    if (!ids.some(function (id) { return cfg.sites[id]; })) cfg.sites['temu-us'].on = true;
    save(); syncSites();
    log('豆包推荐：' + ids.filter(function (id) { return cfg.sites[id]; }).map(function (id) { return siteLabel(siteBy(id)); }).join('、') + (r.reason ? '。' + r.reason : ''));
  }
  function exportCsv() {
    var cols = ['status', 'reason', 'country', 'source', 'goodsId', 'title', 'cleanTitle', 'sales', 'salesCount', 'productUrl', 'imageUrl', 'files', 'time'];
    var head = ['状态', '原因/备注', '平台站点', '来源', '商品ID', '原标题', '清洗后标题', '销量', '销量数值', '商品链接', '图片链接', '文件', '时间'];
    var rows = [head.join(',')].concat(records.map(function (r) { return cols.map(function (k) { return '"' + String(r[k] == null ? '' : r[k]).replace(/"/g, '""') + '"'; }).join(','); }));
    var url = URL.createObjectURL(new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv' }));
    GM_download({ url: url, name: '爆款图案/采集记录_' + today() + '.csv', saveAs: false, onload: function () { URL.revokeObjectURL(url); } });
  }

  // ---------- panel ----------
  var C = { bg: '#161616', panel: '#202020', line: '#343434', text: '#f1f1ec', dim: '#a3a39c', blue: '#2f55e4', red: '#ff7a6b' };
  var inputCss = 'width:100%;box-sizing:border-box;padding:5px 7px;border-radius:5px;border:1px solid ' + C.line + ';background:' + C.panel + ';color:inherit;font:inherit';
  var btnCss = 'flex:1;padding:7px;border-radius:6px;border:1px solid ' + C.line + ';background:' + C.panel + ';color:inherit;cursor:pointer;font:inherit';
  var linkCss = 'background:none;border:0;color:' + C.dim + ';cursor:pointer;padding:0;font:inherit;text-decoration:underline';
  function field(label, inner) { return '<label style="display:block;flex:1;margin-bottom:6px">' + label + inner + '</label>'; }
  function input(k, attrs) { return '<input data-k="' + k + '" ' + (attrs || '') + ' style="' + inputCss + '">'; }
  function check(k, label) { return '<label style="display:flex;gap:6px;align-items:center;margin-bottom:5px"><input data-k="' + k + '" type="checkbox">' + label + '</label>'; }
  function row(a, b) { return '<div style="display:flex;gap:8px">' + a + b + '</div>'; }
  function tabBtn(k, label) { return '<button data-tab="' + k + '" style="flex:1;padding:5px 0;border:0;border-bottom:2px solid transparent;background:none;color:inherit;cursor:pointer;font:inherit">' + label + '</button>'; }
  function hint(t) { return '<p style="margin:2px 0 8px;font-size:11px;color:' + C.dim + '">' + t + '</p>'; }

  var siteRows = Object.keys(PLATFORMS).map(function (p) {
    var rows = SITES.filter(function (s) { return s.p === p; }).map(function (s) {
      return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:5px"><input type="checkbox" data-c="' + s.id + '" aria-label="' + siteLabel(s) + '"><span style="width:60px;flex:none">' + s.name + '</span><input data-ck="' + s.id + '" aria-label="' + siteLabel(s) + '关键词" style="' + inputCss + '"></div>';
    }).join('');
    return '<details data-plat="' + p + '" style="margin-bottom:6px;border-bottom:1px solid ' + C.line + ';padding-bottom:4px"><summary style="cursor:pointer;padding:3px 0"><strong>' + PNAMES[p] + '</strong> <span data-pc="' + p + '" style="font-size:11px;color:' + C.dim + '"></span></summary><div style="padding-top:4px">' + rows + '</div></details>';
  }).join('');

  var host = document.createElement('div');
  host.setAttribute('style', 'position:fixed;right:20px;bottom:20px;z-index:2147483647;width:350px;background:' + C.bg + ';color:' + C.text + ';font:13px/1.5 system-ui,"PingFang SC","Microsoft YaHei",sans-serif;border-radius:10px;box-shadow:0 14px 36px rgba(0,0,0,.4);padding:14px');
  host.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><strong style="font-size:14px">爆款图案采集 → 灵图 · ' + PNAMES[PKEY] + '</strong>' +
      '<button data-k="min" aria-label="收起" style="background:none;border:0;color:' + C.dim + ';cursor:pointer;font-size:16px">–</button></div>' +
    '<div data-k="body">' +
      '<div style="display:flex;margin-bottom:10px;border-bottom:1px solid ' + C.line + '">' + tabBtn('main', '采集') + tabBtn('country', '平台/站点') + tabBtn('filter', '过滤') + tabBtn('api', '豆包/同步') + '</div>' +
      '<div style="max-height:52vh;overflow:auto;padding-right:2px">' +
        '<div data-pane="main">' +
          row(field('最低销量/评价数', input('minSales', 'type="number" min="1"')), field('每次搜索采集', input('target', 'type="number" min="1"'))) +
          row(field('卖', '<select data-k="gender" style="' + inputCss + '"><option value="men">男装</option><option value="women">女装</option></select>'), field('进店数量', input('storeCount', 'type="number" min="0"'))) +
          row(field('每家店采集', input('storeTarget', 'type="number" min="1"')), field('最多翻页', input('maxPages', 'type="number" min="1"'))) +
          check('blackOnly', '只要黑色款（同一色系）') +
          check('enterStore', '高销量商品自动进店铺继续采集') +
          hint('Etsy / Amazon 卡片不显示销量，用评价数代替；SHEIN 没有销量也没有评价时照样采，按黑色优先排序。') +
        '</div>' +
        '<div data-pane="country" style="display:none">' +
          hint('勾选要采集的平台和国家站点，会按顺序逐个搜索，跨平台也会自动跳转。请先在这个浏览器里手动登录这些网站。关键词可改。') + siteRows +
          '<button data-k="recommend" style="' + btnCss + ';width:100%;margin-top:4px">问豆包：黑 T 在哪些平台/国家卖得多</button>' +
        '</div>' +
        '<div data-pane="filter" style="display:none">' +
          check('pixelCheck', '检测图片：非黑色 / 印花太满的不要') +
          field('黑色占比下限 %', input('darkMin', 'type="number" min="5" max="95"')) +
          field('跳过词（标题出现就不采）', '<textarea data-k="skipWords" rows="5" style="' + inputCss + ';resize:vertical"></textarea>') +
          field('标题删除词（上架标题里去掉）', '<textarea data-k="removeWords" rows="5" style="' + inputCss + ';resize:vertical"></textarea>') +
          hint('另外会自动：删除所有尺码；秋季/冬季/秋冬 → 四季；卖男装删女性词，卖女装删男性词。') +
          '<button data-k="resetWords" style="' + linkCss + '">恢复默认词库</button>' +
        '</div>' +
        '<div data-pane="api" style="display:none">' +
          '<div style="margin-bottom:6px"><strong>豆包审核</strong></div>' +
          field('豆包 API Key（火山方舟）', input('arkKey', 'type="password"')) +
          field('模型 / 接入点 ID', input('arkModel')) +
          check('aiCheck', '用豆包审核每个商品（违规 / IP 侵权）') +
          check('aiVision', '审核时看图（双面 / 满印 / 颜色）') +
          '<div style="border-top:1px solid ' + C.line + ';margin:8px 0;padding-top:8px"><strong>采集同步（灵图插件 Alt+1）</strong></div>' +
          field('审核通过后', '<select data-k="handoff" style="' + inputCss + '"><option value="alt1">自动按 Alt+1 采集并同步（推荐）</option><option value="click">自动点「采集并同步」按钮</option><option value="mark">只标绿框，我自己按 Alt+1</option></select>') +
          field('每次采集间隔（秒）', input('clickGap', 'type="number" min="1" max="30"')) +
          hint('不再使用灵图 API。如果 Alt+1 没反应，改选「自动点按钮」。') +
          check('saveOriginal', '同时把原图和标题保存到电脑') +
          '<button data-k="clear" style="' + linkCss + ';margin-top:6px">清空已采集记录（允许重复采集）</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;margin:10px 0 6px"><button data-k="start" style="' + btnCss + ';border:0;background:' + C.blue + ';color:#fff">开始多站点采集</button>' +
        '<button data-k="here" style="' + btnCss + '">只采当前页</button></div>' +
      '<div style="display:flex;gap:6px;margin-bottom:6px"><button data-k="store" style="' + btnCss + ';display:none">进入本店采集</button>' +
        '<button data-k="pause" style="' + btnCss + '">暂停</button><button data-k="end" style="' + btnCss + '">结束任务</button><button data-k="csv" style="' + btnCss + '">导出 CSV</button></div>' +
      '<div data-k="job" style="font-size:12px;color:' + C.dim + '"></div>' +
      '<div data-k="stats" style="margin-top:4px;font-family:ui-monospace,monospace;font-size:12px;color:' + C.dim + '"></div>' +
      '<div data-k="log" style="margin-top:6px;max-height:110px;overflow:auto;font-family:ui-monospace,monospace;font-size:11px;color:' + C.dim + '"></div>' +
    '</div>';
  host.id = 'temu-lingtu-collector-panel';
  // Some sites re-render <body> during hydration and drop foreign nodes, so mount on <html> and re-attach if removed.
  function mountPanel() {
    if (!host.isConnected) (document.documentElement || document.body).appendChild(host);
    host.style.display = '';
  }
  mountPanel();
  setInterval(function () { if (!host.isConnected) mountPanel(); }, 1500);
  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('显示采集面板', function () {
      mountPanel();
      host.style.right = '20px';
      host.style.bottom = '20px';
    });
  }
  function $(k) { return host.querySelector('[data-k="' + k + '"]'); }

  function showTab(k) {
    host.querySelectorAll('[data-pane]').forEach(function (p) { p.style.display = p.getAttribute('data-pane') === k ? '' : 'none'; });
    host.querySelectorAll('[data-tab]').forEach(function (b) { b.style.borderBottomColor = b.getAttribute('data-tab') === k ? C.blue : 'transparent'; });
  }
  host.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { showTab(b.getAttribute('data-tab')); }; });
  showTab(cfg.arkKey || !cfg.aiCheck ? 'main' : 'api');

  function syncCounts() {
    Object.keys(PLATFORMS).forEach(function (p) {
      var n = SITES.filter(function (s) { return s.p === p && cfg.sites[s.id].on; }).length;
      host.querySelector('[data-pc="' + p + '"]').textContent = n ? '已选 ' + n : '';
    });
  }
  function syncSites() {
    SITES.forEach(function (s) {
      host.querySelector('[data-c="' + s.id + '"]').checked = cfg.sites[s.id].on;
      host.querySelector('[data-ck="' + s.id + '"]').value = cfg.sites[s.id].keyword;
    });
    Object.keys(PLATFORMS).forEach(function (p) {
      host.querySelector('[data-plat="' + p + '"]').open = p === PKEY || SITES.some(function (s) { return s.p === p && cfg.sites[s.id].on; });
    });
    syncCounts();
  }
  SITES.forEach(function (s) {
    host.querySelector('[data-c="' + s.id + '"]').onchange = function (e) { cfg.sites[s.id].on = e.target.checked; save(); syncCounts(); };
    host.querySelector('[data-ck="' + s.id + '"]').onchange = function (e) { cfg.sites[s.id].keyword = e.target.value.trim() || s[cfg.gender]; e.target.value = cfg.sites[s.id].keyword; save(); };
  });
  syncSites();

  ['arkKey', 'arkModel', 'skipWords', 'removeWords', 'handoff'].forEach(function (k) {
    $(k).value = cfg[k];
    $(k).onchange = function () { cfg[k] = $(k).value.trim(); save(); if (/Words$/.test(k)) compileRules(); };
  });
  ['minSales', 'target', 'maxPages', 'storeCount', 'storeTarget', 'darkMin', 'clickGap'].forEach(function (k) {
    $(k).value = cfg[k];
    $(k).onchange = function () { var v = parseInt($(k).value, 10); cfg[k] = isFinite(v) && v >= 0 ? v : DEFAULTS[k]; $(k).value = cfg[k]; save(); };
  });
  ['blackOnly', 'pixelCheck', 'enterStore', 'saveOriginal', 'aiCheck', 'aiVision'].forEach(function (k) {
    $(k).checked = !!cfg[k];
    $(k).onchange = function () { cfg[k] = $(k).checked; save(); };
  });
  $('gender').value = cfg.gender;
  $('gender').onchange = function () {
    var prev = cfg.gender;
    cfg.gender = $('gender').value;
    SITES.forEach(function (s) { if (cfg.sites[s.id].keyword === s[prev]) cfg.sites[s.id].keyword = s[cfg.gender]; });
    save(); syncSites();
  };
  $('resetWords').onclick = function () {
    cfg.skipWords = DEFAULT_SKIP.join('，'); cfg.removeWords = DEFAULT_REMOVE.join('，');
    $('skipWords').value = cfg.skipWords; $('removeWords').value = cfg.removeWords;
    save(); compileRules(); log('已恢复默认词库');
  };
  $('min').onclick = function () { var b = $('body'); b.style.display = b.style.display === 'none' ? '' : 'none'; };
  $('clear').onclick = function () { if (confirm('清空后，之前采集过的商品会被重新采集，确定吗？')) { done.clear(); records = []; GM_setValue('done', []); GM_setValue('records', []); log('已清空采集记录'); } };
  $('recommend').onclick = function () { recommendSites().catch(function (e) { log(e.message, true); }); };

  function preflight() {
    if (cfg.aiCheck && !cfg.arkKey) { showTab('api'); log('开了豆包审核，请先填写豆包 API Key', true); return false; }
    return true;
  }
  $('start').onclick = function () {
    if (getJob()) { log('已有任务，点「暂停/继续」或先「结束任务」'); return; }
    if (!preflight()) return;
    var tasks = SITES.filter(function (s) { return cfg.sites[s.id].on; })
      .map(function (s) { return { type: 'search', site: s.id, keyword: cfg.sites[s.id].keyword }; });
    if (!tasks.length) { showTab('country'); log('请至少勾选一个站点', true); return; }
    startJob(tasks);
  };
  $('here').onclick = function () {
    if (getJob()) { log('已有任务，请先「结束任务」'); return; }
    if (!preflight()) return;
    startJob([{ type: 'here', site: currentSite().id, path: location.pathname }]);
  };
  $('store').onclick = function () {
    if (getJob()) { log('已有任务，请先「结���任务」'); return; }
    if (!preflight()) return;
    var link = findStoreLink();
    if (!link) { log('这个页面没找到店铺入口', true); return; }
    startJob([{ type: 'store', site: currentSite().id, storeId: link.storeId, url: link.url }]);
  };
  $('pause').onclick = function () {
    var j = getJob();
    if (!j) return;
    if (running) { pause(); log('已暂停，当前商品处理完就停'); }
    else { j.paused = false; setJob(j); runJob(); }
  };
  $('end').onclick = function () { running = false; queue.length = 0; setJob(null); log('任务已结束'); render(); };
  $('csv').onclick = exportCsv;

  function log(msg, err) {
    var line = document.createElement('div');
    line.textContent = new Date().toTimeString().slice(0, 8) + ' ' + msg;
    if (err) line.style.color = C.red;
    $('log').prepend(line);
    while ($('log').childNodes.length > 80) $('log').lastChild.remove();
  }
  function render() {
    var j = getJob();
    $('pause').textContent = j && !running ? '继续' : '暂停';
    $('pause').disabled = !j;
    $('store').style.display = isGoodsPage() && !j ? '' : 'none';
    $('job').textContent = j ? '任务 ' + Math.min(j.idx + 1, j.tasks.length) + '/' + j.tasks.length + '：' + (j.tasks[j.idx] ? taskLabel(j.tasks[j.idx]) : '收尾') + (j.paused ? '（已暂停）' : '') : '没有进行中的任务';
    $('stats').textContent = siteLabel(currentSite()) + ' · 识别 ' + stats.found + ' · 达标 ' + stats.candidates + ' · 跳过 ' + stats.skipped + ' · 保存 ' + stats.saved + ' · 失败 ' + stats.failed + ' · 排队 ' + pending() + ' · 累计 ' + done.size;
  }

  compileRules();
  render();
  log('就绪 v6.5.0 · 当前站点：' + siteLabel(currentSite()) + (isStorePage() ? '（店铺页）' : isGoodsPage() ? '（商品页）' : ''));
  if (getJob()) setTimeout(runJob, 2500);
})();
`

export function buildUserscript() {
  const body = COLLECTOR_BODY.replace('__SITES__', () => JSON.stringify(SITES))
    .replace('__PNAMES__', () => JSON.stringify(PLATFORM_NAMES))
    .replace('__SKIP__', () => JSON.stringify(DEFAULT_SKIP_WORDS))
    .replace('__REMOVE__', () => JSON.stringify(DEFAULT_REMOVE_WORDS))
  const hosts = new Set(SITES.map((s) => new URL(s.origin).hostname))
  const matches = [
    ...Array.from(hosts, (h) => 'https://' + h + '/*'),
    'https://*.temu.com/*',
    'https://*.shein.com/*',
    'https://*.etsy.com/*',
    'https://*.aliexpress.com/*',
  ]
  return [
    '// ==UserScript==',
    '// @name         Temu 爆款图案采集 → 灵图',
    '// @namespace    temu-lingtu-collector',
    '// @version      6.5.0',
    '// @description  多平台（Temu / SHEIN / Etsy / Amazon / Shopee / Lazada / 速卖通）多国家筛选高销量黑色 T 恤，豆包审核违规/IP/双面/满印，通过的自动点灵图插件「采集并同步」',
    ...matches.map((m) => '// @match        ' + m),
    '// @grant        GM_xmlhttpRequest',
    '// @grant        GM_download',
    '// @grant        GM_getValue',
    '// @grant        GM_setValue',
    '// @grant        GM_registerMenuCommand',
    '// @connect      *',
    '// @run-at       document-idle',
    '// @noframes',
    '// ==/UserScript==',
    '',
    body,
  ].join('\n')
}
