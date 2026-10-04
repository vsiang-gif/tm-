// Tiny zero-dependency Node server that every collector on the same LAN shares as one dedupe store.
// The body is a String.raw template: it must never contain backticks or a dollar-brace sequence.
const SERVER = String.raw`#!/usr/bin/env node
// 爆款图案采集 · 局域网共享去重库
// 用法：在局域网里任意一台电脑上安装 Node.js，然后运行：node lan-dedupe-server.js
// 其他电脑在脚本面板「豆包/去重」里填写本机显示的地址，例如 http://192.168.1.10:8787
'use strict';
var http = require('http');
var fs = require('fs');
var os = require('os');
var path = require('path');

var PORT = parseInt(process.env.PORT || process.argv[2] || '8787', 10);
var DB_FILE = path.join(__dirname, 'lan-dedupe-db.json');
var HAMMING_MAX = 5;

var db = { keys: {}, hashes: [] };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))); } catch (e) {}

var dirty = false;
function persist() {
  if (!dirty) return;
  dirty = false;
  var tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, DB_FILE);
}
setInterval(persist, 2000);
process.on('SIGINT', function () { persist(); process.exit(0); });

function bits(h) {
  var c = 0;
  for (var i = 0; i < h.length; i++) { var n = parseInt(h[i], 16); while (n) { c += n & 1; n >>= 1; } }
  return c;
}
function hamming(a, b) {
  var d = 0;
  for (var i = 0; i < 16; i++) { var x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { d += x & 1; x >>= 1; } }
  return d;
}
function validHash(h) { return typeof h === 'string' && /^[0-9a-f]{16}$/i.test(h) && bits(h) >= 8 && bits(h) <= 56; }
function similar(h) {
  if (!validHash(h)) return null;
  for (var i = 0; i < db.hashes.length; i++) if (hamming(h, db.hashes[i].h) <= HAMMING_MAX) return db.hashes[i];
  return null;
}

function send(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(obj));
}

var routes = {
  '/ping': function () { return { ok: true, keys: Object.keys(db.keys).length, hashes: db.hashes.length }; },
  '/check': function (b) {
    var k = db.keys[b.key];
    if (k) return { known: true, reason: k.device + ' 已采过' };
    var t = b.hash ? similar(b.hash) : null;
    if (t) return { known: true, reason: '图案和 ' + t.device + ' 采过的 ' + t.k + ' 几乎一样' };
    return { known: false };
  },
  '/claim': function (b) {
    if (!b.key) return { ok: false, reason: '缺少 key' };
    var k = db.keys[b.key];
    if (k) return { ok: false, reason: k.device + ' 已采过' };
    var t = b.hash ? similar(b.hash) : null;
    if (t) return { ok: false, reason: '图案和 ' + t.device + ' 采过的 ' + t.k + ' 几乎一样' };
    var device = String(b.device || '未知设备').slice(0, 40);
    db.keys[b.key] = { device: device, t: Date.now() };
    if (validHash(b.hash)) db.hashes.push({ h: b.hash.toLowerCase(), k: b.key, device: device });
    dirty = true;
    return { ok: true };
  },
  '/release': function (b) {
    if (db.keys[b.key]) {
      delete db.keys[b.key];
      db.hashes = db.hashes.filter(function (x) { return x.k !== b.key; });
      dirty = true;
    }
    return { ok: true };
  },
  '/import': function (b) {
    var n = 0, device = String(b.device || '导入').slice(0, 40);
    (b.keys || []).forEach(function (key) { if (!db.keys[key]) { db.keys[key] = { device: device, t: Date.now() }; n++; } });
    (b.hashes || []).forEach(function (x) { if (x && validHash(x.h) && !similar(x.h)) db.hashes.push({ h: x.h.toLowerCase(), k: x.k, device: device }); });
    dirty = true;
    return { ok: true, added: n };
  }
};

http.createServer(function (req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  var route = routes[req.url.split('?')[0]];
  if (!route) return send(res, 404, { ok: false, reason: '没有这个接口' });
  var body = '';
  req.on('data', function (c) { body += c; if (body.length > 20e6) req.destroy(); });
  req.on('end', function () {
    var data = {};
    try { data = body ? JSON.parse(body) : {}; } catch (e) { return send(res, 400, { ok: false, reason: 'JSON 格式错误' }); }
    try { send(res, 200, route(data)); } catch (e) { send(res, 500, { ok: false, reason: e.message }); }
  });
}).listen(PORT, '0.0.0.0', function () {
  console.log('局域网去重库已启动，已记录 ' + Object.keys(db.keys).length + ' 个商品，' + db.hashes.length + ' 个图案指纹');
  console.log('请在每台电脑的脚本面板「豆包/去重」里填写下面任意一个地址：');
  var nets = os.networkInterfaces();
  Object.keys(nets).forEach(function (n) {
    nets[n].forEach(function (a) { if (a.family === 'IPv4' || a.family === 4) if (!a.internal) console.log('  http://' + a.address + ':' + PORT); });
  });
  console.log('数据保存在：' + DB_FILE + '（不要关闭这个窗口）');
});
`

export function buildLanServer() {
  return SERVER
}
