// Runs entirely inside the user's own logged-in browser on temu.com (Tampermonkey).
// Kept as a plain-JS string so it ships verbatim, independent of the Next.js bundler.
// The body is a String.raw template: it must never contain backticks or a dollar-brace sequence.
export const COUNTRIES = [
  { code: 'us', name: '美国', prefix: '', lang: '英文', men: 'black graphic t shirt men', women: 'black graphic t shirt women' },
  { code: 'uk', name: '英国', prefix: 'uk', lang: '英文', men: 'black graphic t shirt men', women: 'black graphic t shirt women' },
  { code: 'ca', name: '加拿大', prefix: 'ca', lang: '英文', men: 'black graphic t shirt men', women: 'black graphic t shirt women' },
  { code: 'au', name: '澳大利亚', prefix: 'au', lang: '英文', men: 'black graphic t shirt men', women: 'black graphic t shirt women' },
  { code: 'de', name: '德国', prefix: 'de', lang: '德文', men: 'schwarzes t-shirt herren print', women: 'schwarzes t-shirt damen print' },
  { code: 'fr', name: '法国', prefix: 'fr', lang: '法文', men: 't-shirt noir homme imprimé', women: 't-shirt noir femme imprimé' },
  { code: 'it', name: '意大利', prefix: 'it', lang: '意大利文', men: 'maglietta nera uomo stampa', women: 'maglietta nera donna stampa' },
  { code: 'es', name: '西班牙', prefix: 'es', lang: '西班牙文', men: 'camiseta negra hombre estampada', women: 'camiseta negra mujer estampada' },
  { code: 'mx', name: '墨西哥', prefix: 'mx', lang: '西班牙文', men: 'playera negra hombre estampada', women: 'playera negra mujer estampada' },
  { code: 'jp', name: '日本', prefix: 'jp', lang: '日文', men: 'tシャツ 黒 メンズ プリント', women: 'tシャツ 黒 レディース プリント' },
] as const

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

  var COUNTRIES = __COUNTRIES__;
  var DEFAULT_SKIP = __SKIP__;
  var DEFAULT_REMOVE = __REMOVE__;
  var ARK_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

  var MULT = { '万': 10000, 'w': 10000, 'W': 10000, '千': 1000, 'k': 1000, 'K': 1000, 'm': 1000000, 'M': 1000000 };
  var SOLD_WORDS = '(?:sold|verkauft|vendus?|vendidos?|venduti|verkocht|sprzedano|販売済み?|点販売|已售|售出|件已售)';
  var SALES_RES = [
    new RegExp('(\\d[\\d.,]*)\\s*(万|千|[kKwWmM])?\\s*\\+?\\s*(?:件|个|点)?\\s*' + SOLD_WORDS, 'i'),
    new RegExp(SOLD_WORDS + '\\s*(\\d[\\d.,]*)\\s*(万|千|[kKwWmM])?\\s*\\+?', 'i')
  ];
  var MORE_RE = /^(查看更多|显示更多|更多商品|加载更多|See more|Show more|Load more|View more|Mehr anzeigen|Voir plus|Ver más|Mostra altro|もっと見る)/i;
  var BLACK_RE = /黑|black|schwarz|noir|negr[ao]|ner[ao]|zwart|czarn|黒|ブラック/i;
  var FEMALE_WORDS = ['女装', '女士', '女款', '女式', '女性', '女生', '女', "women's", 'womens', 'women', 'woman', 'ladies', 'lady', 'female', 'damen', 'femme', 'mujer', 'donna', 'レディース'];
  var MALE_WORDS = ['男装', '男士', '男款', '男式', '男性', '男生', '男', "men's", 'mens', 'men', 'man', 'male', 'herren', 'homme', 'hombre', 'uomo', 'メンズ'];

  var DEFAULTS = {
    apiBase: '', appId: '', secret: '', arkKey: '', arkModel: 'doubao-seed-1-6-250615',
    minSales: 100, target: 60, blackOnly: true, pixelCheck: true, darkMin: 40, gender: 'men',
    enterStore: true, storeCount: 3, storeTarget: 30,
    saveOriginal: true, crop: true, matting: true, dress: false, stanceId: '', backgroundId: '', dressAr: '3:4', dressNum: 1,
    lingtuTitle: false, aiCheck: false, aiVision: true,
    skipWords: DEFAULT_SKIP.join('，'), removeWords: DEFAULT_REMOVE.join('，'),
    countries: {}
  };
  var cfg = Object.assign({}, DEFAULTS, GM_getValue('cfg', {}));
  COUNTRIES.forEach(function (c) {
    var cur = cfg.countries[c.code] || {};
    cfg.countries[c.code] = { on: cur.on != null ? cur.on : c.code === 'us', keyword: cur.keyword || c[cfg.gender] };
  });
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
  function countryBy(code) { for (var i = 0; i < COUNTRIES.length; i++) if (COUNTRIES[i].code === code) return COUNTRIES[i]; return COUNTRIES[0]; }
  function currentCountry() {
    var seg = location.pathname.split('/')[1] || '';
    for (var i = 0; i < COUNTRIES.length; i++) if (COUNTRIES[i].prefix && COUNTRIES[i].prefix === seg) return COUNTRIES[i];
    return COUNTRIES[0];
  }
  function searchUrl(code, keyword) {
    var c = countryBy(code);
    return 'https://www.temu.com/' + (c.prefix ? c.prefix + '/' : '') + 'search_result.html?search_key=' + encodeURIComponent(keyword);
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

  // ---------- Temu page parsing ----------
  function parseSales(text) {
    for (var i = 0; i < SALES_RES.length; i++) {
      var m = text.match(SALES_RES[i]);
      if (!m) continue;
      var n = parseFloat(m[1].replace(/,(?=\d{3}\b)/g, '').replace(',', '.'));
      if (isFinite(n)) return { text: m[0].replace(/\s+/g, ' ').trim(), count: Math.round(n * (MULT[m[2]] || 1)) };
    }
    return null;
  }
  function goodsIdFrom(href) {
    var m = href.match(/-g-(\d{6,})\.html/) || href.match(/[?&]goods_id=(\d{6,})/);
    return m ? m[1] : null;
  }
  function mallIdFrom(href) {
    var m = href.match(/-m-(\d{6,})\.html/) || href.match(/[?&]mall_id=(\d{6,})/);
    return m ? m[1] : null;
  }
  function isGoodsPage() { return /-g-\d{6,}\.html/.test(location.pathname); }
  function isStorePage() { return !!mallIdFrom(location.href); }
  function cleanImage(src) {
    if (!src || src.indexOf('data:') === 0) return null;
    try {
      var u = new URL(src, location.href);
      if (!/(^|\.)(kwcdn\.com|temu\.com)$/i.test(u.hostname)) return null;
      return 'https://' + u.hostname + u.pathname;
    } catch (e) { return null; }
  }
  function distinctGoods(el) {
    var ids = {}, n = 0, links = el.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var g = goodsIdFrom(links[i].href);
      if (g && !ids[g]) { ids[g] = 1; if (++n > 1) return n; }
    }
    return n;
  }
  function findCard(a) {
    var el = a;
    for (var i = 0; i < 9 && el && el !== document.body; i++) {
      if (el.querySelector && el.querySelector('img') && parseSales(el.innerText || '')) return distinctGoods(el) <= 1 ? el : null;
      el = el.parentElement;
    }
    return null;
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
  function extract() {
    var anchors = document.querySelectorAll('a[href]'), seen = {}, out = [];
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i], id = goodsIdFrom(a.href);
      if (!id || seen[id]) continue;
      var card = findCard(a);
      if (!card) continue;
      seen[id] = 1;
      var sales = parseSales(card.innerText || ''), img = pickImage(card);
      if (!sales || !img) continue;
      var lines = (card.innerText || '').split('\n').filter(function (l) { return l.trim().length > 8; });
      var title = (img.alt || a.getAttribute('title') || a.getAttribute('aria-label') || lines[0] || 'Temu').trim().slice(0, 200);
      var u = new URL(a.href, location.href);
      out.push({ goodsId: id, title: title, productUrl: 'https://' + u.hostname + u.pathname, imageUrl: img.src, salesText: sales.text, salesCount: sales.count });
    }
    return out;
  }
  function findStoreLink() {
    var anchors = document.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var id = mallIdFrom(anchors[i].href);
      if (id) return { mallId: id, url: anchors[i].href };
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
  async function sha256Hex(s) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function lingtuReady() { return !!(cfg.apiBase && cfg.appId && cfg.secret); }
  async function lingtu(uri, body, method) {
    if (!lingtuReady()) throw new Error('请先在「灵图/AI」里填写灵图 API 地址 / appId / secret');
    var salt = crypto.randomUUID(), timestamp = String(Math.floor(Date.now() / 1000));
    var sign = await sha256Hex(cfg.appId + uri + salt + timestamp + cfg.secret);
    var r = await gmRequest({
      method: method || 'POST', url: cfg.apiBase.replace(/\/+$/, '') + uri,
      headers: { 'content-type': 'application/json', appId: cfg.appId, salt: salt, timestamp: timestamp, sign: sign },
      data: body ? JSON.stringify(body) : undefined
    });
    var json = r.responseText;
    try { json = JSON.parse(r.responseText); } catch (e) {}
    var code = json && typeof json === 'object' && 'code' in json ? String(json.code) : null;
    if (r.status >= 400 || (code && code !== '0' && code !== '200')) {
      var msg = { '401': '签名校验失败，请检查 appId / secret', '800000': '灵图剩余次数不足', '800002': '灵图无法读取该图片' }[code || String(r.status)];
      throw new Error(msg || (json && json.message) || ('灵图接口 HTTP ' + r.status));
    }
    return json && typeof json === 'object' && 'data' in json ? json.data : json;
  }
  async function lingtuJob(uri, body) {
    var res = await lingtu(uri, body);
    var jobId = typeof res === 'string' ? res : res && res.jobId;
    if (!jobId) throw new Error('灵图未返回任务 ID');
    for (var i = 0; i < 80; i++) {
      await sleep(3000);
      var job = await lingtu('/aigc/job/result', { jobId: String(jobId) });
      if (job.status === 'succeed') return job;
      if (job.status === 'failed' || job.status === 'canceled') throw new Error(job.message || '灵图任务失败');
    }
    throw new Error('灵图任务超时');
  }
  function rid(item, step) { return (item.goodsId + '-' + step + '-' + Date.now()).slice(0, 100); }

  async function doubao(content) {
    if (!cfg.arkKey) throw new Error('请先在「灵图/AI」里填写豆包 API Key');
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
    var prompt = '你是 Temu 服装上架审核员，要判断能否采集这件 T 恤的印花图案。商品标题：' + item.title +
      '\n请根据标题' + (cfg.aiVision ? '和图片' : '') + '判断，只返回 JSON：{"violation":是否涉及毒品/大麻/色情/暴力/仇恨等违规内容,"ipRisk":是否是迪士尼/三丽鸥/动漫/游戏/影视等知名 IP 或品牌,"doubleSided":是否前后双面印花,"fullPrint":是否满身印花或图案特别满,"notBlack":衣服主体是否不是黑色,"reason":"一句话中文原因"}，布尔值用 true/false。';
    var content = cfg.aiVision
      ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: item.imageUrl } }]
      : prompt;
    var r = await doubao(content);
    var bad = r.violation ? '违规内容' : r.ipRisk ? 'IP/品牌侵权风险' : null;
    if (!bad && cfg.aiVision) bad = r.doubleSided ? '双面印花' : r.fullPrint ? '印花太满' : (cfg.blackOnly && r.notBlack) ? '不是黑色' : null;
    return bad ? bad + (r.reason ? '：' + r.reason : '') : null;
  }

  // ---------- pipeline ----------
  function markSkipped(item, reason) {
    done.add(item.goodsId); GM_setValue('done', Array.from(done));
    records.push({ status: '跳过', reason: reason, country: item.ctx.country.name, source: item.ctx.source, goodsId: item.goodsId, title: item.title, sales: item.salesText, salesCount: item.salesCount, productUrl: item.productUrl, imageUrl: item.imageUrl, time: new Date().toISOString() });
    GM_setValue('records', records);
    stats.skipped++;
    log('跳过 ' + item.goodsId + '：' + reason);
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

    var folder = 'Temu图案/' + ctx.country.name + '_' + safe(ctx.label) + '_' + today() + '/';
    var base = folder + item.salesCount + '_' + item.goodsId;
    var files = [], notes = [];
    if (cfg.saveOriginal) { await download(item.imageUrl, base + '_原图.jpg'); files.push(base + '_原图.jpg'); }

    var crops = [];
    if (cfg.crop) {
      crops = (await lingtuJob('/aigc/detect', { requestId: rid(item, 'crop'), image: item.imageUrl })).urls || [];
      for (var i = 0; i < crops.length; i++) {
        var cn = base + '_裁剪' + (crops.length > 1 ? i + 1 : '') + '.' + extOf(crops[i], 'png');
        await download(crops[i], cn); files.push(cn);
      }
    }
    if (cfg.matting) {
      var sources = crops.length ? crops : [item.imageUrl];
      for (var j = 0; j < sources.length; j++) {
        try {
          var mUrls = (await lingtuJob('/aigc/matting', { requestId: rid(item, 'mat' + j), image: sources[j], enableCrop: true, formats: ['png'] })).urls || [];
          for (var k = 0; k < mUrls.length; k++) {
            var mn = base + '_抠图' + (sources.length > 1 ? j + 1 : '') + (mUrls.length > 1 ? '-' + (k + 1) : '') + '.' + extOf(mUrls[k], 'png');
            await download(mUrls[k], mn); files.push(mn);
          }
        } catch (e) { notes.push('抠图失败：' + e.message); }
      }
    }
    if (cfg.dress) {
      try {
        if (!cfg.stanceId || !cfg.backgroundId) throw new Error('请先在「灵图/AI」里加载并选择形态和背景');
        var dUrls = (await lingtuJob('/aigc/dress', { requestId: rid(item, 'dress'), image: item.imageUrl, type: 'half', stanceId: cfg.stanceId, backgroundId: cfg.backgroundId, ar: cfg.dressAr, num: cfg.dressNum })).urls || [];
        for (var q = 0; q < dUrls.length; q++) {
          var dn = base + '_套图' + (q + 1) + '.' + extOf(dUrls[q], 'png');
          await download(dUrls[q], dn); files.push(dn);
        }
      } catch (e) { notes.push('套图失败：' + e.message); }
    }

    var clean = cleanTitle(item.title), aiTitle = '';
    if (cfg.lingtuTitle) {
      try {
        var prompt = '生成一个' + ctx.country.lang + '的 Temu ' + (cfg.gender === 'men' ? '男士' : '女士') + '短袖 T 恤商品标题，突出图案元素，60-120 个字符。不要出现材质词、尺码、季节词、儿童词、' + (cfg.gender === 'men' ? '女性' : '男性') + '词、促销词和任何品牌/IP 名称。';
        aiTitle = cleanTitle((await lingtuJob('/aigc/title', { requestId: rid(item, 'title'), image: item.imageUrl, prompt: prompt })).text || '');
      } catch (e) { notes.push('标题生成失败：' + e.message); }
    }
    var titleFile = base + '_标题.txt';
    await downloadText(['原标题：' + item.title, '清洗后标题：' + clean, aiTitle ? '灵图标题：' + aiTitle : '', '销量：' + item.salesText, '链接：' + item.productUrl].filter(Boolean).join('\n'), titleFile);
    files.push(titleFile);

    done.add(item.goodsId); GM_setValue('done', Array.from(done));
    records.push({ status: '已保存', reason: notes.join('；'), country: ctx.country.name, source: ctx.source, goodsId: item.goodsId, title: item.title, cleanTitle: clean, aiTitle: aiTitle, sales: item.salesText, salesCount: item.salesCount, productUrl: item.productUrl, imageUrl: item.imageUrl, files: files.join(' | '), time: new Date().toISOString() });
    GM_setValue('records', records);
    notes.forEach(function (n) { log(item.goodsId + ' ' + n, true); });
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
        if (/签名|次数不足|请先|豆包接口/.test(e.message)) { queue.length = 0; pause(); }
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
    var all = extract(), fresh = 0;
    stats.found = Math.max(stats.found, all.length);
    all.forEach(function (x) {
      if (ctx.seen.has(x.goodsId)) return;
      ctx.seen.add(x.goodsId);
      fresh++;
      if (x.salesCount < cfg.minSales) return;
      var hit = findHit(x.title, skipList);
      if (hit) { stats.skipped++; log('跳过 ' + x.goodsId + '：标题含「' + hit + '」'); return; }
      if (cfg.blackOnly && !cfg.pixelCheck && !BLACK_RE.test(x.title)) return;
      x.ctx = ctx;
      x.black = BLACK_RE.test(x.title);
      ctx.candidates.push(x);
      stats.candidates++;
      if (!done.has(x.goodsId)) ctx.backlog.push(x);
    });
    ctx.backlog.sort(function (a, b) { return (b.black - a.black) || (b.salesCount - a.salesCount); });
    render();
    return fresh;
  }
  function clickMore() {
    var els = document.querySelectorAll('button, [role="button"], div, span, a');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].innerText || '').trim();
      if (t.length < 24 && MORE_RE.test(t) && els[i].offsetParent !== null) { els[i].click(); return true; }
    }
    return false;
  }
  async function collectPage(ctx) {
    var idle = 0;
    while (running && ctx.saved < ctx.target) {
      fill(ctx);
      if (ctx.backlog.length) { await sleep(800); continue; }
      if (idle >= 6) { if (!pending()) break; await sleep(800); continue; }
      if (scan(ctx) > 0) { idle = 0; continue; }
      idle++;
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      await sleep(1800 + Math.random() * 1500);
      if (clickMore()) await sleep(1500 + Math.random() * 1200);
    }
    if (!running) queue.length = 0;
    while (pending()) await sleep(800);
    log(ctx.source + '完成：本页保存 ' + ctx.saved + ' 个' + (ctx.saved < ctx.target ? '（没有更多达标商品）' : ''));
  }

  // ---------- multi-page job (survives page navigation) ----------
  function getJob() { return GM_getValue('job', null); }
  function setJob(j) { GM_setValue('job', j); }
  function taskLabel(t) {
    if (t.type === 'search') return countryBy(t.country).name + '搜索「' + t.keyword + '」';
    if (t.type === 'goods') return '商品 ' + t.goodsId + ' → 找店铺';
    if (t.type === 'store') return '店铺 ' + t.mallId;
    return '当前页';
  }
  function taskUrl(t) { return t.type === 'search' ? searchUrl(t.country, t.keyword) : t.url; }
  function onTaskPage(t) {
    if (t.type === 'search') {
      var key = new URLSearchParams(location.search).get('search_key') || '';
      return /search_result/.test(location.pathname) && currentCountry().code === t.country && (t.navigated || key === t.keyword);
    }
    if (t.type === 'goods') return location.pathname.indexOf(t.goodsId) >= 0;
    if (t.type === 'store') return location.href.indexOf(t.mallId) >= 0;
    return location.pathname === t.path;
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
      if (job.visitedStores.indexOf(link.mallId) >= 0) { log('店铺 ' + link.mallId + ' 已采过，跳过'); return; }
      job.visitedStores.push(link.mallId);
      job.tasks.splice(job.idx + 1, 0, { type: 'store', mallId: link.mallId, url: link.url, country: t.country });
      return;
    }
    await waitFor(function () { return extract().length > 0; }, 15000);
    var country = currentCountry();
    var ctx = {
      country: country, saved: 0, backlog: [], seen: new Set(), candidates: [],
      target: t.type === 'store' ? cfg.storeTarget : cfg.target,
      source: t.type === 'store' ? '店铺' + t.mallId : t.type === 'search' ? country.name + '搜索' : '当前页',
      label: t.type === 'search' ? t.keyword : t.type === 'store' ? '店铺' + t.mallId : (new URLSearchParams(location.search).get('search_key') || '当前页')
    };
    await collectPage(ctx);
    if (!running || t.type !== 'search' || !cfg.enterStore) return;
    var picks = ctx.candidates.slice().sort(function (a, b) { return (b.black - a.black) || (b.salesCount - a.salesCount); })
      .filter(function (x) { return job.visitedGoods.indexOf(x.goodsId) < 0; }).slice(0, cfg.storeCount);
    picks.forEach(function (x, i) {
      job.visitedGoods.push(x.goodsId);
      job.tasks.splice(job.idx + 1 + i, 0, { type: 'goods', goodsId: x.goodsId, url: x.productUrl, country: t.country });
    });
    if (picks.length) log('将进入 ' + picks.length + ' 个高销量商品的店铺继续采集');
  }
  async function runJob() {
    var job = getJob();
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
    setJob({ tasks: tasks, idx: 0, paused: false, visitedGoods: [], visitedStores: [] });
    runJob();
  }
  function pause() { running = false; var j = getJob(); if (j) { j.paused = true; setJob(j); } render(); }

  async function recommendCountries() {
    var list = COUNTRIES.map(function (c) { return c.code + '=' + c.name; }).join('，');
    log('正在问豆包哪些国家黑色印花 T 恤卖得好…');
    var r = await doubao('我在 Temu 卖' + (cfg.gender === 'men' ? '男士' : '女士') + '黑色印花短袖 T 恤，想去销量高的国家站点采集爆款图案。请从这些站点里推荐 3-5 个黑色印花 T 恤需求最大的：' + list + '。只返回 JSON：{"countries":["站点代码"],"reason":"一句话中文原因"}');
    var codes = (r.countries || []).map(function (x) { return String(x).toLowerCase(); });
    COUNTRIES.forEach(function (c) { cfg.countries[c.code].on = codes.indexOf(c.code) >= 0; });
    if (!codes.length) cfg.countries.us.on = true;
    save(); syncCountries();
    log('豆包推荐：' + codes.map(function (c) { return countryBy(c).name; }).join('、') + (r.reason ? '。' + r.reason : ''));
  }
  async function loadDressLists() {
    var stances = await lingtu('/aigc/dress/stances', null, 'GET');
    var bgs = await lingtu('/aigc/dress/backgrounds', null, 'GET');
    function opts(list, sel) {
      return (Array.isArray(list) ? list : []).map(function (x) {
        var name = x.name || x.title || x.type || '';
        return '<option value="' + x.id + '"' + (String(x.id) === String(sel) ? ' selected' : '') + '>' + (name ? name + ' · ' : '') + x.id + '</option>';
      }).join('');
    }
    var top = (Array.isArray(stances) ? stances : []).filter(function (x) { return !x.type || x.type === 'top'; });
    $('stanceId').innerHTML = '<option value="">选择形态</option>' + opts(top, cfg.stanceId);
    $('backgroundId').innerHTML = '<option value="">选择背景</option>' + opts(bgs, cfg.backgroundId);
    log('已加载 ' + top.length + ' 个形态、' + (Array.isArray(bgs) ? bgs.length : 0) + ' 个背景');
  }

  function exportCsv() {
    var cols = ['status', 'reason', 'country', 'source', 'goodsId', 'title', 'cleanTitle', 'aiTitle', 'sales', 'salesCount', 'productUrl', 'imageUrl', 'files', 'time'];
    var head = ['状态', '原因/备注', '国家', '来源', '商品ID', '原标题', '清洗后标题', '灵图标题', '销量', '销量数值', '商品链接', '图片链接', '文件', '时间'];
    var rows = [head.join(',')].concat(records.map(function (r) { return cols.map(function (k) { return '"' + String(r[k] == null ? '' : r[k]).replace(/"/g, '""') + '"'; }).join(','); }));
    var url = URL.createObjectURL(new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv' }));
    GM_download({ url: url, name: 'Temu图案/采集记录_' + today() + '.csv', saveAs: false, onload: function () { URL.revokeObjectURL(url); } });
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

  var countryRows = COUNTRIES.map(function (c) {
    return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:5px"><input type="checkbox" data-c="' + c.code + '" aria-label="' + c.name + '"><span style="width:56px;flex:none">' + c.name + '</span><input data-ck="' + c.code + '" aria-label="' + c.name + '关键词" style="' + inputCss + '"></div>';
  }).join('');

  var host = document.createElement('div');
  host.setAttribute('style', 'position:fixed;right:20px;bottom:20px;z-index:2147483647;width:340px;background:' + C.bg + ';color:' + C.text + ';font:13px/1.5 system-ui,"PingFang SC","Microsoft YaHei",sans-serif;border-radius:10px;box-shadow:0 14px 36px rgba(0,0,0,.4);padding:14px');
  host.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><strong style="font-size:14px">爆款图案采集 → 灵图</strong>' +
      '<button data-k="min" aria-label="收起" style="background:none;border:0;color:' + C.dim + ';cursor:pointer;font-size:16px">–</button></div>' +
    '<div data-k="body">' +
      '<div style="display:flex;margin-bottom:10px;border-bottom:1px solid ' + C.line + '">' + tabBtn('main', '采集') + tabBtn('country', '国家') + tabBtn('filter', '过滤') + tabBtn('api', '灵图/AI') + '</div>' +
      '<div style="max-height:52vh;overflow:auto;padding-right:2px">' +
        '<div data-pane="main">' +
          row(field('最低销量', input('minSales', 'type="number" min="1"')), field('每次搜索采集', input('target', 'type="number" min="1"'))) +
          row(field('卖', '<select data-k="gender" style="' + inputCss + '"><option value="men">男装</option><option value="women">女装</option></select>'), field('进店数量', input('storeCount', 'type="number" min="0"'))) +
          row(field('每家店采集', input('storeTarget', 'type="number" min="1"')), '<div style="flex:1"></div>') +
          check('blackOnly', '只要黑色款（同一色系）') +
          check('enterStore', '高销量商品自动进店铺继续采集') +
        '</div>' +
        '<div data-pane="country" style="display:none">' +
          hint('勾选要采集的国家，会按顺序逐个国家搜索。关键词可改。') + countryRows +
          '<button data-k="recommend" style="' + btnCss + ';width:100%;margin-top:4px">问豆包：黑 T 在哪些国家卖得多</button>' +
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
          field('灵图 API 地址', input('apiBase', 'placeholder="https://..."')) +
          row(field('appId', input('appId')), field('secret', input('secret', 'type="password"'))) +
          check('saveOriginal', '保存原图') +
          check('crop', '① 裁剪图案（/aigc/detect）') +
          check('matting', '② 一键抠图，透明 PNG（/aigc/matting）') +
          check('dress', '③ 商品套图：模特试衣（/aigc/dress）') +
          row(field('形态', '<select data-k="stanceId" style="' + inputCss + '"><option value="">先加载列表</option></select>'), field('背景', '<select data-k="backgroundId" style="' + inputCss + '"><option value="">先加载列表</option></select>')) +
          row(field('比例', '<select data-k="dressAr" style="' + inputCss + '"><option>1:1</option><option>3:4</option><option>2:3</option><option>9:16</option></select>'), field('张数', '<select data-k="dressNum" style="' + inputCss + '"><option value="1">1</option><option value="2">2</option><option value="4">4</option></select>')) +
          '<button data-k="loadDress" style="' + linkCss + ';margin-bottom:8px">加载灵图形态 / 背景列表</button>' +
          check('lingtuTitle', '④ 灵图生成新标题（/aigc/title）') +
          '<div style="border-top:1px solid ' + C.line + ';margin:8px 0;padding-top:8px"><strong>豆包（可选）</strong></div>' +
          field('豆包 API Key（火山方舟）', input('arkKey', 'type="password"')) +
          field('模型 / 接入点 ID', input('arkModel')) +
          check('aiCheck', '用豆包审核每个商品（违规词 / IP）') +
          check('aiVision', '审核时看图（双面 / 满印 / 颜色），需视觉模型') +
          '<button data-k="clear" style="' + linkCss + ';margin-top:6px">清空已采集记录（允许重复采集）</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;margin:10px 0 6px"><button data-k="start" style="' + btnCss + ';border:0;background:' + C.blue + ';color:#fff">开始多国采集</button>' +
        '<button data-k="here" style="' + btnCss + '">只采当前页</button></div>' +
      '<div style="display:flex;gap:6px;margin-bottom:6px"><button data-k="store" style="' + btnCss + ';display:none">进入本店采集</button>' +
        '<button data-k="pause" style="' + btnCss + '">暂停</button><button data-k="end" style="' + btnCss + '">结束任务</button><button data-k="csv" style="' + btnCss + '">导出 CSV</button></div>' +
      '<div data-k="job" style="font-size:12px;color:' + C.dim + '"></div>' +
      '<div data-k="stats" style="margin-top:4px;font-family:ui-monospace,monospace;font-size:12px;color:' + C.dim + '"></div>' +
      '<div data-k="log" style="margin-top:6px;max-height:110px;overflow:auto;font-family:ui-monospace,monospace;font-size:11px;color:' + C.dim + '"></div>' +
    '</div>';
  document.body.appendChild(host);
  function $(k) { return host.querySelector('[data-k="' + k + '"]'); }

  function showTab(k) {
    host.querySelectorAll('[data-pane]').forEach(function (p) { p.style.display = p.getAttribute('data-pane') === k ? '' : 'none'; });
    host.querySelectorAll('[data-tab]').forEach(function (b) { b.style.borderBottomColor = b.getAttribute('data-tab') === k ? C.blue : 'transparent'; });
  }
  host.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { showTab(b.getAttribute('data-tab')); }; });
  showTab(lingtuReady() ? 'main' : 'api');

  function syncCountries() {
    COUNTRIES.forEach(function (c) {
      host.querySelector('[data-c="' + c.code + '"]').checked = cfg.countries[c.code].on;
      host.querySelector('[data-ck="' + c.code + '"]').value = cfg.countries[c.code].keyword;
    });
  }
  COUNTRIES.forEach(function (c) {
    host.querySelector('[data-c="' + c.code + '"]').onchange = function (e) { cfg.countries[c.code].on = e.target.checked; save(); };
    host.querySelector('[data-ck="' + c.code + '"]').onchange = function (e) { cfg.countries[c.code].keyword = e.target.value.trim() || c[cfg.gender]; e.target.value = cfg.countries[c.code].keyword; save(); };
  });
  syncCountries();

  ['apiBase', 'appId', 'secret', 'arkKey', 'arkModel', 'skipWords', 'removeWords', 'dressAr'].forEach(function (k) {
    $(k).value = cfg[k];
    $(k).onchange = function () { cfg[k] = $(k).value.trim(); save(); if (/Words$/.test(k)) compileRules(); };
  });
  ['stanceId', 'backgroundId'].forEach(function (k) {
    if (cfg[k]) $(k).innerHTML = '<option value="' + cfg[k] + '">已选 ' + cfg[k] + '</option>';
    $(k).onchange = function () { cfg[k] = $(k).value; save(); };
  });
  ['minSales', 'target', 'storeCount', 'storeTarget', 'darkMin', 'dressNum'].forEach(function (k) {
    $(k).value = cfg[k];
    $(k).onchange = function () { var v = parseInt($(k).value, 10); cfg[k] = isFinite(v) && v >= 0 ? v : DEFAULTS[k]; $(k).value = cfg[k]; save(); };
  });
  ['blackOnly', 'pixelCheck', 'enterStore', 'saveOriginal', 'crop', 'matting', 'dress', 'lingtuTitle', 'aiCheck', 'aiVision'].forEach(function (k) {
    $(k).checked = !!cfg[k];
    $(k).onchange = function () { cfg[k] = $(k).checked; save(); };
  });
  $('gender').value = cfg.gender;
  $('gender').onchange = function () {
    var prev = cfg.gender;
    cfg.gender = $('gender').value;
    COUNTRIES.forEach(function (c) { if (cfg.countries[c.code].keyword === c[prev]) cfg.countries[c.code].keyword = c[cfg.gender]; });
    save(); syncCountries();
  };
  $('resetWords').onclick = function () {
    cfg.skipWords = DEFAULT_SKIP.join('，'); cfg.removeWords = DEFAULT_REMOVE.join('，');
    $('skipWords').value = cfg.skipWords; $('removeWords').value = cfg.removeWords;
    save(); compileRules(); log('已恢复默认词库');
  };
  $('min').onclick = function () { var b = $('body'); b.style.display = b.style.display === 'none' ? '' : 'none'; };
  $('clear').onclick = function () { if (confirm('清空后，之前采集过的商品会被重新采集，确定吗？')) { done.clear(); records = []; GM_setValue('done', []); GM_setValue('records', []); log('已清空采集记录'); } };
  $('recommend').onclick = function () { recommendCountries().catch(function (e) { log(e.message, true); }); };
  $('loadDress').onclick = function () { loadDressLists().catch(function (e) { log(e.message, true); }); };

  function preflight() {
    var needLingtu = cfg.crop || cfg.matting || cfg.dress || cfg.lingtuTitle;
    if (needLingtu && !lingtuReady()) { showTab('api'); log('请先填写灵图 API 设置', true); return false; }
    if (cfg.aiCheck && !cfg.arkKey) { showTab('api'); log('开了豆包审核，请先填写豆包 API Key', true); return false; }
    return true;
  }
  $('start').onclick = function () {
    if (getJob()) { log('已有任务，点「暂停/继续」或先「结束任务」'); return; }
    if (!preflight()) return;
    var tasks = COUNTRIES.filter(function (c) { return cfg.countries[c.code].on; })
      .map(function (c) { return { type: 'search', country: c.code, keyword: cfg.countries[c.code].keyword }; });
    if (!tasks.length) { showTab('country'); log('请至少勾选一个国家', true); return; }
    startJob(tasks);
  };
  $('here').onclick = function () {
    if (getJob()) { log('已有任务，请先「结束任务」'); return; }
    if (!preflight()) return;
    startJob([{ type: 'here', path: location.pathname }]);
  };
  $('store').onclick = function () {
    if (getJob()) { log('已有任务，请先「结束任务」'); return; }
    if (!preflight()) return;
    var link = findStoreLink();
    if (!link) { log('这个页面没找到店铺入口', true); return; }
    startJob([{ type: 'store', mallId: link.mallId, url: link.url, country: currentCountry().code }]);
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
    $('stats').textContent = currentCountry().name + ' · 识别 ' + stats.found + ' · 达标 ' + stats.candidates + ' · 跳过 ' + stats.skipped + ' · 保存 ' + stats.saved + ' · 失败 ' + stats.failed + ' · 排队 ' + pending() + ' · 累计 ' + done.size;
  }

  compileRules();
  render();
  log('就绪 · 当前站点：' + currentCountry().name + (isStorePage() ? '（店铺页）' : isGoodsPage() ? '（商品页）' : ''));
  if (getJob()) setTimeout(runJob, 2500);
})();
`

export function buildUserscript() {
  const body = COLLECTOR_BODY.replace('__COUNTRIES__', () => JSON.stringify(COUNTRIES))
    .replace('__SKIP__', () => JSON.stringify(DEFAULT_SKIP_WORDS))
    .replace('__REMOVE__', () => JSON.stringify(DEFAULT_REMOVE_WORDS))
  return [
    '// ==UserScript==',
    '// @name         Temu 爆款图案采集 → 灵图',
    '// @namespace    temu-lingtu-collector',
    '// @version      3.0.0',
    '// @description  多国家采集 Temu 高销量黑色 T 恤图案，过滤违规词/双面/满印，进店继续采，灵图裁剪+抠图+套图，保存到电脑',
    '// @match        https://www.temu.com/*',
    '// @match        https://*.temu.com/*',
    '// @grant        GM_xmlhttpRequest',
    '// @grant        GM_download',
    '// @grant        GM_getValue',
    '// @grant        GM_setValue',
    '// @connect      *',
    '// @run-at       document-idle',
    '// ==/UserScript==',
    '',
    body,
  ].join('\n')
}
