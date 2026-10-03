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
  '亲子', '婴儿', '帽衫', '套衫', '热卖', '限时优惠', '迪士��', '三丽鸥', '怪物猎人', 'monster hunter',
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
      search: function (s, k) { return s.origin + '/' + (s.prefix ? s.prefix + '/' : '') + 'search_result.html?search_key=' + encodeURIComponent(k) + '&search_method=user'; },
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
  var WHITE_RE = /白|white|weiß|weiss|blanc|blanc[ao]s?|bianc[ao]|bianche|bianchi|witte?\b|biał|ホワイト|ขาว|trắng|putih|branc[ao]/i;
  var TO_WHITE = [['schwarzes', 'weißes'], ['schwarze', 'weiße'], ['schwarz', 'weiß'], ['noire', 'blanche'], ['noir', 'blanc'],
    ['negras', 'blancas'], ['negros', 'blancos'], ['negra', 'blanca'], ['negro', 'blanco'], ['nere', 'bianche'], ['neri', 'bianchi'],
    ['nera', 'bianca'], ['nero', 'bianco'], ['pretas', 'brancas'], ['pretos', 'brancos'], ['preta', 'branca'], ['preto', 'branco'],
    ['zwarte', 'witte'], ['zwart', 'wit'], ['czarne', 'białe'], ['czarny', 'biały'], ['czarna', 'biała'], ['hitam', 'putih'],
    ['đen', 'trắng'], ['ดำ', 'ขาว'], ['ブラック', 'ホワイト'], ['黒', '白'], ['黑', '白'], ['black', 'white']];
  var FEMALE_WORDS = ['女装', '女士', '女款', '女式', '女性', '女生', '女', "women's", 'womens', 'women', 'woman', 'ladies', 'lady', 'female', 'damen', 'femme', 'mujer', 'donna', 'feminina', 'wanita', 'レディース'];
  var MALE_WORDS = ['男装', '����士', '男款', '男式', '男性', '男生', '男', "men's", 'mens', 'men', 'man', 'male', 'herren', 'homme', 'hombre', 'uomo', 'masculina', 'pria', 'メンズ'];

  var DEFAULTS = {
    useAi: true, arkKey: '', arkModel: 'doubao-seed-2-0-pro',
    minSales: 20, target: 60, maxPages: 5, blackOnly: true, pixelCheck: true, darkMin: 40, gender: 'men',
    enterStore: false, storeCount: 3, storeTarget: 30,
    handoff: 'alt1', clickGap: 3, saveOriginal: false, aiCheck: true, aiVision: true,
    skipWords: DEFAULT_SKIP.join('，'), removeWords: DEFAULT_REMOVE.join('，'),
    sites: {}, v: 6,
    imgDedupe: true, schedule: '', dailyCap: 0, restEvery: 30, restMin: 3, autoResume: true,
    pushType: 'none', pushKey: '', beep: true, reportTime: '22:00',
    storeMinSales: 500, userFirst: false, colorMode: 'black', blackCount: 30, whiteCount: 30, lightMin: 35,
    myKeywords: '', kwTranslate: true,
    kwRandCount: 10, kwRandColor: 'both', kwAutoRand: false
  };
  var cfg = Object.assign({}, DEFAULTS, GM_getValue('cfg', {}));
  if (!cfg.arkModel || /^doubao-seed-1-6/.test(cfg.arkModel) || /seedance|seedream/i.test(cfg.arkModel)) cfg.arkModel = DEFAULTS.arkModel;
  if ([6, 7, 8, 9].indexOf(cfg.v) < 0) { cfg.v = 6; cfg.aiCheck = true; cfg.saveOriginal = false; cfg.handoff = 'alt1'; }
  if (cfg.v === 6) { cfg.v = 7; if (cfg.minSales === 100) cfg.minSales = DEFAULTS.minSales; }
  if (cfg.v === 7) { cfg.v = 8; cfg.enterStore = false; }
  if (cfg.v === 8) { cfg.v = 9; cfg.enterStore = true; GM_setValue('cfg', cfg); }
  if (['black', 'white', 'rotate'].indexOf(cfg.colorMode) < 0) cfg.colorMode = 'black';
  if (['alt1', 'click', 'mark'].indexOf(cfg.handoff) < 0) cfg.handoff = 'alt1';
  ['apiBase', 'appId', 'secret', 'crop', 'matting', 'dress', 'stanceId', 'backgroundId', 'dressAr', 'dressNum', 'lingtuTitle'].forEach(function (k) { delete cfg[k]; });
  var oldCountries = cfg.countries || {};
  cfg.sites = Object.assign({}, cfg.sites);
  SITES.forEach(function (s) {
    var cur = cfg.sites[s.id] || (s.p === 'temu' ? oldCountries[s.id.slice(5)] : null) || {};
    cfg.sites[s.id] = { on: cur.on != null ? cur.on : s.id === 'temu-us', keyword: cur.keyword || s[cfg.gender] };
  });
  delete cfg.countries;
  if (!String(cfg.myKeywords || '').trim()) cfg.myKeywords = splitKeywords(cfg.sites['temu-us'].keyword || SITES[0][cfg.gender]).join('\n');
  var done = new Set(GM_getValue('done', []));
  var records = GM_getValue('records', []);
  // synced = actually sent to 灵图 (costs 灵豆) and must never be sent again; done also includes reviewed-and-skipped items.
  var synced = new Set(GM_getValue('synced', null) || []);
  if (GM_getValue('synced', null) == null) {
    var skippedIds = {};
    records.forEach(function (r) { if (r.status === '跳过') skippedIds[r.key || r.goodsId] = 1; });
    done.forEach(function (k) { if (!skippedIds[k] && !skippedIds[String(k).replace(/^[a-z]+_/, '')]) synced.add(k); });
    GM_setValue('synced', Array.from(synced));
  }
  var hashes = GM_getValue('hashes', []);
  var lastProgress = Date.now(), waitingHuman = false, resting = false;
  var queue = [], working = 0, running = false;
  var stats = { found: 0, candidates: 0, skipped: 0, saved: 0, failed: 0, dup: 0 };
  var skipList = [], removeList = [], femaleList = [], maleList = [];

  function save() { GM_setValue('cfg', cfg); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function normTime(x) { var m = String(x || '').trim().match(/^(\d{1,2})[:：](\d{2})$/); return m && +m[1] < 24 && +m[2] < 60 ? pad(m[1]) + ':' + m[2] : ''; }
  function toMin(hm) { var p = hm.split(':'); return +p[0] * 60 + +p[1]; }
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function safe(s) { return String(s).replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40); }
  function pending() { return queue.length + working; }
  function siteBy(id) { for (var i = 0; i < SITES.length; i++) if (SITES[i].id === id) return SITES[i]; return SITES[0]; }
  function siteLabel(s) { return PNAMES[s.p] + ' ' + s.name; }
  function currentSite() {
    // Temu locale segments look like "uk-zh-Hans" / "us-en", so compare the leading country code too.
    var seg = (location.pathname.split('/')[1] || '').toLowerCase(), segCode = seg.split('-')[0];
    var fallback = null, plain = null;
    for (var i = 0; i < SITES.length; i++) {
      var s = SITES[i];
      if (s.p !== PKEY) continue;
      if (!fallback) fallback = s;
      if (new URL(s.origin).hostname !== location.hostname) continue;
      if (s.prefix && (s.prefix === seg || s.prefix === segCode)) return s;
      if (!s.prefix && !plain) plain = s;
    }
    if (PKEY === 'temu' && segCode !== 'us') {
      var real = temuRealRegion(), code = real && real.code;
      if (real && !code) for (var k in TEMU_CUR) if (TEMU_CUR[k] === real.cur && k !== 'de' && k !== 'it' && k !== 'es') { code = k; break; }
      if (code) for (var j = 0; j < SITES.length; j++) if (SITES[j].id === 'temu-' + code) return SITES[j];
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
  function isMainSearch() { return PLAT.isSearch() && !isStorePage() && !PLAT.goods(location.href); }
  // Site home page such as temu.com/ or temu.com/us-zh-Hans (locale segment only, no product/store/search).
  function isHomePage() {
    if (PLAT.isSearch() || isStorePage() || PLAT.goods(location.href) || PLAT.store(location.href)) return false;
    return /^\/([a-z]{2}(-[A-Za-z]{2,8}){0,2})?\/?$/.test(location.pathname);
  }
  function homeUrl(id) { var s = siteBy(id); return s.origin + '/' + (s.prefix ? s.prefix : ''); }
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
    if (PLAT.storeFromGoods && g) return PLAT.storeFromGoods(g);
    // Temu's product page often renders the store block as a clickable div with no href; the mall id is in the page data.
    if (PKEY === 'temu') {
      var html = document.documentElement.innerHTML;
      var m = html.match(/["']?mall_?[iI]d["']?\s*[:=]\s*["']?(\d{6,})/) || html.match(/-m-(\d{6,})\.html/);
      if (m) {
        var s = currentSite();
        return { storeId: m[1], url: location.origin + '/' + (s.prefix ? s.prefix + '/' : '') + 'mall.html?mall_id=' + m[1] };
      }
    }
    return null;
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
    if (el.closest && el.closest('[data-collector-tag]')) return false;
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
  // 灵图 relabels its button to 「再次采集并同步」 once a product was synced, even from another browser.
  var ALREADY_RE = /再次采集/;
  function humanGap() { return sleep(cfg.clickGap * 1000 * (0.7 + Math.random() * 0.9)); }
  async function maybeRest() {
    if (!cfg.restEvery || !cfg.restMin) return;
    var n = (GM_getValue('sinceRest', 0) || 0) + 1;
    var limit = GM_getValue('restLimit', 0) || cfg.restEvery;
    if (n < limit) { GM_setValue('sinceRest', n); return; }
    GM_setValue('sinceRest', 0);
    GM_setValue('restLimit', Math.max(3, Math.round(cfg.restEvery * (0.8 + Math.random() * 0.4))));
    var ms = cfg.restMin * 60000 * (0.7 + Math.random() * 0.6);
    resting = true; render();
    log('已连续采集 ' + n + ' 张，休息 ' + (Math.round(ms / 6000) / 10) + ' 分钟（模拟人工，降低风控）');
    var end = Date.now() + ms;
    while (running && Date.now() < end) { await sleep(2000); lastProgress = Date.now(); }
    resting = false; render();
  }
  var handoffLock = Promise.resolve();
  function handoff(item) {
    var run = handoffLock.then(async function () {
      var card = liveCard(item);
      if (!card) return { ok: false, note: '卡片已不在页面上' };
      if (cfg.handoff === 'mark') { markCard(card, 'ok', '审核通过，鼠标移上去按 Alt+1'); return { ok: true, note: '已标记，待手动 Alt+1' }; }
      card.scrollIntoView({ block: 'center', behavior: 'instant' });
      await sleep(350 + Math.random() * 500);
      var btn = null, tries = cfg.handoff === 'click' ? 8 : 3;
      for (var t = 0; t < tries && !btn; t++) { hover(card); await sleep(250 + Math.random() * 200); btn = findLtButton(card); }
      if (btn && ALREADY_RE.test(btn.textContent || '')) {
        markCard(card, 'warn', '灵图显示已同步过，不重复采');
        return { ok: false, already: true, note: '灵图按钮显示「再次采集」，已同步过' };
      }
      var note;
      if (cfg.handoff === 'click' && btn) {
        var r = btn.getBoundingClientRect();
        fire(btn, ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'], r.left + r.width / 2, r.top + r.height / 2);
        markCard(card, 'ok', '已交给灵图采集并同步');
        note = '已点击灵图「采集并同步」';
      } else {
        hover(card);
        pressAlt1(card);
        if (cfg.handoff === 'click') { markCard(card, 'warn', '没找到灵图按钮，已试 Alt+1，请确认'); note = '没找到灵图按钮，已发送 Alt+1，请到灵图核对'; }
        else { markCard(card, 'ok', '已按 Alt+1 采集并同步'); note = '已发送 Alt+1 采集并同步'; }
      }
      await humanGap();
      await maybeRest();
      return { ok: true, note: note };
    });
    handoffLock = run.catch(function () {});
    return run;
  }

  async function doubao(content) {
    if (!cfg.useAi) throw new Error('豆包功能已关闭，要用请在「豆包/同步」里勾选「启用豆包」');
    if (!cfg.arkKey) throw new Error('请先在「豆包/同步」里填写豆包 API Key');
    if (/seedance|seedream/i.test(cfg.arkModel || '')) {
      cfg.arkModel = DEFAULTS.arkModel;
      GM_setValue('cfg', cfg);
      log('Seedance/Seedream 是视频/画图模型，不能做审核和翻译，已自动改回 ' + DEFAULTS.arkModel);
    }
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
  // Also returns a 64-bit difference hash of the print area, so the same design from another seller is caught as a duplicate.
  async function imageInfo(url) {
    var r = await gmRequest({ method: 'GET', url: url, responseType: 'blob' });
    if (r.status >= 400) throw new Error('图片 HTTP ' + r.status);
    var bmp = await createImageBitmap(r.response);
    var W = 160, H = 160, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(bmp, 0, 0, W, H);
    var x0 = Math.round(W * 0.22), y0 = Math.round(H * 0.28), w = Math.round(W * 0.56), h = Math.round(H * 0.54);
    var d = g.getImageData(x0, y0, w, h).data;
    var dark = 0, light = 0, n = 0;
    for (var i = 0; i < d.length; i += 4) {
      var mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
      n++;
      if (mx < 75 && mx - mn < 45) dark++;
      else if (mn > 185 && mx - mn < 40) light++;
    }
    var sc = document.createElement('canvas');
    sc.width = 9; sc.height = 8;
    var sg = sc.getContext('2d', { willReadFrequently: true });
    sg.drawImage(cv, x0, y0, w, h, 0, 0, 9, 8);
    var p = sg.getImageData(0, 0, 9, 8).data, bits = '', hex = '';
    function gray(x, y) { var o = (y * 9 + x) * 4; return p[o] * 0.299 + p[o + 1] * 0.587 + p[o + 2] * 0.114; }
    for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) bits += gray(x, y) > gray(x + 1, y) ? '1' : '0';
    for (var b = 0; b < 64; b += 4) hex += parseInt(bits.substr(b, 4), 2).toString(16);
    return { dark: dark / n, light: light / n, hash: hex };
  }
  var POP = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
  function bitsOf(h) { var c = 0; for (var i = 0; i < h.length; i++) c += POP[parseInt(h[i], 16)]; return c; }
  function hamming(a, b) { var c = 0; for (var i = 0; i < 16; i++) c += POP[parseInt(a[i], 16) ^ parseInt(b[i], 16)]; return c; }
  function similarSynced(hash) {
    // Near-blank prints carry almost no signal and would all look alike, so don't judge those by image.
    if (!hash || hash.length !== 16) return null;
    var c = bitsOf(hash);
    if (c < 8 || c > 56) return null;
    hashes = GM_getValue('hashes', []);
    for (var i = 0; i < hashes.length; i++) if (hamming(hash, hashes[i].h) <= 5) return hashes[i];
    return null;
  }
  async function aiCheck(item) {
    var prompt = '你是跨境电商服装上架审核员，要判断能否采集这件 T 恤的印花图案。商品标题：' + item.title +
      '\n请根据标题' + (cfg.aiVision ? '和图片' : '') + '判断，���返回 JSON：{"violation":是否涉及毒品/大麻/色情/暴力/仇恨等违规内容,"ipRisk":是否是迪士尼/三丽鸥/动漫/游戏/影视等知名 IP 或品牌,"doubleSided":是否前后双面印花,"fullPrint":是否满身印花或图案特别满,"notColor":衣服主体是否不是' + colorName(item.ctx) + ',"reason":"一句话中文原因"}，布尔值用 true/false。';
    var content = cfg.aiVision
      ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: item.imageUrl } }]
      : prompt;
    var r = await doubao(content);
    var bad = r.violation ? '违规内容' : r.ipRisk ? 'IP/品牌侵权风险' : null;
    if (!bad && cfg.aiVision) bad = r.doubleSided ? '双面印花' : r.fullPrint ? '印花太满' : (cfg.blackOnly && (r.notColor || r.notBlack)) ? '不是' + colorName(item.ctx) : null;
    return bad ? bad + (r.reason ? '：' + r.reason : '') : null;
  }

  // ---------- pipeline ----------
  // ---------- dedupe store (shared by every tab through GM storage; always merge, never overwrite) ----------
  function refreshSets() {
    GM_getValue('done', []).forEach(function (k) { done.add(k); });
    GM_getValue('synced', []).forEach(function (k) { synced.add(k); });
  }
  function addKey(name, set, key) {
    var arr = GM_getValue(name, []);
    if (arr.indexOf(key) < 0) { arr.push(key); GM_setValue(name, arr); }
    arr.forEach(function (k) { set.add(k); });
  }
  function removeKey(name, set, key) {
    GM_setValue(name, GM_getValue(name, []).filter(function (k) { return k !== key; }));
    set.delete(key);
  }
  function markDone(item) { addKey('done', done, item.key); }
  function markSynced(item, hash) {
    addKey('synced', synced, item.key);
    markDone(item);
    if (hash) { hashes = GM_getValue('hashes', []); hashes.push({ h: hash, k: item.key }); GM_setValue('hashes', hashes); }
  }
  function unmarkSynced(item) {
    removeKey('synced', synced, item.key);
    removeKey('done', done, item.key);
    hashes = GM_getValue('hashes', []).filter(function (x) { return x.k !== item.key; });
    GM_setValue('hashes', hashes);
  }
  function isKnown(key) { refreshSets(); return synced.has(key) || done.has(key); }
  function pushRecord(rec) {
    rec.time = new Date().toISOString();
    records = GM_getValue('records', []);
    records.push(rec);
    if (records.length > 30000) records = records.slice(-30000);
    GM_setValue('records', records);
  }
  function recOf(item, status, reason, extra) {
    return Object.assign({ status: status, reason: reason, key: item.key, country: siteLabel(item.ctx.country), source: item.ctx.source, goodsId: item.goodsId, title: item.title, sales: item.salesText, salesCount: item.salesCount, productUrl: item.productUrl, imageUrl: item.imageUrl }, extra || {});
  }

  // ---------- daily stats / report ----------
  function emptyDay() { return { saved: 0, skipped: 0, dup: 0, failed: 0, sites: {}, reasons: {} }; }
  function dayStats(d) { return GM_getValue('daily', {})[d || today()] || emptyDay(); }
  function reasonGroup(r) {
    r = String(r || '');
    return /违规/.test(r) ? '违规内容' : /IP|品牌/.test(r) ? 'IP/品牌' : /双面/.test(r) ? '双面印花' : /太满/.test(r) ? '印花太满' : /黑色|颜色/.test(r) ? '非黑色' : /标题含/.test(r) ? '跳过词' : '其他';
  }
  function bump(kind, site, reason) {
    var all = GM_getValue('daily', {}), d = today(), s = Object.assign(emptyDay(), all[d]);
    s[kind] = (s[kind] || 0) + 1;
    if (kind === 'saved' && site) s.sites[site] = (s.sites[site] || 0) + 1;
    if (kind === 'skipped' && reason) { var g = reasonGroup(reason); s.reasons[g] = (s.reasons[g] || 0) + 1; }
    all[d] = s;
    var keys = Object.keys(all).sort();
    while (keys.length > 60) delete all[keys.shift()];
    GM_setValue('daily', all);
  }
  function capReached() { return cfg.dailyCap > 0 && dayStats().saved >= cfg.dailyCap; }
  function joinMap(m) { return Object.keys(m).map(function (k) { return k + ' ' + m[k]; }).join('、') || '无'; }
  function reportText(d) {
    var s = dayStats(d);
    return ['日期：' + d,
      '已采集并同步：' + s.saved + ' 张' + (cfg.dailyCap ? '（每日上限 ' + cfg.dailyCap + '）' : ''),
      '去重拦截（没花灵豆）：' + s.dup + ' 张',
      '审核跳过：' + s.skipped + ' 张',
      '失败：' + s.failed,
      '各站点：' + joinMap(s.sites),
      '跳过原因：' + joinMap(s.reasons),
      '去重库累计已同步：' + synced.size + ' 张'].join('\n');
  }
  function exportReport() {
    var all = GM_getValue('daily', {});
    var rows = [['日期', '已同步', '去重拦截', '审核跳过', '失败', '各站点', '跳过原因'].join(',')];
    Object.keys(all).sort().reverse().forEach(function (d) {
      var s = Object.assign(emptyDay(), all[d]);
      rows.push([d, s.saved, s.dup, s.skipped, s.failed, joinMap(s.sites), joinMap(s.reasons)].map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','));
    });
    var url = URL.createObjectURL(new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv' }));
    GM_download({ url: url, name: '爆款图案/采集日报_' + today() + '.csv', saveAs: false, onload: function () { URL.revokeObjectURL(url); } });
  }

  // ---------- alerts: sound + desktop notification + WeChat push ----------
  var lastAlert = {};
  function beep() {
    try {
      var A = window.AudioContext || window.webkitAudioContext, ac = new A();
      [0, 0.35, 0.7].forEach(function (t) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = 880; g.gain.value = 0.15;
        o.connect(g); g.connect(ac.destination);
        o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.2);
      });
      setTimeout(function () { ac.close(); }, 1500);
    } catch (e) {}
  }
  async function push(title, body) {
    if (cfg.pushType === 'none' || !cfg.pushKey) return false;
    try {
      var r;
      if (cfg.pushType === 'serverchan') {
        var m = cfg.pushKey.match(/^sctp(\d+)t/i);
        var url = m ? 'https://' + m[1] + '.push.ft07.com/send/' + encodeURIComponent(cfg.pushKey) + '.send' : 'https://sctapi.ftqq.com/' + encodeURIComponent(cfg.pushKey) + '.send';
        r = await gmRequest({ method: 'POST', url: url, headers: { 'content-type': 'application/x-www-form-urlencoded' }, data: 'title=' + encodeURIComponent(title) + '&desp=' + encodeURIComponent(body.replace(/\n/g, '\n\n')) });
      } else {
        r = await gmRequest({ method: 'POST', url: 'https://www.pushplus.plus/send', headers: { 'content-type': 'application/json' }, data: JSON.stringify({ token: cfg.pushKey, title: title, content: body, template: 'txt' }) });
      }
      if (r.status >= 400) { log('微信推送失败：HTTP ' + r.status, true); return false; }
      return true;
    } catch (e) { log('微信推送失败：' + e.message, true); return false; }
  }
  function notify(title, body, opts) {
    opts = opts || {};
    var now = Date.now();
    if (!opts.force && lastAlert[title] && now - lastAlert[title] < 10 * 60000) return Promise.resolve(false);
    lastAlert[title] = now;
    if (cfg.beep && opts.sound !== false) beep();
    try { if (typeof GM_notification === 'function') GM_notification({ title: title, text: String(body).slice(0, 220), timeout: 20000 }); } catch (e) {}
    return push(title, body);
  }

  // ---------- pipeline ----------
  function markSkipped(item, reason) {
    markDone(item);
    pushRecord(recOf(item, '跳过', reason));
    stats.skipped++;
    bump('skipped', null, reason);
    log('跳过 ' + item.goodsId + '��' + reason);
    markCard(liveCard(item), 'bad', '不采：' + reason.slice(0, 40));
  }
  function markDup(item, reason) {
    markDone(item);
    pushRecord(recOf(item, '重复不采', reason));
    stats.dup++;
    bump('dup');
    log('去重 ' + item.goodsId + '：' + reason);
    markCard(liveCard(item), 'warn', '重复不采：' + reason.slice(0, 36));
  }
  async function processItem(item) {
    var ctx = item.ctx;
    if (isKnown(item.key)) { stats.dup++; markCard(liveCard(item), 'warn', '已处理过，不重复采'); return false; }
    var info = null;
    if (cfg.imgDedupe || (cfg.blackOnly && cfg.pixelCheck)) {
      try { info = await imageInfo(item.imageUrl); } catch (e) { log('图片检测失败，继续：' + e.message, true); }
    }
    var twin = info && cfg.imgDedupe ? similarSynced(info.hash) : null;
    if (twin) { markDup(item, '图案和已同步的 ' + twin.k + ' 几乎一样'); return false; }
    if (info && cfg.blackOnly && cfg.pixelCheck) {
      if (colorOf(ctx) === 'white') {
        if (info.light < cfg.lightMin / 100) { markSkipped(item, '非白色或印花太满（白色占比 ' + Math.round(info.light * 100) + '%）'); return false; }
      } else if (info.dark < cfg.darkMin / 100) { markSkipped(item, '非黑色或印花太满（黑色占比 ' + Math.round(info.dark * 100) + '%）'); return false; }
    }
    if (cfg.useAi && cfg.aiCheck) {
      var bad = await aiCheck(item);
      if (bad) { markSkipped(item, '豆包：' + bad); return false; }
    }
    if (capReached()) { queue.length = 0; return false; }

    var clean = cleanTitle(item.title), files = [];
    if (cfg.saveOriginal) {
      var base = '爆款图案/' + safe(siteLabel(ctx.country)) + '_' + safe(ctx.label) + '_' + today() + '/' + item.salesCount + '_' + safe(item.goodsId);
      await download(item.imageUrl, base + '_原图.' + extOf(item.imageUrl, 'jpg'));
      await downloadText(['平台站点：' + siteLabel(ctx.country), '原标题：' + item.title, '清洗后标题：' + clean, '销量：' + item.salesText, '链接：' + item.productUrl].join('\n'), base + '_标题.txt');
      files.push(base + '_原图', base + '_标题.txt');
    }

    // Claim the product before sending: a crash, reload or second tab can then never send it to 灵图 twice.
    // If something throws mid-send the claim stays, losing at most one item instead of paying twice.
    if (isKnown(item.key)) { stats.dup++; markCard(liveCard(item), 'warn', '其他标签页刚采过'); return false; }
    twin = info && cfg.imgDedupe ? similarSynced(info.hash) : null;
    if (twin) { markDup(item, '图案和已同步的 ' + twin.k + ' 几乎一样'); return false; }
    markSynced(item, info && info.hash);
    var res = await handoff(item);
    if (res.already) { pushRecord(recOf(item, '灵图已同步过', res.note)); stats.dup++; bump('dup'); log('去重 ' + item.goodsId + '：' + res.note); return false; }
    if (!res.ok) { unmarkSynced(item); stats.failed++; bump('failed'); log('交给灵图失败 ' + item.goodsId + '：' + res.note, true); return false; }
    pushRecord(recOf(item, cfg.handoff === 'mark' ? '已标记' : '已采集并同步', res.note, { cleanTitle: clean, files: files.join(' | ') }));
    bump('saved', siteLabel(ctx.country));
    return true;
  }

  async function worker() {
    working++;
    while (queue.length) {
      var item = queue.shift();
      try {
        if (await processItem(item)) {
          stats.saved++; item.ctx.saved++;
          item.ctx.task.carry = item.ctx.saved;
          if (item.ctx.job) {
            var ck = colorKey(item.ctx.task);
            if (ck) { item.ctx.job.colorSaved = item.ctx.job.colorSaved || {}; item.ctx.job.colorSaved[ck] = (item.ctx.job.colorSaved[ck] || 0) + 1; }
            setJob(item.ctx.job);
          }
          log('已保存 ' + item.goodsId + '（' + item.salesText + '）');
        }
        lastProgress = Date.now();
      } catch (e) {
        stats.failed++;
        bump('failed');
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
      var cre = colorOf(ctx) === 'white' ? WHITE_RE : BLACK_RE;
      if (cfg.blackOnly && !cfg.pixelCheck && !cre.test(x.title)) return;
      x.ctx = ctx;
      x.black = cre.test(x.title);
      ctx.candidates.push(x);
      stats.candidates++;
      if (!done.has(x.key) && !synced.has(x.key)) ctx.backlog.push(x);
      else markCard(x.el, 'warn', '已处理过，不重复采');
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
      if ((attempt > 0 || target !== btn) && typeof btn.click === 'function') { try { btn.click(); } catch (e) {} }
      if (attempt > 0 && hit !== btn && typeof hit.click === 'function') { try { hit.click(); } catch (e) {} }
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
    refreshSets();
    while (running && ctx.saved < ctx.target && !capReached()) {
      fill(ctx);
      if (ctx.backlog.length) { await sleep(800); continue; }
      if (idle >= 6) {
        if (pending() && !resting) { await sleep(800); continue; }
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
      if (scan(ctx) > 0) {
        idle = 0; lastProgress = Date.now();
        // A high-sales product just showed up: finish what's queued, then leave the search to visit its store.
        if (storePicks(ctx).length) {
          while (pending()) await sleep(800);
          ctx.storeBreak = true;
          break;
        }
        continue;
      }
      // While the sync worker rests, nothing else scrolls the page, so loading the next batch is safe.
      if (pending() && !resting) { await sleep(800); continue; }
      if (findMore() && await clickMore()) { idle = 0; lastProgress = Date.now(); continue; }
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
    if (t.type === 'search') return siteLabel(siteBy(t.site)) + (t.resumed ? ' 退出店铺，回到搜索' : t.user ? ' 你搜的' : ' 搜索') + '「' + t.keyword + '」' + (cfg.colorMode !== 'black' && t.color ? '（' + (t.color === 'white' ? '白T' : '黑T') + '）' : '');
    if (t.type === 'goods') return PNAMES[siteBy(t.site).p] + ' 商品 ' + t.goodsId + ' → 找店铺';
    if (t.type === 'store') return PNAMES[siteBy(t.site).p] + ' 店铺 ' + t.storeId;
    return '当前页';
  }
  function taskUrl(t) { return t.type === 'search' ? (t.returnUrl || searchUrl(t.site, t.keyword)) : t.url; }
  function onTaskPage(t) {
    if (t.type === 'here') return location.pathname === t.path;
    if (siteBy(t.site).p !== PKEY) return false;
    // A store's own search results (e.g. Temu search_result with mall_id) are never the site-wide search.
    if (t.type === 'search') return currentSite().id === t.site && isMainSearch() && (!!t.navigated || hrefHas(t.keyword));
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
      var soldOut = function () {
        var txt = ((document.body && document.body.innerText) || '').slice(0, 4000);
        return /此商品已售罄|商品已下架|已售罄|This item is sold out|Sold out|no longer available|Ausverkauft|Épuisé|Esaurito|Agotado|Esgotado|売り切れ/i.test(txt);
      };
      await waitFor(function () { return findStoreLink() || soldOut(); }, 15000);
      if (soldOut()) { log('商品 ' + t.goodsId + ' 已售罄/下架，跳过进店，继续下一个'); return; }
      var link = findStoreLink();
      if (!link) { log('商品 ' + t.goodsId + ' 没找到店铺入口', true); return; }
      var sk = PKEY + ':' + link.storeId;
      if (job.visitedStores.indexOf(sk) >= 0) { log('店铺 ' + link.storeId + ' 已采过，跳过'); return; }
      job.visitedStores.push(sk);
      job.tasks.splice(job.idx + 1, 0, { type: 'store', site: t.site, storeId: link.storeId, url: link.url, color: t.color });
      return;
    }
    var optional = PLAT.metric === 'optional' || t.type === 'store';
    var hasGoods = function () { return extract(optional).length > 0; };
    var found = await waitFor(hasGoods, 15000);
    // A URL-opened search can come back empty even though typing the same words into the site's box works.
    if (!found && t.type === 'search' && !t.typed) {
      t.typed = true; setJob(job);
      log('网址搜索没出商品，改用页面搜索框重新搜「' + t.keyword + '」');
      if (await typeSearch(t.keyword)) found = await waitFor(hasGoods, 20000);
    }
    if (!found && t.type === 'search' && noResultsText()) { log('「' + t.keyword + '」在' + siteLabel(siteBy(t.site)) + '确实没有结果，换下一个关键��', true); return; }
    if (found) {
      // keep going
    } else if (cfg.autoResume) {
      var ok = await waitHuman(t, job, '「' + taskLabel(t) + '」没识别到商品：��能要登录或出现了验证码', function () { return extract(optional).length > 0; });
      if (!running) return;
      if (!ok) { log('等了 30 分钟没处理，跳过「' + taskLabel(t) + '」', true); return; }
    } else if (!extract(optional).length) {
      t.empty = (t.empty || 0) + 1;
      notify('采集需要人工处理', taskLabel(t) + '：没识别到商品，��能要登录或出现了验证码');
      if (t.empty === 1) { log('「' + taskLabel(t) + '」没识别到商品：可能要先登录，或出现��验证码。在页面上处理好后点「继续」', true); running = false; return; }
      log('仍然没识别到商品，跳过「' + taskLabel(t) + '」', true);
      return;
    }
    var site = t.site ? siteBy(t.site) : currentSite();
    var baseTarget = t.type === 'store' ? cfg.storeTarget : cfg.target;
    var ctx = {
      country: site, task: t, job: job, optional: optional, color: t.color,
      saved: t.carry || 0, backlog: [], seen: new Set(), candidates: [],
      target: Math.min(baseTarget, (t.carry || 0) + colorLeft(job, t)),
      source: t.type === 'store' ? '店铺' + t.storeId : t.type === 'search' ? siteLabel(site) + '搜索' : '当前页',
      label: t.type === 'search' ? t.keyword : t.type === 'store' ? '店铺' + t.storeId : (PLAT.isSearch() ? '搜索页' : '当前页')
    };
    await collectPage(ctx);
    if (!running || t.type !== 'search' || !cfg.enterStore) return;
    var picks = storePicks(ctx);
    if (!picks.length) {
      if ((t.storesEntered || 0) >= cfg.storeCount) log('这个关键词已进了 ' + cfg.storeCount + ' 家店（进店数量上限）');
      else log('本页没有销量 ≥ ' + cfg.storeMinSales + ' 的商品，不进店（本页最高 ' + (ctx.maxSales || 0) + '）');
      return;
    }
    var added = 0;
    picks.forEach(function (x) {
      job.visitedGoods.push(x.key);
      var task;
      if (PLAT.storeFromGoods) {
        var st = PLAT.storeFromGoods(x.goodsId), key = PKEY + ':' + st.storeId;
        if (job.visitedStores.indexOf(key) >= 0) return;
        job.visitedStores.push(key);
        task = { type: 'store', site: t.site, storeId: st.storeId, url: st.url, color: t.color };
      } else {
        task = { type: 'goods', site: t.site, goodsId: x.goodsId, url: x.productUrl, color: t.color };
      }
      log('高销量 ' + x.goodsId + '（' + x.salesText + '）≥ 门槛 ' + cfg.storeMinSales + ' → 进店采集');
      job.tasks.splice(job.idx + 1 + added, 0, task);
      added++;
    });
    t.storesEntered = (t.storesEntered || 0) + added;
    // Left the search early for these stores: come back to the same keyword afterwards and keep going.
    if (ctx.storeBreak && ctx.saved < ctx.target) {
      job.tasks.splice(job.idx + 1 + added, 0, {
        type: 'search', site: t.site, keyword: t.keyword, user: t.user, color: t.color,
        carry: ctx.saved, storesEntered: t.storesEntered, resumed: true,
        returnUrl: isMainSearch() ? location.href : ''
      });
    }
    if (added) log('将进入 ' + added + ' 个高销量店铺，采完自动退出' + (ctx.storeBreak ? '，回到「' + t.keyword + '」继续采集' : '继续下一个搜索'));
  }
  function storePicks(ctx) {
    var t = ctx.task, job = ctx.job;
    if (!cfg.enterStore || !t || t.type !== 'search' || !job) return [];
    var left = cfg.storeCount - (t.storesEntered || 0);
    if (left <= 0) return [];
    return ctx.candidates.slice().sort(function (a, b) { return b.salesCount - a.salesCount; })
      .filter(function (x) { return !x.noMetric && x.salesCount >= cfg.storeMinSales && job.visitedGoods.indexOf(x.key) < 0; }).slice(0, left);
  }
  async function runJob() {
    var job = getJob();
    if (job && job.v !== JOB_VERSION) { setJob(null); job = null; }
    if (!job || job.paused) { render(); return; }
    running = true; lastProgress = Date.now(); render();
    while (job.idx < job.tasks.length) {
      var t = job.tasks[job.idx];
      if (capReached()) { finishJob('今日已同步 ' + dayStats().saved + ' 张，达到每日上限 ' + cfg.dailyCap); return; }
      if (colorLeft(job, t) <= 0) {
        log(siteLabel(siteBy(t.site)) + ' ' + colorName(t) + 'T 已采够 ' + (t.color === 'white' ? cfg.whiteCount : cfg.blackCount) + ' 张，跳过「' + taskLabel(t) + '」');
        job.idx++; setJob(job); continue;
      }
      // Temu keyword searches start from the site's home page search box, never from inside a store.
      var viaHome = PKEY === 'temu' && t.type === 'search' && !t.returnUrl && siteBy(t.site).p === PKEY;
      if (viaHome && !onTaskPage(t) && !t.homeTyped && isHomePage() && currentSite().id === t.site) {
        t.homeTyped = true; t.navigated = true; setJob(job);
        log('在 Temu 首页搜索框输入「' + t.keyword + '」并搜索');
        await sleep(1500 + Math.random() * 1000);
        if (!(await typeSearch(t.keyword))) location.href = searchUrl(t.site, t.keyword);
        return;
      }
      if (!onTaskPage(t)) {
        if (viaHome && !t.homeTyped) {
          t.tries = (t.tries || 0) + 1;
          if (t.tries > 3) { log('打不开 Temu 首页，跳过「' + taskLabel(t) + '」', true); job.idx++; setJob(job); continue; }
          setJob(job);
          log('回到 Temu 首页，准备搜索「' + t.keyword + '」');
          await sleep(1500 + Math.random() * 1500);
          location.href = homeUrl(t.site);
          return;
        }
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
          if (cfg.autoResume) {
            var fixed = await waitHuman(t, job, '当前 Temu 是「' + realName + '」站，不是「' + wantName + '」。请点页面顶���「更改国家/地区」选「' + wantName + '」', function () { return !temuRegionMismatch(t.site); });
            if (!running) { job.paused = true; setJob(job); render(); return; }
            if (!fixed) { log('等了 30 分钟国家还没切换，跳过「' + taskLabel(t) + '」', true); job.idx++; setJob(job); continue; }
            t.navigated = true; setJob(job);
            log('国家已切换到「' + wantName + '」，重新打开搜索页');
            location.href = taskUrl(t);
            return;
          }
          notify('Temu 国家不对', '当前是「' + realName + '」站，需要切换到「' + wantName + '」');
          job.paused = true; t.tries = 0; t.navigated = false; setJob(job); running = false;
          log('当前 Temu 实际是「' + realName + '」站，不是你选的「' + wantName + '」��Temu 的国家记在账号/浏览器里，脚本改不了网址切换。请点页面顶部语言旁的「更改国家/地区」→ 选「' + wantName + '」，切好后点面板「继续」', true);
          render();
          return;
        }
      }
      log('开始：' + taskLabel(t) + '（' + (job.idx + 1) + '/' + job.tasks.length + '）');
      lastProgress = Date.now();
      await runTask(t, job);
      if (!running) { job.paused = true; setJob(job); render(); return; }
      job.idx++; setJob(job); render();
    }
    finishJob('全部任务完成');
  }
  function finishJob(reason) {
    setJob(null); running = false; queue.length = 0;
    log(reason + '，可以导出 CSV / 日报');
    notify('灵图采集结束', reason + '\n' + reportText(today()), { sound: false, force: true });
    render();
  }
  // Unattended mode: alert the user, keep the job alive, and continue on its own once the page is fixed.
  async function waitHuman(t, job, what, check) {
    waitingHuman = true; t.tries = 0; setJob(job); render();
    log(what + '。已提醒你，处理好后会自动继续（��多等 30 分钟）', true);
    notify('采集需要人工处理', siteLabel(currentSite()) + '：' + what);
    var end = Date.now() + 30 * 60000, ok = false;
    while (running && Date.now() < end) {
      await sleep(8000);
      lastProgress = Date.now();
      if (check()) { ok = true; break; }
    }
    waitingHuman = false; render();
    if (ok) log('检测到已处理，自动继续');
    return ok;
  }
  function splitKeywords(s) {
    var out = [];
    String(s || '').split(/[|｜\n;；]+/).forEach(function (k) {
      k = k.replace(/[\s\u3000\u00a0]+/g, ' ').replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim();
      if (k && out.indexOf(k) < 0) out.push(k);
    });
    return out;
  }
  // ---------- color phases: black only / white only / black N then white N per site ----------
  function colorOf(ctx) { return (ctx && ctx.color) || (cfg.colorMode === 'white' ? 'white' : 'black'); }
  function colorName(x) { return colorOf(x) === 'white' ? '白色' : '黑色'; }
  function colorKey(t) { return t && t.site && t.color ? t.site + ':' + t.color : ''; }
  function colorLeft(job, t) {
    if (cfg.colorMode !== 'rotate' || !t.color || !job) return Infinity;
    var limit = t.color === 'white' ? cfg.whiteCount : cfg.blackCount;
    if (!limit) return Infinity;
    return limit - ((job.colorSaved || {})[colorKey(t)] || 0);
  }
  function toWhite(k) {
    var out = k;
    TO_WHITE.forEach(function (p) { out = out.replace(new RegExp(p[0], 'gi'), p[1]); });
    return out === k && !WHITE_RE.test(k) ? 'white ' + k : out;
  }
  function currentKeyword() {
    if (!PLAT.isSearch()) return '';
    var u = new URL(location.href), p = u.searchParams;
    var k = p.get('search_key') || p.get('q') || p.get('k') || p.get('keyword') || '';
    if (!k) {
      var m = location.pathname.match(/\/pdsearch\/([^/]+)/) || location.pathname.match(/\/w\/wholesale-([^/.]+)\.html/);
      if (m) { try { k = decodeURIComponent(m[1]); } catch (e) { k = m[1]; } k = k.replace(/-/g, ' '); }
    }
    return k.trim();
  }
  // ---------- keywords: one shared list, auto-translated into each selected site's language ----------
  function needsTrans(kw, s) {
    if (s.lang === '英文') return !/^[\x00-\x7f]+$/.test(kw);
    if (s.lang === '繁体中文') return !/[\u4e00-\u9fff]/.test(kw);
    return true;
  }
  // Offline fallback so Chinese keywords still work on English sites without a 豆包 key.
  var ZH_EN = [
    ['纯白色', 'plain white'], ['纯黑色', 'plain black'], ['黑色', 'black'], ['白色', 'white'], ['黑', 'black'], ['白', 'white'],
    ['短袖', 'short sleeve'], ['长袖', 'long sleeve'], ['圆领', 'crew neck'], ['宽松', 'oversized'], ['纯棉', 'cotton'],
    ['印花', 'graphic'], ['图案', 'graphic'], ['字母', 'letter print'], ['文字', 'text print'], ['复古', 'vintage'], ['搞笑', 'funny'],
    ['幽默', 'funny'], ['潮流', 'streetwear'], ['街头', 'streetwear'], ['骷髅', 'skull'], ['动漫', 'anime'], ['卡通', 'cartoon'],
    ['摇滚', 'rock'], ['乐队', 'band'], ['健身', 'gym'], ['猫', 'cat'], ['狗', 'dog'], ['龙', 'dragon'], ['老鹰', 'eagle'],
    ['美国', 'american'], ['国旗', 'flag'], ['摩托', 'motorcycle'], ['汽车', 'car'], ['钓鱼', 'fishing'], ['游戏', 'gaming'],
    ['T恤衫', 't shirt'], ['T恤', 't shirt'], ['t恤', 't shirt'], ['体恤', 't shirt'], ['衬衫', 't shirt'], ['上衣', 'top'],
    ['男士', 'men'], ['男款', 'men'], ['男装', 'men'], ['男', 'men'], ['女士', 'women'], ['女款', 'women'], ['女', 'women']
  ];
  function localZhToEn(kw) {
    var s = kw;
    ZH_EN.forEach(function (p) { s = s.split(p[0]).join(' ' + p[1] + ' '); });
    s = s.replace(/[\u4e00-\u9fff，、]+/g, ' ').replace(/\s+/g, ' ').trim();
    var words = s.split(' '), out = [];
    words.forEach(function (w) { if (w && out.indexOf(w) < 0) out.push(w); });
    s = out.join(' ').replace(/\b(men|women)\b(.*)$/, '$2 $1').replace(/\s+/g, ' ').trim();
    return s || kw;
  }
  async function translateMany(pairs) {
    var cache = GM_getValue('kwTrans', {}), out = {}, miss = [];
    pairs.forEach(function (p) {
      var key = p.lang + '|' + p.kw;
      if (cache[key]) out[key] = cache[key];
      else if (!miss.some(function (m) { return m.lang + '|' + m.kw === key; })) miss.push(p);
    });
    if (!miss.length || !cfg.kwTranslate) return out;
    if (!cfg.useAi) { log('豆包已关闭，关键词不翻译，外语站点直接用原词搜索'); return out; }
    if (!cfg.arkKey) { log('没填豆包 API Key，关键词不会自动翻译，外语站点会直接用原词搜索', true); return out; }
    log('正在用豆包把 ' + miss.length + ' 个关键词翻译成各站点语言…');
    try {
      var r = await doubao('把下面的电商搜索关键词翻译成指定语言。要求：译成当地买家在 Temu / Amazon 搜索框里真实会输入的简短说法，保留颜色、印花/图案、T 恤、男女含义；不要加品牌、引号、解释；已经是该语言的原样返回。\n' +
        miss.map(function (p, i) { return i + '. [' + p.lang + '] ' + p.kw; }).join('\n') +
        '\n只返回 JSON：{"items":[{"i":序号,"t":"译文"}]}');
      (r.items || []).forEach(function (it) {
        var p = miss[+it.i], tr = splitKeywords(it.t)[0];
        if (p && tr) { cache[p.lang + '|' + p.kw] = tr; out[p.lang + '|' + p.kw] = tr; }
      });
      GM_setValue('kwTrans', cache);
    } catch (e) { log('关键词翻译失败，用原词搜索：' + e.message, true); }
    return out;
  }
  async function buildTasks() {
    var kws = splitKeywords(cfg.myKeywords), on = SITES.filter(function (s) { return cfg.sites[s.id].on; });
    if (!kws.length || !on.length) return [];
    var colors = cfg.colorMode === 'rotate' ? ['black', 'white'] : [cfg.colorMode === 'white' ? 'white' : 'black'];
    var src = {};
    colors.forEach(function (c) { src[c] = c === 'white' ? splitKeywords(kws.map(toWhite).join('\n')) : kws; });
    var pairs = [];
    on.forEach(function (s) { colors.forEach(function (c) { src[c].forEach(function (k) { if (needsTrans(k, s)) pairs.push({ kw: k, lang: s.lang }); }); }); });
    var tr = await translateMany(pairs), tasks = [];
    on.forEach(function (s) {
      colors.forEach(function (c) {
        var seen = [];
        src[c].forEach(function (k) {
          var kk = needsTrans(k, s) ? (tr[s.lang + '|' + k] || (s.lang === '英文' ? localZhToEn(k) : k)) : k;
          if (seen.indexOf(kk.toLowerCase()) >= 0) return;
          seen.push(kk.toLowerCase());
          tasks.push({ type: 'search', site: s.id, keyword: kk, src: k, color: c });
        });
      });
    });
    return tasks;
  }
  function noResultsText() {
    var txt = ((document.body && document.body.innerText) || '').slice(0, 30000);
    return /没有[“"「].{0,80}[”"」]的结果|没有找到相关|No results for|0 results for|couldn.t find any|did not match any|Keine Ergebnisse|Aucun résultat|Nessun risultato|No se encontraron|No hay resultados|Nenhum resultado|検索結果がありません|一致する商品はありません|ไม่พบสินค้า|Không tìm thấy|Tidak ditemukan/i.test(txt);
  }
  // Types into the site's own search box like a person would (some sites only return results this way).
  async function typeSearch(kw) {
    var W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    // Never type into a store/product page's box: that searches inside the store. Open the site-wide search instead.
    if (!isMainSearch() && !isHomePage()) {
      log('当前在店铺/商品页，不在店内搜索，先回首页再搜「' + kw + '」');
      location.href = homeUrl(currentSite().id);
      return true;
    }
    var sel = 'input[type="search"], input[name="search_key"], input[name="q"], input[name="k"], input[name="keyword"], input[name="field-keywords"], input[id*="search" i], input[class*="search" i], input[placeholder]';
    var inp = Array.prototype.find.call(document.querySelectorAll(sel), function (el) {
      if (host.contains(el) || el.type === 'hidden' || el.type === 'checkbox') return false;
      if (/本店|店内|店铺|this store|in store|this shop|in shop|im shop|dans la boutique|nel negozio|en la tienda/i.test((el.placeholder || '') + ' ' + (el.getAttribute('aria-label') || ''))) return false;
      var r = el.getBoundingClientRect();
      return r.width > 80 && r.height > 15 && r.top < 320;
    });
    if (!inp) { log('页面上没找到搜索框', true); return false; }
    // Events must be built with the page's own constructors, or the site's framework ignores them.
    var Ev = W.Event || Event, KEv = W.KeyboardEvent || KeyboardEvent, IEv = W.InputEvent || Ev;
    var setter = Object.getOwnPropertyDescriptor((W.HTMLInputElement || HTMLInputElement).prototype, 'value').set;
    var fire = function (el, type, C, init) { try { el.dispatchEvent(new C(type, init)); } catch (e) { el.dispatchEvent(new Ev(type, { bubbles: true })); } };
    var startHref = location.href;
    var submitted = function () { return location.href !== startHref || (hrefHas(kw) && PLAT.isSearch()); };
    var waitNav = async function (ms) { var end = Date.now() + ms; while (Date.now() < end) { if (submitted()) return true; await sleep(250); } return submitted(); };

    inp.scrollIntoView({ block: 'center' });
    inp.click(); inp.focus();
    inp.select && inp.select();
    var typed = false;
    try { typed = document.execCommand('selectAll', false) && document.execCommand('insertText', false, kw); } catch (e) { typed = false; }
    if (!typed || inp.value !== kw) {
      setter.call(inp, '');
      fire(inp, 'input', IEv, { bubbles: true, inputType: 'deleteContentBackward' });
      for (var c = 0; c < kw.length; c++) {
        setter.call(inp, kw.slice(0, c + 1));
        fire(inp, 'input', IEv, { bubbles: true, data: kw[c], inputType: 'insertText' });
        await sleep(20 + Math.random() * 40);
      }
    }
    fire(inp, 'change', Ev, { bubbles: true });
    await sleep(700);
    if (inp.value !== kw) { setter.call(inp, kw); fire(inp, 'input', IEv, { bubbles: true }); await sleep(300); }

    // 1) press Enter
    ['keydown', 'keypress', 'keyup'].forEach(function (type) {
      fire(inp, type, KEv, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: type === 'keypress' ? 13 : 0, bubbles: true, cancelable: true, composed: true });
    });
    if (await waitNav(3000)) return true;

    // 2) click the magnifier button (skip the clear "x" button, which would wipe the text)
    if (inp.value !== kw) { setter.call(inp, kw); fire(inp, 'input', IEv, { bubbles: true }); await sleep(300); }
    var ir = inp.getBoundingClientRect(), best = null, box = inp.parentElement;
    for (var i = 0; i < 5 && box && !best; i++, box = box.parentElement) {
      var cands = Array.prototype.filter.call(box.querySelectorAll('button, [type="submit"], [role="button"], [class*="search" i][class*="btn" i], [class*="search" i][class*="icon" i], svg'), function (el) {
        if (host.contains(el) || el === inp || el.contains(inp)) return false;
        var s = ((el.getAttribute('aria-label') || '') + ' ' + (el.className && el.className.baseVal != null ? el.className.baseVal : el.className || '') + ' ' + (el.title || '')).toLowerCase();
        if (/clear|close|delete|清除|删除|remove/.test(s)) return false;
        var r = el.getBoundingClientRect();
        return r.width >= 16 && r.height >= 16 && r.width < 160 && Math.abs((r.top + r.height / 2) - (ir.top + ir.height / 2)) < ir.height && r.left > ir.left + ir.width * 0.6;
      });
      if (cands.length) best = cands.sort(function (a, b) { return b.getBoundingClientRect().right - a.getBoundingClientRect().right; })[0];
    }
    if (best) {
      var clickEl = best.closest('button, [role="button"], a, div') || best;
      ['pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach(function (type) {
        fire(clickEl, type, /pointer/.test(type) ? (W.PointerEvent || W.MouseEvent || Ev) : (W.MouseEvent || Ev), { bubbles: true, cancelable: true, composed: true, view: W, button: 0 });
      });
      clickEl.click();
      if (await waitNav(4000)) return true;
    }

    // 3) submit the form
    var form = inp.closest('form');
    if (form) {
      try { if (form.requestSubmit) form.requestSubmit(); else form.submit(); } catch (e) {}
      if (await waitNav(4000)) return true;
    }

    // 4) last resort: open the site's search URL directly
    log('搜索框没能提交，改为直接打开搜索网址「' + kw + '」');
    try {
      var u = searchUrl(currentSite().id, kw);
      if (u) { location.href = u; return true; }
    } catch (e) {}
    return false;
  }
  // The keyword the user already searched on this page goes first, then the built-in keywords.
  function withUserFirst(tasks) {
    var kw = cfg.userFirst ? currentKeyword() : '';
    if (!kw) return tasks;
    var sid = currentSite().id;
    var color = WHITE_RE.test(kw) ? 'white' : BLACK_RE.test(kw) ? 'black' : (cfg.colorMode === 'white' ? 'white' : 'black');
    var low = kw.toLowerCase();
    tasks = tasks.filter(function (t) { return !(t.site === sid && String(t.keyword).toLowerCase() === low); });
    tasks.unshift({ type: 'search', site: sid, keyword: kw, color: color, user: true, navigated: false });
    log('先重新搜索你当前的「' + kw + '」，搜出结果后再采集，采完再用内置关键词');
    return tasks;
  }
  function startJob(tasks) {
    setJob({ v: JOB_VERSION, tasks: tasks, idx: 0, paused: false, visitedGoods: [], visitedStores: [] });
    runJob();
  }
  function pause() { running = false; var j = getJob(); if (j) { j.paused = true; setJob(j); } render(); }

  async function genKeywords() {
    var men = cfg.gender === 'men', have = splitKeywords(cfg.myKeywords);
    log('正在让豆包想更多英文关键词…');
    var r = await doubao('我做跨境电商，要��索' + (men ? '男士' : '女士') + '黑色印花短袖 T 恤的爆款图案。我已有这些关键词：' + have.join('；') +
      '。请再给 5 个美国买家真实会搜的英文关键词，彼此说法不同，都要表达「黑色 + 印花/图案 + 短袖 T 恤 + ' + (men ? '男' : '女') + '」，不要品牌、IP、长袖、卫衣、儿童。只返回 JSON：{"keywords":["..."]}');
    var list = splitKeywords(have.concat(r.keywords || []).join('\n'));
    cfg.myKeywords = list.join('\n'); save(); $('myKeywords').value = cfg.myKeywords;
    log('关键词共 ' + list.length + ' 个，外语站点会自动翻译后搜索');
  }
  // ---------- random black / white tee keywords: built locally (free), never repeats across runs ----------
  var KW_PARTS = {
    black: ['black', 'jet black', 'solid black', 'all black'],
    white: ['white', 'pure white', 'plain white', 'bright white'],
    garment: ['t shirt', 't-shirt', 'tee', 'graphic tee', 'crew neck tee', 'short sleeve tee', 'cotton tee', 'oversized tee', 'casual tee', 'summer tee'],
    style: ['graphic', 'print', 'printed', 'design', 'pattern'],
    theme: ['funny', 'vintage', 'retro', 'skull', 'gothic', 'streetwear', 'sarcastic', 'motivational quote', 'gym', 'fishing', 'hunting', 'camping',
      'dad joke', 'rock', 'biker', 'american flag', 'patriotic', 'cat', 'dog', 'horror', 'halloween', 'christmas', 'faith', 'bible verse', 'eagle',
      'wolf', 'dragon', 'floral', 'geometric', 'minimalist', 'abstract', 'sunset', 'mountain', 'surf', 'beach', 'gaming', 'math', 'science', 'coffee',
      'beer', 'bbq', 'cowboy', 'western', 'tattoo style', 'grunge', 'y2k', '90s', 'cartoon', 'meme', 'lion', 'tiger', 'butterfly', 'rose', 'cross',
      'samurai', 'space', 'alien', 'astronaut', 'skateboard', 'motorcycle', 'car', 'guitar', 'wildlife', 'bear', 'snake', 'mushroom', 'dinosaur',
      'pirate', 'viking', 'anchor', 'compass', 'tropical', 'palm tree', 'sun and moon', 'zodiac', 'tarot', 'line art', 'word art', 'letter print'],
    men: ['men', 'mens', 'for men', 'male', 'guys'],
    women: ['women', 'womens', 'for women', 'ladies', 'female']
  };
  var KW_SHAPES = [
    ['color', 'theme', 'style', 'garment', 'gender'],
    ['theme', 'color', 'garment', 'gender'],
    ['color', 'garment', 'theme', 'style', 'gender'],
    ['gender', 'color', 'theme', 'style', 'garment'],
    ['color', 'theme', 'garment', 'gender'],
    ['theme', 'style', 'color', 'garment', 'gender']
  ];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function kwKey(k) {
    return String(k).toLowerCase().replace(/t-shirt|t shirt|tshirt/g, 'tee').split(/[^a-z0-9]+/).filter(Boolean).sort().join(' ');
  }
  function randomKeywords(n, colorPref, gender) {
    var hist = GM_getValue('kwHistory', []), seen = {}, out = [];
    hist.forEach(function (k) { seen[k] = 1; });
    splitKeywords(cfg.myKeywords).forEach(function (k) { seen[kwKey(k)] = 1; });
    for (var tries = 0; out.length < n && tries < n * 80; tries++) {
      var color = colorPref === 'both' ? (out.length % 2 ? 'white' : 'black') : colorPref;
      var parts = {
        color: pick(KW_PARTS[color]), garment: pick(KW_PARTS.garment), style: pick(KW_PARTS.style),
        theme: pick(KW_PARTS.theme), gender: pick(KW_PARTS[gender === 'women' ? 'women' : 'men'])
      };
      if (/graphic|print/.test(parts.garment) || /print|letter|word art|line art/.test(parts.theme)) parts.style = '';
      var kw = pick(KW_SHAPES).map(function (p) { return parts[p]; }).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      var key = kwKey(kw);
      if (seen[key]) continue;
      seen[key] = 1; out.push(kw); hist.push(key);
    }
    GM_setValue('kwHistory', hist.slice(-20000));
    return out;
  }
  function addRandomKeywords(n) {
    var list = randomKeywords(n || cfg.kwRandCount || 10, cfg.kwRandColor || 'both', cfg.gender);
    if (!list.length) { log('能组合的新词已经用完了，点「清空生成记录」后可重新生成', true); return 0; }
    cfg.myKeywords = splitKeywords(splitKeywords(cfg.myKeywords).concat(list).join('\n')).join('\n');
    save();
    var box = $('myKeywords'); if (box) box.value = cfg.myKeywords;
    var total = GM_getValue('kwHistory', []).length;
    log('新生成 ' + list.length + ' 个不重复关键词（累计生成 ' + total + ' 个）：' + list.slice(0, 4).join(' / ') + (list.length > 4 ? ' …' : ''));
    return list.length;
  }
  async function previewKeywords() {
    var tasks = await buildTasks();
    if (!tasks.length) { log('请先填写关键词并勾选站点', true); return; }
    var bySite = {};
    tasks.forEach(function (t) { (bySite[t.site] = bySite[t.site] || []).push(t.keyword); });
    Object.keys(bySite).forEach(function (id) { log(siteLabel(siteBy(id)) + '：' + bySite[id].join(' / ')); });
  }

  // Stalled page (blank, frozen, endless spinner): reload; the saved job resumes where it left off.
  setInterval(function () {
    if (!running || waitingHuman || resting || Date.now() - lastProgress < 6 * 60000) return;
    var j = getJob(), t = j && j.tasks[j.idx];
    if (!t) return;
    t.reloads = (t.reloads || 0) + 1;
    if (t.reloads > 2) { log('「' + taskLabel(t) + '」连续卡住，跳到下一个任务', true); j.idx++; }
    else { log('6 分钟没有进展，刷新页面后自动续采', true); t.navigated = true; }
    running = false;
    setJob(j);
    location.reload();
  }, 30000);

  // Schedule + daily report. Needs this Chrome open with at least one platform tab.
  setInterval(function () {
    var hm = nowHM(), d = today(), rt = normTime(cfg.reportTime);
    if (rt && hm >= rt && GM_getValue('reportedDay', '') !== d) {
      GM_setValue('reportedDay', d);
      notify('灵图采集日报 ' + d, reportText(d), { sound: false, force: true });
      log('已发送今日日报');
    }
    if (getJob()) return;
    String(cfg.schedule || '').split(/[,，\s]+/).map(normTime).filter(Boolean).forEach(async function (slot) {
      var key = d + ' ' + slot, diff = toMin(hm) - toMin(slot);
      if (diff < 0 || diff > 15) return;
      var ran = GM_getValue('schedRan', {});
      if (ran[key] || getJob()) return;
      ran[key] = 1;
      Object.keys(ran).forEach(function (k) { if (k.slice(0, 10) !== d) delete ran[k]; });
      GM_setValue('schedRan', ran);
      if (capReached()) { log('定时 ' + slot + '：今日已达上限，不开工'); return; }
      if (!preflight()) return;
      var tasks = await buildTasks();
      if (!tasks.length || getJob()) return;
      log('定时开工 ' + slot + '：共 ' + tasks.length + ' 个搜索任务');
      notify('定时采集开始', slot + ' 开始，共 ' + tasks.length + ' 个搜索任务', { sound: false, force: true });
      startJob(tasks);
    });
  }, 20000);

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
      return '<label style="display:flex;gap:5px;align-items:center;width:50%;box-sizing:border-box;margin-bottom:4px;cursor:pointer"><input type="checkbox" data-c="' + s.id + '">' + s.name + ' <span style="font-size:11px;color:' + C.dim + '">' + s.lang + '</span></label>';
    }).join('');
    return '<details data-plat="' + p + '" style="margin-bottom:6px;border-bottom:1px solid ' + C.line + ';padding-bottom:4px"><summary style="cursor:pointer;padding:3px 0"><strong>' + PNAMES[p] + '</strong> <span data-pc="' + p + '" style="font-size:11px;color:' + C.dim + '"></span></summary>' +
      '<div style="display:flex;gap:10px;font-size:11px;margin:2px 0 4px"><button data-all="' + p + '" style="' + linkCss + '">全选</button><button data-none="' + p + '" style="' + linkCss + '">全不选</button></div>' +
      '<div style="display:flex;flex-wrap:wrap">' + rows + '</div></details>';
  }).join('');

  var host = document.createElement('div');
  host.setAttribute('style', 'position:fixed;right:20px;bottom:20px;z-index:2147483647;width:350px;background:' + C.bg + ';color:' + C.text + ';font:13px/1.5 system-ui,"PingFang SC","Microsoft YaHei",sans-serif;border-radius:10px;box-shadow:0 14px 36px rgba(0,0,0,.4);padding:14px');
  host.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><strong style="font-size:14px">爆款图案采集 → 灵图 · ' + PNAMES[PKEY] + '</strong>' +
      '<button data-k="min" aria-label="收起" style="background:none;border:0;color:' + C.dim + ';cursor:pointer;font-size:16px">–</button></div>' +
    '<div data-k="body">' +
      '<div style="display:flex;margin-bottom:10px;border-bottom:1px solid ' + C.line + '">' + tabBtn('main', '采集') + tabBtn('country', '站点') + tabBtn('filter', '过滤') + tabBtn('auto', '自动') + tabBtn('api', '豆包/去重') + '</div>' +
      '<div style="max-height:52vh;overflow:auto;padding-right:2px">' +
        '<div data-pane="main">' +
          row(field('最低销量/评价数', input('minSales', 'type="number" min="1"')), field('每次搜索采集', input('target', 'type="number" min="1"'))) +
          row(field('卖', '<select data-k="gender" style="' + inputCss + '"><option value="men">男装</option><option value="women">女装</option></select>'), field('进店数量', input('storeCount', 'type="number" min="0"'))) +
          row(field('每家店采集', input('storeTarget', 'type="number" min="1"')), field('最多翻页', input('maxPages', 'type="number" min="1"'))) +
          check('userFirst', '把我当前搜索框里的关键词排在第一个（也会先重新搜索再采）') +
          check('enterStore', '高销量商品自动进店铺采集，采完退出店铺继续') +
          row(field('进店销量门槛（≥）', input('storeMinSales', 'type="number" min="0"')), '<span style="flex:1"></span>') +
          '<div style="border-top:1px solid ' + C.line + ';margin:6px 0;padding-top:6px"><strong>T 恤颜色</strong></div>' +
          check('blackOnly', '只要指定颜色款（按下面的颜色模式过滤）') +
          field('颜色模式', '<select data-k="colorMode" style="' + inputCss + '"><option value="black">只采黑 T</option><option value="white">只采纯白 T</option><option value="rotate">轮换：先黑 T 再白 T</option></select>') +
          row(field('每站黑 T 采集（张）', input('blackCount', 'type="number" min="0"')), field('每站白 T 采集（张）', input('whiteCount', 'type="number" min="0"'))) +
          hint('轮换模式：每个站点先用黑 T 关键词采够设定张数，再自动换成白 T 关键词（自动把 black/schwarz/noir/黑 等换成 white/weiß/blanc/白）。0 = 不限。') +
          hint('Etsy / Amazon 卡片不显示销量，用评价数代替；SHEIN 没有销量也没有评价时照样采，按黑色优先排序。') +
        '</div>' +
        '<div data-pane="country" style="display:none">' +
          field('我的关键词（每行一个，依次轮询搜索）', '<textarea data-k="myKeywords" rows="4" style="' + inputCss + ';resize:vertical"></textarea>') +
          check('kwTranslate', '选了其他国家时，自动把关键词翻译成该国语言再��索（用豆包）') +
          '<div style="display:flex;gap:6px;margin-bottom:8px"><button data-k="genKw" style="' + btnCss + '">豆包帮我想更多词</button><button data-k="previewKw" style="' + btnCss + '">预览各站搜索词</button></div>' +
          '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">' +
            '<select data-k="kwRandColor" style="' + inputCss + ';flex:1"><option value="both">黑白各半</option><option value="black">只要黑 T</option><option value="white">只要白 T</option></select>' +
            '<input data-k="kwRandCount" type="number" min="1" max="100" style="' + inputCss + ';width:64px" aria-label="生成个数">' +
            '<button data-k="randKw" style="' + btnCss + '">随机生成</button>' +
          '</div>' +
          check('kwAutoRand', '每次「开始多站点采集」前自动追加一批新随机词') +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span data-k="kwHistInfo" style="font-size:11px;opacity:.7"></span><button data-k="clearKwHist" style="' + linkCss + ';font-size:11px">清空生成记录</button></div>' +
          hint('随机词在本地组合（颜色 + 主题 + 印花 + T 恤 + 男女），不花灵豆也不花豆包费用；所有生成过的词都会记��，词序不同也算重复，永远不会再生成同一个词。') +
          hint('翻译结果会缓存，同一个词只翻译一次。下面勾选要采集的站点，不勾就不采；跨平台会自动跳转，请先在这个浏览器里登录这些网站。') +
          '<div style="display:flex;justify-content:flex-end;margin-bottom:4px"><button data-k="noneAll" style="' + linkCss + ';font-size:11px">取消全部站点</button></div>' +
          siteRows +
          '<button data-k="recommend" style="' + btnCss + ';width:100%;margin-top:4px">问豆包：黑 T 在哪些平台/国家卖得多</button>' +
        '</div>' +
        '<div data-pane="auto" style="display:none">' +
          field('定时开工（多��用逗号隔开，如 09:00,20:00）', input('schedule', 'placeholder="留空 = 不定时"')) +
          row(field('每日最多同步（0 = 不限）', input('dailyCap', 'type="number" min="0"')), field('日报推送时间', input('reportTime', 'placeholder="22:00"'))) +
          row(field('每���几张休息一次', input('restEvery', 'type="number" min="0"')), field('每次休息分钟', input('restMin', 'type="number" min="0"'))) +
          check('autoResume', '遇到验证码 / 要登录 / 国家不对：提醒我，处理好后自动继续') +
          check('beep', '需要处理时电脑响提示音') +
          field('微信提醒', '<select data-k="pushType" style="' + inputCss + '"><option value="none">不推送</option><option value="serverchan">Server 酱</option><option value="pushplus">PushPlus</option></select>') +
          field('推送 SendKey / Token', input('pushKey', 'type="password"')) +
          '<div style="display:flex;gap:6px;margin-bottom:6px"><button data-k="testPush" style="' + btnCss + '">测试提醒</button><button data-k="report" style="' + btnCss + '">导出日报</button></div>' +
          hint('定时开工需要这个 Chrome 开着，并至少打开一个平台网页（如 Temu 首页）。页面刷新或崩溃后会自动从中断处续采；6 分钟没进展会自动刷新。') +
        '</div>' +
        '<div data-pane="filter" style="display:none">' +
          check('pixelCheck', '检测图片：颜色不对 / 印花太满的不要') +
          row(field('黑色占比下限 %', input('darkMin', 'type="number" min="5" max="95"')), field('白色占比下限 %', input('lightMin', 'type="number" min="5" max="95"'))) +
          field('跳过词（标题出现就不采）', '<textarea data-k="skipWords" rows="5" style="' + inputCss + ';resize:vertical"></textarea>') +
          field('标题删除词（上架标题里去掉）', '<textarea data-k="removeWords" rows="5" style="' + inputCss + ';resize:vertical"></textarea>') +
          hint('另外会自动：删除所有尺码；秋季/冬季/秋冬 → 四季；卖男装删女性词，卖女装删男性词。') +
          '<button data-k="resetWords" style="' + linkCss + '">恢复默认词库</button>' +
        '</div>' +
        '<div data-pane="api" style="display:none">' +
          '<div style="margin-bottom:6px"><strong>豆包审核</strong></div>' +
          check('useAi', '启用豆包（总开关）') +
          hint('不勾选＝所有功能都不用豆包：不审核、不翻译关键词、「豆包帮我想更多词」和「推荐站点」也停用，不产生任何豆包费用。随机生成关键词、像素颜色判断、去重照常工作。') +
          field('豆包 API Key（火山方舟）', input('arkKey', 'type="password"')) +
          field('模型 / 接入点 ID', input('arkModel')) +
          hint('填文字/��图模型，如 doubao-seed-2-0-pro、doubao-seed-2-0-lite。Seedance 2.0（视频）和 Seedream（画图）不能用于审核和翻译，填了会自动改回。') +
          check('aiCheck', '用豆包审核每个商品（违规 / IP 侵权）') +
          check('aiVision', '审核时看图（双面 / 满印 / 颜色）') +
          '<div style="border-top:1px solid ' + C.line + ';margin:8px 0;padding-top:8px"><strong>采集同步（灵图插件 Alt+1）</strong></div>' +
          field('审核通过后', '<select data-k="handoff" style="' + inputCss + '"><option value="alt1">自动按 Alt+1 采集并同步（推荐）</option><option value="click">自动点「采集并同步」按钮</option><option value="mark">只标绿框，我自己按 Alt+1</option></select>') +
          field('每次采集间隔（秒）', input('clickGap', 'type="number" min="1" max="30"')) +
          hint('不再使用灵图 API。如果 Alt+1 没反应，改选「自动点按钮」。') +
          check('saveOriginal', '同时把原图和标题保存到电脑') +
          '<div style="border-top:1px solid ' + C.line + ';margin:8px 0;padding-top:8px"><strong>去重（防止重复花灵豆）</strong></div>' +
          hint('同一个商品 ID 永远只同步一次；灵图按钮显示「再次采集」的也会跳过；所有标签页共用一个去重库。') +
          check('imgDedupe', '图案相似去重：不同卖家的同款图也不重复采') +
          '<div data-k="dbInfo" style="font-size:12px;color:' + C.dim + ';margin-bottom:6px"></div>' +
          '<div style="display:flex;gap:6px;margin-bottom:6px"><button data-k="exportDb" style="' + btnCss + '">备份去重库</button><button data-k="importDb" style="' + btnCss + '">导入去重库</button></div>' +
          '<input data-k="dbFile" type="file" accept=".json,application/json" style="display:none">' +
          hint('重装油猴或换电脑前先备份，导入后旧商品不会再被同步。') +
          '<button data-k="clear" style="' + linkCss + ';display:block;margin-top:4px">重新审核跳过的商品（已同步的仍不会重复）</button>' +
          '<button data-k="clearSynced" style="' + linkCss + ';display:block;margin-top:6px;color:' + C.red + '">清空全部记录（会重复花灵豆）</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;margin:10px 0 6px"><button data-k="start" style="' + btnCss + ';border:0;background:' + C.blue + ';color:#fff">开始多站点采集</button>' +
        '<button data-k="here" style="' + btnCss + '">只采当前页</button></div>' +
      '<div style="display:flex;gap:6px;margin-bottom:6px"><button data-k="store" style="' + btnCss + ';display:none">进入本店采集</button>' +
        '<button data-k="pause" style="' + btnCss + '">暂停</button><button data-k="end" style="' + btnCss + '">结束任务</button><button data-k="csv" style="' + btnCss + '">导出 CSV</button></div>' +
      '<div data-k="job" style="font-size:12px;color:' + C.dim + '"></div>' +
      '<div data-k="today" style="margin-top:4px;font-size:12px;color:' + C.text + '"></div>' +
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
    GM_registerMenuCommand('显示采集��板', function () {
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
  showTab(cfg.arkKey || !cfg.aiCheck || !cfg.useAi ? 'main' : 'api');

  function syncCounts() {
    Object.keys(PLATFORMS).forEach(function (p) {
      var n = SITES.filter(function (s) { return s.p === p && cfg.sites[s.id].on; }).length;
      host.querySelector('[data-pc="' + p + '"]').textContent = n ? '已选 ' + n : '';
    });
  }
  function syncSites() {
    SITES.forEach(function (s) {
      host.querySelector('[data-c="' + s.id + '"]').checked = cfg.sites[s.id].on;
    });
    Object.keys(PLATFORMS).forEach(function (p) {
      host.querySelector('[data-plat="' + p + '"]').open = p === PKEY || SITES.some(function (s) { return s.p === p && cfg.sites[s.id].on; });
    });
    syncCounts();
  }
  SITES.forEach(function (s) {
    host.querySelector('[data-c="' + s.id + '"]').onchange = function (e) { cfg.sites[s.id].on = e.target.checked; save(); syncCounts(); };
  });
  function setPlatform(p, on) {
    SITES.forEach(function (s) { if (!p || s.p === p) cfg.sites[s.id].on = on; });
    save(); syncSites();
  }
  Object.keys(PLATFORMS).forEach(function (p) {
    host.querySelector('[data-all="' + p + '"]').onclick = function () { setPlatform(p, true); };
    host.querySelector('[data-none="' + p + '"]').onclick = function () { setPlatform(p, false); };
  });
  $('noneAll').onclick = function () { setPlatform(null, false); log('已取消全部站点'); };
  syncSites();
  $('myKeywords').value = cfg.myKeywords;
  $('myKeywords').onchange = function () {
    cfg.myKeywords = splitKeywords($('myKeywords').value).join('\n');
    $('myKeywords').value = cfg.myKeywords; save();
  };
  $('previewKw').onclick = function () { previewKeywords().catch(function (e) { log(e.message, true); }); };

  ['arkKey', 'arkModel', 'skipWords', 'removeWords', 'handoff', 'schedule', 'reportTime', 'pushType', 'pushKey', 'colorMode'].forEach(function (k) {
    $(k).value = cfg[k];
    $(k).onchange = function () {
      var v = $(k).value.trim();
      if (k === 'reportTime') v = normTime(v);
      if (k === 'schedule') v = v.split(/[,，\s]+/).map(normTime).filter(Boolean).join(',');
      cfg[k] = v; $(k).value = v; save();
      if (/Words$/.test(k)) compileRules();
      if (k === 'schedule') log(v ? '定时开工：' + v : '已关闭定时开工');
    };
  });
  ['minSales', 'target', 'maxPages', 'storeCount', 'storeTarget', 'darkMin', 'clickGap', 'dailyCap', 'restEvery', 'restMin', 'storeMinSales', 'blackCount', 'whiteCount', 'lightMin'].forEach(function (k) {
    $(k).value = cfg[k];
    $(k).onchange = function () { var v = parseInt($(k).value, 10); cfg[k] = isFinite(v) && v >= 0 ? v : DEFAULTS[k]; $(k).value = cfg[k]; save(); render(); };
  });
  ['blackOnly', 'pixelCheck', 'enterStore', 'saveOriginal', 'aiCheck', 'aiVision', 'imgDedupe', 'autoResume', 'beep', 'userFirst', 'kwTranslate'].forEach(function (k) {
    $(k).checked = !!cfg[k];
    $(k).onchange = function () { cfg[k] = $(k).checked; save(); };
  });
  function applyAiState() {
    ['aiCheck', 'aiVision', 'kwTranslate', 'genKw', 'recommend', 'arkKey', 'arkModel'].forEach(function (k) {
      var el = $(k);
      if (!el) return;
      el.disabled = !cfg.useAi;
      var box = el.closest('label') || el;
      box.style.opacity = cfg.useAi ? '' : '0.4';
    });
  }
  $('useAi').checked = !!cfg.useAi;
  $('useAi').onchange = function () {
    cfg.useAi = $('useAi').checked;
    save();
    applyAiState();
    log(cfg.useAi ? '已启用豆包' : '已关闭豆包：审核、翻译、想词、推荐站点全部不调用豆包');
  };
  applyAiState();
  $('gender').value = cfg.gender;
  $('gender').onchange = function () {
    var prev = cfg.gender;
    cfg.gender = $('gender').value;
    if (cfg.myKeywords === SITES[0][prev]) { cfg.myKeywords = SITES[0][cfg.gender]; $('myKeywords').value = cfg.myKeywords; }
    save();
  };
  $('resetWords').onclick = function () {
    cfg.skipWords = DEFAULT_SKIP.join('，'); cfg.removeWords = DEFAULT_REMOVE.join('，');
    $('skipWords').value = cfg.skipWords; $('removeWords').value = cfg.removeWords;
    save(); compileRules(); log('已恢复默认词库');
  };
  $('min').onclick = function () { var b = $('body'); b.style.display = b.style.display === 'none' ? '' : 'none'; };
  $('clear').onclick = function () {
    if (!confirm('之前被审核跳过的商品会重新审核（会再用豆包），已同步到灵图的仍然不会重复。确定吗？')) return;
    refreshSets();
    var keep = Array.from(done).filter(function (k) { return synced.has(k); });
    done = new Set(keep); GM_setValue('done', keep);
    log('已允许重新审核跳过的商品，已同步 ' + synced.size + ' 张仍受保护'); render();
  };
  $('clearSynced').onclick = function () {
    var ans = prompt('这会让已同步到灵图的 ' + synced.size + ' 张图可以再次被同步，会重复花灵豆。确定请输入「清空」：');
    if (ans !== '清空') { log('已取消清空'); return; }
    done.clear(); synced.clear(); records = []; hashes = [];
    ['done', 'synced', 'records', 'hashes'].forEach(function (k) { GM_setValue(k, []); });
    log('已清空全部记录', true); render();
  };
  $('exportDb').onclick = function () {
    refreshSets();
    var data = JSON.stringify({ v: 1, exportedAt: new Date().toISOString(), synced: Array.from(synced), done: Array.from(done), hashes: GM_getValue('hashes', []) });
    var url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    GM_download({ url: url, name: '爆款图案/去重库备份_' + today() + '.json', saveAs: false, onload: function () { URL.revokeObjectURL(url); } });
    log('已备份去重库：已同步 ' + synced.size + ' 张');
  };
  $('importDb').onclick = function () { $('dbFile').value = ''; $('dbFile').click(); };
  $('dbFile').onchange = function () {
    var f = $('dbFile').files[0];
    if (!f) return;
    f.text().then(function (txt) {
      var data = JSON.parse(txt), before = synced.size;
      refreshSets();
      (data.synced || []).forEach(function (k) { synced.add(k); done.add(k); });
      (data.done || []).forEach(function (k) { done.add(k); });
      var hs = GM_getValue('hashes', []), seenK = {};
      hs.forEach(function (x) { seenK[x.k] = 1; });
      (data.hashes || []).forEach(function (x) { if (x && x.h && !seenK[x.k]) { hs.push(x); seenK[x.k] = 1; } });
      GM_setValue('synced', Array.from(synced)); GM_setValue('done', Array.from(done)); GM_setValue('hashes', hs); hashes = hs;
      log('已导入去重库：新增已同步 ' + (synced.size - before) + ' 张，共 ' + synced.size + ' 张'); render();
    }).catch(function (e) { log('导入失败：' + e.message, true); });
  };
  $('testPush').onclick = function () {
    beep();
    notify('灵图采集测试提醒', '收到这条说明提醒设置正确。\n' + reportText(today()), { sound: false, force: true }).then(function (ok) {
      log(cfg.pushType === 'none' ? '已播放提示音（没开微信推送）' : ok ? '测试推送已发送，请看微信' : '微信推送失败，检查 Key', !ok && cfg.pushType !== 'none');
    });
  };
  $('report').onclick = exportReport;
  $('genKw').onclick = function () { genKeywords().catch(function (e) { log(e.message, true); }); };
  function kwHistInfo() { $('kwHistInfo').textContent = '已生成过 ' + GM_getValue('kwHistory', []).length + ' 个词'; }
  $('kwRandColor').value = cfg.kwRandColor || 'both';
  $('kwRandColor').onchange = function () { cfg.kwRandColor = $('kwRandColor').value; save(); };
  $('kwRandCount').value = cfg.kwRandCount || 10;
  $('kwRandCount').onchange = function () {
    cfg.kwRandCount = Math.max(1, Math.min(100, parseInt($('kwRandCount').value, 10) || 10));
    $('kwRandCount').value = cfg.kwRandCount; save();
  };
  $('kwAutoRand').checked = !!cfg.kwAutoRand;
  $('kwAutoRand').onchange = function () { cfg.kwAutoRand = $('kwAutoRand').checked; save(); };
  $('randKw').onclick = function () { addRandomKeywords(); kwHistInfo(); };
  $('clearKwHist').onclick = function () {
    if (!confirm('清空后，以前生成过的随机词可能会再次出现。只影响随机生成，不影响已采商品的去重记录。确定清空？')) return;
    GM_setValue('kwHistory', []); kwHistInfo(); log('随机词生成记录已清空');
  };
  kwHistInfo();
  $('recommend').onclick = function () { recommendSites().catch(function (e) { log(e.message, true); }); };

  function preflight() {
    if (cfg.useAi && cfg.aiCheck && !cfg.arkKey) { showTab('api'); log('开了豆包审核，请先填写豆包 API Key', true); return false; }
    return true;
  }
  var starting = false;
  $('start').onclick = async function () {
    if (getJob() || starting) { log('已有任务，点「暂停/继续」或先「结束任务」'); return; }
    if (!preflight()) return;
    if (capReached()) { log('今日已达每日上限 ' + cfg.dailyCap + '，到「自动」里调高或改成 0', true); return; }
    if (cfg.kwAutoRand) { addRandomKeywords(); kwHistInfo(); }
    if (!splitKeywords(cfg.myKeywords).length) { showTab('country'); log('请先在「站点」里填写关键词', true); return; }
    starting = true;
    try {
      var tasks = withUserFirst(await buildTasks());
      if (!tasks.length) { showTab('country'); log('请至少勾选一个站点', true); return; }
      startJob(tasks);
    } finally { starting = false; }
  };
  $('here').onclick = function () {
    if (getJob()) { log('已有任务，请先「结束任务」'); return; }
    if (!preflight()) return;
    startJob([{ type: 'here', site: currentSite().id, path: location.pathname }]);
  };
  $('store').onclick = function () {
    if (getJob()) { log('已有任务，请先「结�����任务」'); return; }
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
    $('stats').textContent = siteLabel(currentSite()) + ' · 识别 ' + stats.found + ' · 达标 ' + stats.candidates + ' · 跳过 ' + stats.skipped + ' · 保存 ' + stats.saved + ' · 失败 ' + stats.failed + ' · 去重 ' + stats.dup + ' · 排队 ' + pending();
    var s = dayStats();
    $('today').textContent = '今日：同步 ' + s.saved + (cfg.dailyCap ? '/' + cfg.dailyCap : '') + ' · 去重拦截 ' + s.dup + ' · 跳过 ' + s.skipped +
      (waitingHuman ? ' · 等待人工处理' : '') + (resting ? ' · 休息中' : '') + (cfg.schedule && !j ? ' · 定时 ' + cfg.schedule : '');
    $('dbInfo').textContent = '去重库：已同步 ' + synced.size + ' 张 · 已审核 ' + done.size + ' 个 · 图案指纹 ' + hashes.length + ' 个';
  }

  compileRules();
  render();
  log('就绪 v6.11.2' + (cfg.useAi ? '' : ' · 豆包已关闭') + ' �� 当前站点：' + siteLabel(currentSite()) + (isStorePage() ? '（店铺页）' : isGoodsPage() ? '（商品页）' : ''));
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
    '// @version      6.11.2',
    '// @description  多平台（Temu / SHEIN / Etsy / Amazon / Shopee / Lazada / 速卖通）多国家筛选高销量黑色 T 恤，豆包审核违规/IP/双面/满印，通过的自动点灵图插件「采集并同步」',
    ...matches.map((m) => '// @match        ' + m),
    '// @grant        GM_xmlhttpRequest',
    '// @grant        GM_download',
    '// @grant        GM_getValue',
    '// @grant        GM_setValue',
    '// @grant        GM_registerMenuCommand',
    '// @grant        GM_notification',
    '// @connect      *',
    '// @run-at       document-idle',
    '// @noframes',
    '// ==/UserScript==',
    '',
    body,
  ].join('\n')
}
