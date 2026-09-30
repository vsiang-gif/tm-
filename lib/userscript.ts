// Runs entirely inside the user's own logged-in browser on temu.com (Tampermonkey).
// Kept as a plain-JS string so it ships verbatim, independent of the Next.js bundler.
export const COUNTRIES = [
  { code: 'us', name: '美国', prefix: '', keyword: 'black graphic t shirt men' },
  { code: 'uk', name: '英国', prefix: 'uk', keyword: 'black graphic t shirt men' },
  { code: 'ca', name: '加拿大', prefix: 'ca', keyword: 'black graphic t shirt men' },
  { code: 'au', name: '澳大利亚', prefix: 'au', keyword: 'black graphic t shirt men' },
  { code: 'de', name: '德国', prefix: 'de', keyword: 'schwarzes t-shirt herren print' },
  { code: 'fr', name: '法国', prefix: 'fr', keyword: 't-shirt noir homme imprimé' },
  { code: 'it', name: '意大利', prefix: 'it', keyword: 'maglietta nera uomo stampa' },
  { code: 'es', name: '西班牙', prefix: 'es', keyword: 'camiseta negra hombre estampada' },
  { code: 'mx', name: '墨西哥', prefix: 'mx', keyword: 'playera negra hombre estampada' },
  { code: 'jp', name: '日本', prefix: 'jp', keyword: 'tシャツ 黒 メンズ プリント' },
] as const

const COLLECTOR_BODY = String.raw`
(function () {
  'use strict';
  if (window.top !== window.self || window.__temuPatternCollector) return;
  window.__temuPatternCollector = true;

  var COUNTRIES = __COUNTRIES__;
  var MULT = { '万': 10000, 'w': 10000, 'W': 10000, '千': 1000, 'k': 1000, 'K': 1000, 'm': 1000000, 'M': 1000000 };
  var SOLD_WORDS = '(?:sold|verkauft|vendus?|vendidos?|venduti|verkocht|sprzedano|販売済み?|点販売|已售|售出|件已售)';
  var SALES_RES = [
    new RegExp('(\\d[\\d.,]*)\\s*(万|千|[kKwWmM])?\\s*\\+?\\s*(?:件|个|点)?\\s*' + SOLD_WORDS, 'i'),
    new RegExp(SOLD_WORDS + '\\s*(\\d[\\d.,]*)\\s*(万|千|[kKwWmM])?\\s*\\+?', 'i')
  ];
  var MORE_RE = /^(查看更多|显示更多|更多商品|加载更多|See more|Show more|Load more|View more|Mehr anzeigen|Voir plus|Ver más|Mostra altro|もっと見る)/i;
  var BLACK_RE = /黑|black|schwarz|noir|negr[ao]|ner[ao]|zwart|czarn|黒|ブラック/i;

  var DEFAULTS = { apiBase: '', appId: '', secret: '', minSales: 100, target: 100, blackOnly: true, crop: true, saveOriginal: true, country: 'us', keyword: '' };
  var cfg = Object.assign({}, DEFAULTS, GM_getValue('cfg', {}));
  var done = new Set(GM_getValue('done', []));
  var records = GM_getValue('records', []);
  var queue = [], queued = new Set(), running = false, working = 0;
  var stats = { found: 0, qualified: 0, saved: 0, failed: 0 };

  function save() { GM_setValue('cfg', cfg); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function safe(s) { return String(s).replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40); }

  function currentCountry() {
    var seg = location.pathname.split('/')[1] || '';
    for (var i = 0; i < COUNTRIES.length; i++) if (COUNTRIES[i].prefix && COUNTRIES[i].prefix === seg) return COUNTRIES[i];
    return COUNTRIES[0];
  }
  function countryBy(code) { for (var i = 0; i < COUNTRIES.length; i++) if (COUNTRIES[i].code === code) return COUNTRIES[i]; return COUNTRIES[0]; }

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

  // ---------- Lingtu API ----------
  async function sha256Hex(s) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function gmRequest(opts) {
    return new Promise(function (resolve, reject) {
      GM_xmlhttpRequest(Object.assign({ timeout: 60000 }, opts, {
        onload: resolve,
        onerror: function () { reject(new Error('网络错误')); },
        ontimeout: function () { reject(new Error('请求超时')); }
      }));
    });
  }
  async function lingtu(uri, body) {
    if (!cfg.apiBase || !cfg.appId || !cfg.secret) throw new Error('请先在「设置」里填写灵图 API 地址 / appId / secret');
    var salt = crypto.randomUUID(), timestamp = String(Math.floor(Date.now() / 1000));
    var sign = await sha256Hex(cfg.appId + uri + salt + timestamp + cfg.secret);
    var r = await gmRequest({
      method: 'POST', url: cfg.apiBase.replace(/\/+$/, '') + uri,
      headers: { 'content-type': 'application/json', appId: cfg.appId, salt: salt, timestamp: timestamp, sign: sign },
      data: JSON.stringify(body)
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
  async function cropPattern(imageUrl, requestId) {
    var res = await lingtu('/aigc/detect', { requestId: requestId, image: imageUrl });
    var jobId = typeof res === 'string' ? res : res && res.jobId;
    if (!jobId) throw new Error('灵图未返回任务 ID');
    for (var i = 0; i < 60; i++) {
      await sleep(3000);
      var job = await lingtu('/aigc/job/result', { jobId: String(jobId) });
      if (job.status === 'succeed') return job.urls || [];
      if (job.status === 'failed' || job.status === 'canceled') throw new Error(job.message || '裁剪失败');
    }
    throw new Error('裁剪超时');
  }

  function download(url, name) {
    return new Promise(function (resolve, reject) {
      GM_download({ url: url, name: name, saveAs: false, onload: resolve, onerror: function (e) { reject(new Error('下载失败：' + (e && e.error || ''))); }, ontimeout: function () { reject(new Error('下载超时')); } });
    });
  }

  // ---------- pipeline ----------
  async function processItem(item) {
    var c = currentCountry();
    var folder = 'Temu图案/' + c.name + '_' + safe(cfg.keyword || new URLSearchParams(location.search).get('search_key') || 'search') + '_' + today() + '/';
    var base = folder + item.salesCount + '_' + item.goodsId;
    var files = [];
    if (cfg.saveOriginal) { await download(item.imageUrl, base + '_原图.jpg'); files.push(base + '_原图.jpg'); }
    if (cfg.crop) {
      var urls = await cropPattern(item.imageUrl, item.goodsId + '-' + Date.now());
      for (var i = 0; i < urls.length; i++) {
        var ext = (urls[i].split('?')[0].match(/\.(png|jpe?g|webp)$/i) || [0, 'png'])[1];
        var name = base + '_裁剪' + (urls.length > 1 ? i + 1 : '') + '.' + ext;
        await download(urls[i], name); files.push(name);
      }
    }
    done.add(item.goodsId); GM_setValue('done', Array.from(done));
    records.push({ country: c.name, goodsId: item.goodsId, title: item.title, sales: item.salesText, salesCount: item.salesCount, productUrl: item.productUrl, imageUrl: item.imageUrl, files: files.join(' | '), time: new Date().toISOString() });
    GM_setValue('records', records);
  }

  async function worker() {
    working++;
    while (queue.length) {
      var item = queue.shift();
      try { await processItem(item); stats.saved++; log('已保存 ' + item.goodsId + '（' + item.salesText + '）'); }
      catch (e) { stats.failed++; log('失败 ' + item.goodsId + '：' + e.message, true); if (/签名|次数不足|请先/.test(e.message)) { queue.length = 0; running = false; } }
      render();
    }
    working--;
    render();
  }
  function enqueue(items) {
    items.forEach(function (x) { if (!queued.has(x.goodsId) && !done.has(x.goodsId)) { queued.add(x.goodsId); queue.push(x); } });
    while (working < 2 && queue.length) worker();
  }

  function scan() {
    var all = extract();
    var ok = all.filter(function (x) { return x.salesCount >= cfg.minSales && (!cfg.blackOnly || BLACK_RE.test(x.title)); });
    stats.found = all.length; stats.qualified = ok.length;
    var before = queued.size;
    enqueue(ok);
    render();
    return queued.size - before;
  }
  function clickMore() {
    var els = document.querySelectorAll('button, [role="button"], div, span, a');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].innerText || '').trim();
      if (t.length < 24 && MORE_RE.test(t) && els[i].offsetParent !== null) { els[i].click(); return true; }
    }
    return false;
  }
  async function autoRun() {
    running = true; render();
    var idle = 0;
    while (running && queued.size < cfg.target && idle < 6) {
      idle = scan() > 0 ? 0 : idle + 1;
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      await sleep(1800 + Math.random() * 1500);
      if (clickMore()) await sleep(1500 + Math.random() * 1200);
    }
    running = false;
    log(queued.size >= cfg.target ? '已达到目标数量，等待剩余裁剪完成' : '页面没有更多达标商品了');
    render();
  }

  function exportCsv() {
    var cols = ['country', 'goodsId', 'title', 'sales', 'salesCount', 'productUrl', 'imageUrl', 'files', 'time'];
    var rows = [cols.join(',')].concat(records.map(function (r) { return cols.map(function (k) { return '"' + String(r[k] == null ? '' : r[k]).replace(/"/g, '""') + '"'; }).join(','); }));
    var url = URL.createObjectURL(new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv' }));
    GM_download({ url: url, name: 'Temu图案/采集记录_' + today() + '.csv', saveAs: false, onload: function () { URL.revokeObjectURL(url); } });
  }

  // ---------- panel ----------
  var C = { bg: '#161616', panel: '#202020', line: '#343434', text: '#f1f1ec', dim: '#a3a39c', blue: '#2f55e4', red: '#ff7a6b' };
  var inputCss = 'width:100%;box-sizing:border-box;padding:5px 7px;border-radius:5px;border:1px solid ' + C.line + ';background:' + C.panel + ';color:inherit;font:inherit';
  var btnCss = 'flex:1;padding:8px;border-radius:6px;border:1px solid ' + C.line + ';background:' + C.panel + ';color:inherit;cursor:pointer;font:inherit';
  var host = document.createElement('div');
  host.setAttribute('style', 'position:fixed;right:20px;bottom:20px;z-index:2147483647;width:300px;background:' + C.bg + ';color:' + C.text + ';font:13px/1.5 system-ui,"PingFang SC","Microsoft YaHei",sans-serif;border-radius:10px;box-shadow:0 14px 36px rgba(0,0,0,.4);padding:14px');
  var opts = COUNTRIES.map(function (c) { return '<option value="' + c.code + '">' + c.name + '</option>'; }).join('');
  host.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><strong style="font-size:14px">爆款图案采集 → 灵图</strong>' +
      '<span><button data-k="gear" style="background:none;border:0;color:' + C.dim + ';cursor:pointer;font:inherit">设置</button>' +
      '<button data-k="min" aria-label="收起" style="background:none;border:0;color:' + C.dim + ';cursor:pointer;font-size:16px;margin-left:6px">–</button></span></div>' +
    '<div data-k="body">' +
      '<div data-k="settings" style="display:none;border:1px solid ' + C.line + ';border-radius:8px;padding:10px;margin-bottom:10px">' +
        '<label style="display:block;margin-bottom:6px">灵图 API 地址<input data-k="apiBase" placeholder="https://..." style="' + inputCss + '"></label>' +
        '<label style="display:block;margin-bottom:6px">appId<input data-k="appId" style="' + inputCss + '"></label>' +
        '<label style="display:block;margin-bottom:6px">secret<input data-k="secret" type="password" style="' + inputCss + '"></label>' +
        '<label style="display:flex;gap:6px;align-items:center"><input data-k="saveOriginal" type="checkbox">同时保存原图</label>' +
        '<label style="display:flex;gap:6px;align-items:center"><input data-k="crop" type="checkbox">调用灵图裁剪图案</label>' +
        '<button data-k="clear" style="margin-top:8px;background:none;border:0;color:' + C.dim + ';cursor:pointer;padding:0;font:inherit;text-decoration:underline">清空已采集记录（允许重复采集）</button>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:6px"><label style="flex:1">国家<select data-k="country" style="' + inputCss + '">' + opts + '</select></label>' +
        '<label style="flex:1">最低销量<input data-k="minSales" type="number" min="1" style="' + inputCss + '"></label></div>' +
      '<label style="display:block;margin-bottom:6px">搜索关键词<input data-k="keyword" style="' + inputCss + '"></label>' +
      '<div style="display:flex;gap:8px;align-items:end;margin-bottom:10px"><label style="flex:1">目标数量<input data-k="target" type="number" min="1" style="' + inputCss + '"></label>' +
        '<label style="flex:1;display:flex;gap:6px;align-items:center;padding-bottom:6px"><input data-k="blackOnly" type="checkbox">只要黑色款</label></div>' +
      '<div style="display:flex;gap:6px;margin-bottom:6px"><button data-k="search" style="' + btnCss + '">切换国家并搜索</button>' +
        '<button data-k="auto" style="' + btnCss + ';border:0;background:' + C.blue + ';color:#fff">开始采集</button></div>' +
      '<button data-k="csv" style="' + btnCss + ';width:100%">导出采集记录 CSV</button>' +
      '<div data-k="stats" style="margin-top:10px;font-family:ui-monospace,monospace;font-size:12px;color:' + C.dim + '"></div>' +
      '<div data-k="log" style="margin-top:6px;max-height:110px;overflow:auto;font-family:ui-monospace,monospace;font-size:11px;color:' + C.dim + '"></div>' +
    '</div>';
  document.body.appendChild(host);
  function $(k) { return host.querySelector('[data-k="' + k + '"]'); }

  var here = currentCountry();
  if (!cfg.keyword || cfg.country !== here.code && /search_result/.test(location.pathname)) { cfg.country = here.code; }
  if (!cfg.keyword) cfg.keyword = countryBy(cfg.country).keyword;

  ['apiBase', 'appId', 'secret', 'keyword'].forEach(function (k) { $(k).value = cfg[k]; $(k).onchange = function () { cfg[k] = $(k).value.trim(); save(); }; });
  ['minSales', 'target'].forEach(function (k) { $(k).value = cfg[k]; $(k).onchange = function () { cfg[k] = Math.max(1, parseInt($(k).value, 10) || DEFAULTS[k]); $(k).value = cfg[k]; save(); }; });
  ['blackOnly', 'crop', 'saveOriginal'].forEach(function (k) { $(k).checked = !!cfg[k]; $(k).onchange = function () { cfg[k] = $(k).checked; save(); }; });
  $('country').value = cfg.country;
  $('country').onchange = function () { cfg.country = $('country').value; cfg.keyword = countryBy(cfg.country).keyword; $('keyword').value = cfg.keyword; save(); };
  $('min').onclick = function () { var b = $('body'); b.style.display = b.style.display === 'none' ? '' : 'none'; };
  $('gear').onclick = function () { var s = $('settings'); s.style.display = s.style.display === 'none' ? '' : 'none'; };
  if (!cfg.apiBase || !cfg.appId || !cfg.secret) $('settings').style.display = '';
  $('clear').onclick = function () { if (confirm('清空后，之前采集过的商品会被重新采集，确定吗？')) { done.clear(); records = []; GM_setValue('done', []); GM_setValue('records', []); log('已清空采集记录'); } };
  $('search').onclick = function () {
    save();
    var c = countryBy(cfg.country);
    location.href = 'https://www.temu.com/' + (c.prefix ? c.prefix + '/' : '') + 'search_result.html?search_key=' + encodeURIComponent(cfg.keyword);
  };
  $('auto').onclick = function () {
    if (running) { running = false; render(); return; }
    if (!/search_result/.test(location.pathname)) { log('请先点「切换国家并搜索」进入搜索结果页', true); return; }
    if (cfg.crop && (!cfg.apiBase || !cfg.appId || !cfg.secret)) { $('settings').style.display = ''; log('请先填写灵图 API 设置', true); return; }
    autoRun();
  };
  $('csv').onclick = exportCsv;

  function log(msg, err) {
    var line = document.createElement('div');
    line.textContent = new Date().toTimeString().slice(0, 8) + ' ' + msg;
    if (err) line.style.color = C.red;
    $('log').prepend(line);
    while ($('log').childNodes.length > 60) $('log').lastChild.remove();
  }
  function render() {
    $('auto').textContent = running ? '停止滚动' : '开始采集';
    $('stats').textContent = '当前：' + currentCountry().name + ' · 识别 ' + stats.found + ' · 达标 ' + stats.qualified + ' · 已保存 ' + stats.saved + ' · 失败 ' + stats.failed + ' · 排队 ' + (queue.length + working) + ' · 累计 ' + done.size;
  }
  render();
  log(here.code === cfg.country ? '就绪 · 当前站点：' + here.name : '当前站点是' + here.name + '，可点「切换国家并搜索」');
})();
`

export function buildUserscript() {
  return [
    '// ==UserScript==',
    '// @name         Temu 爆款图案采集 → 灵图',
    '// @namespace    temu-lingtu-collector',
    '// @version      2.0.0',
    '// @description  在 Temu 搜索页采集销量达标的黑色 T 恤图案，调用灵图 API 自动裁剪并保存到电脑',
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
    COLLECTOR_BODY.replace('__COUNTRIES__', JSON.stringify(COUNTRIES)),
  ].join('\n')
}
