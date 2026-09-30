// The collector runs inside the user's own browser on temu.com (Tampermonkey).
// It is kept as a plain-JS string so it is shipped verbatim, independent of the Next.js bundler.
const COLLECTOR_BODY = String.raw`
(function () {
  'use strict';
  if (window.__temuPatternCollector) return;
  window.__temuPatternCollector = true;

  var sent = new Set();
  var running = false;
  var MULT = { '万': 10000, 'w': 10000, 'W': 10000, '千': 1000, 'k': 1000, 'K': 1000 };
  var SALES_RES = [
    /(\d[\d.,]*)\s*(万|千|[kKwW])?\s*\+?\s*(?:件|个)?\s*(?:sold|已售|售出)/i,
    /(?:已售|销量|售出)\s*(\d[\d.,]*)\s*(万|千|[kKwW])?\s*\+?/
  ];
  var MORE_RE = /^(查看更多|显示更多|更多商品|加载更多|See more|Show more|Load more|View more)/i;
  var BLACK_RE = /黑|black/i;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function parseSales(text) {
    for (var i = 0; i < SALES_RES.length; i++) {
      var m = text.match(SALES_RES[i]);
      if (m) {
        var n = parseFloat(m[1].replace(/,/g, ''));
        if (!isFinite(n)) continue;
        return { text: m[0].replace(/\s+/g, ' ').trim(), count: Math.round(n * (MULT[m[2]] || 1)) };
      }
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
      if (g && !ids[g]) { ids[g] = 1; n++; if (n > 1) return n; }
    }
    return n;
  }

  function findCard(a) {
    var el = a;
    for (var i = 0; i < 9 && el && el !== document.body; i++) {
      if (el.querySelector && el.querySelector('img') && parseSales(el.innerText || '')) {
        return distinctGoods(el) <= 1 ? el : null;
      }
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
      var sales = parseSales(card.innerText || '');
      var img = pickImage(card);
      if (!sales || !img) continue;
      var lines = (card.innerText || '').split('\n').filter(function (l) { return l.trim().length > 8; });
      var title = (img.alt || a.getAttribute('title') || a.getAttribute('aria-label') || lines[0] || 'Temu 商品').trim().slice(0, 300);
      var u = new URL(a.href, location.href);
      out.push({
        goodsId: id, title: title, productUrl: 'https://' + u.hostname + u.pathname,
        imageUrl: img.src, salesText: sales.text, salesCount: sales.count
      });
    }
    return out;
  }

  function post(items) {
    return new Promise(function (resolve, reject) {
      GM_xmlhttpRequest({
        method: 'POST',
        url: CONFIG.origin + '/api/collect',
        headers: { 'content-type': 'application/json', 'x-collector-token': CONFIG.token },
        data: JSON.stringify({ keyword: new URLSearchParams(location.search).get('search_key') || '', items: items }),
        timeout: 30000,
        onload: function (r) {
          if (r.status >= 200 && r.status < 300) { try { resolve(JSON.parse(r.responseText)); } catch (e) { resolve({}); } }
          else reject(new Error('HTTP ' + r.status + ' ' + (r.responseText || '').slice(0, 120)));
        },
        onerror: function () { reject(new Error('网络错误，无法连接采集台')); },
        ontimeout: function () { reject(new Error('请求超时')); }
      });
    });
  }

  // ---------- panel ----------
  var panel = document.createElement('div');
  panel.setAttribute('style', 'position:fixed;right:20px;bottom:20px;z-index:2147483647;width:280px;background:#141414;color:#f2f2ef;font:13px/1.5 system-ui,sans-serif;border-radius:8px;box-shadow:0 12px 32px rgba(0,0,0,.35);padding:14px;');
  panel.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
      '<strong style="font-size:14px">爆款图案采集器</strong>' +
      '<button data-k="min" style="background:none;border:0;color:#9a9a94;cursor:pointer;font-size:16px" aria-label="收起">–</button>' +
    '</div>' +
    '<div data-k="body">' +
      '<label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">最低销量' +
        '<input data-k="minSales" type="number" min="1" value="100" style="width:90px;padding:3px 6px;border-radius:4px;border:1px solid #3a3a36;background:#1f1f1d;color:inherit"></label>' +
      '<label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">目标数量' +
        '<input data-k="target" type="number" min="1" value="200" style="width:90px;padding:3px 6px;border-radius:4px;border:1px solid #3a3a36;background:#1f1f1d;color:inherit"></label>' +
      '<label style="display:flex;gap:6px;align-items:center;margin-bottom:10px"><input data-k="black" type="checkbox"> 标题须含“黑 / black”</label>' +
      '<div style="display:flex;gap:6px">' +
        '<button data-k="once" style="flex:1;padding:7px;border-radius:5px;border:1px solid #3a3a36;background:#1f1f1d;color:inherit;cursor:pointer">采集本页</button>' +
        '<button data-k="auto" style="flex:1;padding:7px;border-radius:5px;border:0;background:#2b4bdb;color:#fff;cursor:pointer">自动滚动采集</button>' +
      '</div>' +
      '<div data-k="status" style="margin-top:10px;color:#b8b8b2;font-family:ui-monospace,monospace;font-size:12px">就绪 · 请先在 Temu 搜索黑色T恤</div>' +
    '</div>';
  document.body.appendChild(panel);
  function $(k) { return panel.querySelector('[data-k="' + k + '"]'); }
  function status(t) { $('status').textContent = t; }
  $('min').onclick = function () { var b = $('body'); b.style.display = b.style.display === 'none' ? '' : 'none'; };

  async function collectOnce() {
    var minSales = Math.max(1, parseInt($('minSales').value, 10) || 100);
    var blackOnly = $('black').checked;
    var all = extract();
    var qualified = all.filter(function (x) { return x.salesCount >= minSales && (!blackOnly || BLACK_RE.test(x.title)); });
    var fresh = qualified.filter(function (x) { return !sent.has(x.goodsId); });
    for (var i = 0; i < fresh.length; i += 50) {
      var chunk = fresh.slice(i, i + 50);
      await post(chunk);
      chunk.forEach(function (x) { sent.add(x.goodsId); });
    }
    status('识别 ' + all.length + ' · 达标 ' + qualified.length + ' · 已提交 ' + sent.size);
    return fresh.length;
  }

  function clickMore() {
    var els = document.querySelectorAll('button, [role="button"], div, span, a');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].innerText || '').trim();
      if (t.length < 20 && MORE_RE.test(t) && els[i].offsetParent !== null) { els[i].click(); return true; }
    }
    return false;
  }

  $('once').onclick = async function () {
    try { await collectOnce(); } catch (e) { status('失败：' + e.message); }
  };

  $('auto').onclick = async function () {
    if (running) { running = false; $('auto').textContent = '自动滚动采集'; return; }
    running = true; $('auto').textContent = '停止';
    var target = Math.max(1, parseInt($('target').value, 10) || 200), idle = 0;
    try {
      while (running && sent.size < target && idle < 6) {
        var added = await collectOnce();
        idle = added > 0 ? 0 : idle + 1;
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        await sleep(1500 + Math.random() * 1200);
        if (clickMore()) await sleep(1500 + Math.random() * 1000);
      }
      status('完成 · 共提交 ' + sent.size + ' 个图案');
    } catch (e) { status('失败：' + e.message); }
    running = false; $('auto').textContent = '自动滚动采集';
  };
})();
`

export function buildUserscript({ origin, token }: { origin: string; token: string }) {
  const host = new URL(origin).hostname
  return [
    '// ==UserScript==',
    '// @name         Temu 爆款图案采集器',
    '// @namespace    temu-pattern-collector',
    '// @version      1.0.0',
    '// @description  采集 Temu 搜索结果中销量达标的 T 恤图案，自动送入灵图裁剪',
    '// @match        https://www.temu.com/*',
    '// @match        https://*.temu.com/*',
    '// @grant        GM_xmlhttpRequest',
    `// @connect      ${host}`,
    '// @run-at       document-idle',
    '// ==/UserScript==',
    '',
    `var CONFIG = ${JSON.stringify({ origin, token })};`,
    COLLECTOR_BODY,
  ].join('\n')
}
