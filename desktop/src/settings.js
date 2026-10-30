// Mirrors the userscript's five panel tabs and DEFAULTS; values live in the same `cfg` object the script reads.
const CATS = {
  cotton: { name: '纯棉T', look: '纯棉 T：面料颜色均匀、平整挺括，纯黑或纯白，没有褪色、斑驳或雪花纹理。标题带「水洗/acid wash/做旧」的会跳过。' },
  washed: { name: '水洗T', look: '水洗 / 做旧 T 恤：面料有明显的褪色、斑驳、雪花或云朵状纹理，颜色不均匀，常见炭灰、复古黑、褪色黑。', kws: 'acid wash graphic t shirt men\nvintage washed graphic tee\n水洗做旧印花T恤男' },
  vest: { name: '纯棉马甲背心', look: '纯棉无袖背心 / 马甲：没有袖子，肩带或宽肩无袖款，棉质面料，纯黑或纯白。', kws: 'black graphic tank top men\ncotton sleeveless graphic tee\n印花无袖背心男' },
  puffer: { name: '黑色羽绒服', look: '黑色羽绒服 / 棉服：有明显的绗缝格子或鼓起的填充感，面料多为尼龙、有光泽，整体为黑色。', kws: 'black puffer jacket men print\nblack down jacket graphic\n黑色印花羽绒服' },
}
const CAT_OPTIONS = Object.entries(CATS).map(([v, c]) => [v, c.name])

const PLATFORMS = (window.desktop.platforms() || { platforms: [] }).platforms
const ALL_SITES = PLATFORMS.flatMap((p) => p.sites.map((s) => ({ ...s, p: p.id })))

const chk = (k, d, label, hint) => ({ k, t: 'check', d, label, hint })
const num = (k, d, label, extra) => ({ k, t: 'number', d, label, min: 0, ...extra })
const txt = (k, d, label, extra) => ({ k, t: 'text', d, label, ...extra })
const act = (...items) => ({ t: 'actions', items })
const row = (...fields) => ({ t: 'row', fields })
const hint = (text) => ({ t: 'hint', text })
const head = (text) => ({ t: 'head', text })

const TASK_BAR = act(['start', '开始多站点采集', 'primary'], ['here', '只采当前页'], ['pause', '暂停 / 继续'], ['end', '结束任务'], ['csv', '导出 CSV'])

const GROUPS = [
  {
    id: 'main',
    name: '采集',
    fields: [
      row(num('minSales', 300, '最低销量/评价数'), num('target', 9999, '每次搜索采集', { min: 1 })),
      row(
        { k: 'gender', t: 'select', d: 'men', label: '卖', options: [['men', '男装'], ['women', '女装']] },
        num('storeCount', 999, '进店数量', { min: 1 }),
      ),
      row(num('storeTarget', 9999, '每家店采集', { min: 1 }), num('maxPages', 999, '最多翻页', { min: 1 })),
      chk('userFirst', false, '把我当前搜索框里的关键词排在第一个（也会先重新搜索再采）'),
      chk('enterStore', true, '高销量商品自动进店铺采集，采完退出店铺继续'),
      row(num('storeMinSales', 500, '进店销量门槛（≥）'), null),
      head('服饰品类'),
      { k: 'category', t: 'select', d: 'cotton', label: '品类', options: CAT_OPTIONS },
      { t: 'catInfo' },
      chk('blackOnly', true, '只要指定颜色款（按品类 / 颜色模式过滤）'),
      {
        k: 'colorMode', t: 'select', d: 'black', label: '颜色模式（所有品类通用）',
        options: [['black', '只采黑色'], ['white', '只采白色'], ['rotate', '轮换：先黑色再白色']],
      },
      row(num('blackCount', 0, '每站黑 T 采集（张）'), num('whiteCount', 0, '每站白 T 采集（张）')),
      hint('轮换模式：每个站点先用黑 T 关键词采够设定张数，再自动换成白 T 关键词（自动把 black/schwarz/noir/黑 等换成 white/weiß/blanc/白）。0 = 不限。'),
      hint('Etsy / Amazon 卡片不显示销量，用评价数代替；SHEIN 没有销量也没有评价时照样采，按黑色优先排序。'),
    ],
  },
  {
    id: 'country',
    name: '站点',
    fields: [
      { t: 'openUrl' },
      { t: 'kwEditor' },
      chk('kwTranslate', true, '搜索前自动把关键词翻译成该站点当地语言再搜索（用豆包）'),
      act(['genKw', '豆包帮我想更多词'], ['previewKw', '预览各站搜索词']),
      { t: 'copyKw' },
      { t: 'randRow' },
      chk('kwAutoRand', false, '每次「开始多站点采集」前自动追加一批新随机词'),
      chk('autoPick', true, '勾选站点后自动打开该站并输入关键词开始采集'),
      { t: 'kwHist' },
      hint('随机词在本地组合（颜色 + 主题 + 印花 + T 恤 + 男女），不花灵豆也不花豆包费用；所有生成过的词都会记录，词序不同也算重复，永远不会再生成同一个词。'),
      hint('翻译结果会缓存，同一个词只翻译一次。下面勾选要采集的站点，不勾就不采；跨平台会自动跳转，请先在客户端打开的网页里登录这些网站。'),
      { t: 'sites' },
      act(['recommend', '豆包推荐站点']),
    ],
  },
  {
    id: 'filter',
    name: '过滤',
    fields: [
      chk('noPlain', true, '不采纯色款（纯黑 / 纯白 / 素色），必须有印花图案'),
      row(num('printMin', 3, '印花占比下限 %（低于算纯色）', { max: 100 }), null),
      head('印花数量（可多选）'),
      chk('printOne', true, '单个印花（只有前面或只有后面一个印花）'),
      chk('printTwo', false, '两个印花（前 + 后，或 一面 + 袖子）'),
      chk('printMulti', false, '多印花（3 个及以上，如后背 + 左右袖）'),
      hint('正面、背面、左袖、右袖各算一个印花面，用豆包看图判断（需开启「审核时看图」）。都不勾 = 不限。勾了两个或多印花时，标题里的「双面 / 前后印花」不再当跳过词。'),
      chk('pixelCheck', true, '检测图片：颜色不对 / 印花太满的不要'),
      row(num('darkMin', 30, '黑色占比下限 %', { max: 100 }), num('lightMin', 35, '白色占比下限 %', { max: 100 })),
      { k: 'skipWords', t: 'textarea', d: '', label: '跳过词（标题出现就不采）' },
      { k: 'removeWords', t: 'textarea', d: '', label: '标题删除词（上架标题里去掉）' },
      hint('另外会自动：删除所有尺码；秋季/冬季/秋冬 → 四季；卖男装删女性词，卖女装删男性词。'),
      { t: 'resetWords' },
    ],
  },
  {
    id: 'auto',
    name: '自动',
    fields: [
      txt('schedule', '', '定时开工（多个用逗号隔开，如 09:00,20:00）', { placeholder: '留空 = 不定时' }),
      row(num('dailyCap', 0, '每日最多同步（0 = 不限）'), txt('reportTime', '22:00', '日报推送时间')),
      row(num('restEvery', 50, '每采几张休息一次'), num('restMin', 2, '每次休息分钟')),
      chk('autoResume', false, '遇到���证码 / 要登录 / 国家不对：提醒我，处理好后自动继续'),
      chk('beep', true, '需要处理时电脑响提示音'),
      {
        k: 'pushType', t: 'select', d: 'none', label: '微信提醒',
        options: [['none', '不推送'], ['serverchan', 'Server酱'], ['pushplus', 'PushPlus']],
      },
      { k: 'pushKey', t: 'password', d: '', label: '推送 SendKey / Token' },
      act(['testPush', '测试提醒'], ['report', '导出日报']),
      hint('定时开工需要客户端开着，并至少打开一个平台网页（如 Temu 首页）。页面刷新或崩溃后会自动从中断处续采；6 分钟没进展会自动刷新。'),
    ],
  },
  {
    id: 'api',
    name: '豆包/去重',
    fields: [
      head('豆包审核'),
      chk('useAi', true, '启用豆包（总开关）', '不勾选 = 所有功能都不用豆包：不审核、不翻译关键词、「豆包帮我想更多词」和「推荐站点」也停用，不产生任何豆包费用。随机生成关键词、像素颜色判断、去重照常工作。'),
      { k: 'arkKey', t: 'password', d: '', label: '豆包 API Key（火山方舟）' },
      txt('arkModel', 'doubao-seed-2-0-pro', '模型 / 接入点 ID', {
        hint: '填文字/看图模型，如 doubao-seed-2-0-pro、doubao-seed-2-0-lite。Seedance 2.0（视频）和 Seedream（画图）不能用于审核和翻译，填了会自动改回。',
      }),
      chk('aiCheck', true, '���豆包审核每个商品（违规 / IP 侵权）'),
      chk('aiVision', true, '审核时看图（双面 / 满印 / 颜色）'),
      head('采集同步（灵图插件 Alt+1）'),
      { t: 'ext' },
      {
        k: 'handoff', t: 'select', d: 'alt1', label: '审核通��后',
        options: [['alt1', '自动按 Alt+1 采集并同步（推荐）'], ['click', '自动点「采集并同步」按钮'], ['mark', '只标绿框，我自己按 Alt+1']],
      },
      num('clickGap', 3, '每次采集间隔（秒）', { min: 1, hint: '不再使用灵图 API。如果 Alt+1 没反应，改选「自动点按钮」。' }),
      chk('saveOriginal', false, '同时把原图和标题保存到电脑'),
      head('去重（防止重复花灵豆）'),
      hint('同一个商品 ID 永远只同步一次；灵图按钮显示「再次采集」的也会跳过；所有窗口共用一个去重库。'),
      chk('imgDedupe', true, '图案相似去重：不同卖家的同款图也不重复采'),
      { t: 'db' },
      act(['clear', '清空日志'], ['clearSynced', '清空去重库']),
    ],
  },
]

const form = document.getElementById('settings')
const groupsNav = document.getElementById('groups')
const saved = document.getElementById('saved')
let cfg = {}
let defaults = { skip: '', remove: '' }
let current = 'main'
let savedTimer = null

function el(tag, attrs, ...kids) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs || {})) if (v != null) node.setAttribute(k, v)
  node.append(...kids.filter((k) => k != null))
  return node
}

function valueOf(f) {
  if (cfg[f.k] != null) return cfg[f.k]
  if (f.k === 'skipWords') return defaults.skip
  if (f.k === 'removeWords') return defaults.remove
  return f.d
}

function flash(text, err) {
  saved.textContent = text
  saved.className = 'msg ' + (err ? 'err' : 'ok')
  clearTimeout(savedTimer)
  savedTimer = setTimeout(() => (saved.textContent = ''), 5000)
}

async function save(patch, quiet) {
  const ok = await window.desktop.setCfg(patch)
  if (!ok) return flash('保存失败', true)
  Object.assign(cfg, patch)
  if (!quiet) flash('已保存，已打开的网页会自动刷新生效')
}

async function freshCfg() {
  cfg = (await window.desktop.getCfg()) || cfg
  return cfg
}

async function pageAct(k) {
  const r = await window.desktop.pageAct(k)
  if (r && r.error) flash(r.error, true)
  else flash('已发送到网页窗口')
}

function fieldNode(f) {
  if (!f) return el('div', { class: 'field' })
  if (f.t === 'row') return el('div', { class: 'grid2' }, ...f.fields.map(fieldNode))
  if (f.t === 'hint') return el('p', { class: 'hint' }, f.text)
  if (f.t === 'head') return el('h3', { class: 'sub' }, f.text)
  if (f.t === 'actions') {
    return el(
      'div',
      { class: 'row wrap' },
      ...f.items.map(([k, label, kind]) => {
        const b = el('button', { type: 'button', class: kind === 'primary' ? null : 'ghost' }, label)
        b.addEventListener('click', () => pageAct(k))
        return b
      }),
    )
  }
  if (CUSTOM[f.t]) return CUSTOM[f.t]()

  const id = 'f-' + f.k
  const hintNode = f.hint ? el('p', { class: 'hint' }, f.hint) : null
  if (f.t === 'check') {
    const input = el('input', { id, type: 'checkbox' })
    input.checked = !!valueOf(f)
    input.addEventListener('change', () => save({ [f.k]: input.checked }))
    return el('div', { class: 'field' }, el('label', { class: 'check', for: id }, input, f.label), hintNode)
  }
  let input
  if (f.t === 'select') {
    input = el('select', { id }, ...f.options.map(([v, text]) => el('option', { value: v }, text)))
    input.value = valueOf(f)
  } else if (f.t === 'textarea') {
    input = el('textarea', { id, rows: '5', spellcheck: 'false' })
    input.value = valueOf(f)
  } else {
    input = el('input', { id, type: f.t, min: f.min, max: f.max, placeholder: f.placeholder, spellcheck: 'false' })
    input.value = valueOf(f)
  }
  input.addEventListener('change', () => {
    let v = input.value
    if (f.t === 'number') {
      v = Number(v)
      if (!Number.isFinite(v)) return (input.value = valueOf(f))
      if (f.min != null) v = Math.max(f.min, v)
      if (f.max != null) v = Math.min(f.max, v)
      input.value = v
    } else if (f.t !== 'select') {
      v = v.trim()
    }
    save({ [f.k]: v })
    if (f.k === 'category') render()
  })
  return el('div', { class: 'field' }, el('label', { for: id }, f.label), input, hintNode)
}

const kwScope = () => cfg.kwScope || PLATFORMS[0]?.id || 'temu'
const category = () => cfg.category || 'cotton'
const kwStoreName = () => (category() === 'cotton' ? 'platKws' : 'catKws')
const kwKey = () => (category() === 'cotton' ? kwScope() : category())

function builtinKws() {
  if (category() !== 'cotton') return CATS[category()].kws || ''
  const first = ALL_SITES.find((s) => s.p === kwScope())
  return first ? first[cfg.gender === 'women' ? 'women' : 'men'] || '' : ''
}

function siteEntry(s) {
  const e = (cfg.sites || {})[s.id]
  return e || { on: s.id === 'temu-us', keyword: s[cfg.gender === 'women' ? 'women' : 'men'] || '', kws: '' }
}

async function patchSite(id, change) {
  await freshCfg()
  const sites = { ...(cfg.sites || {}) }
  const s = ALL_SITES.find((x) => x.id === id)
  sites[id] = { ...siteEntry(s), ...change }
  await save({ sites })
}

const CUSTOM = {
  openUrl() {
    const input = el('input', { id: 'f-openUrl', type: 'text', placeholder: '粘贴任意 Temu / SHEIN / Etsy / 速卖通 等网址', spellcheck: 'false' })
    const go = el('button', { type: 'button' }, '打开并采集')
    const only = el('button', { type: 'button', class: 'ghost' }, '仅打开')
    const open = (autoAct) => {
      const v = input.value.trim()
      if (!v) return flash('请先粘贴网址', true)
      window.desktop.open(/^https?:\/\//i.test(v) ? v : 'https://' + v, autoAct)
      if (autoAct) flash('已打开，页面加载完成后会自动采集当前页')
    }
    go.addEventListener('click', () => open('here'))
    only.addEventListener('click', () => open(''))
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
        e.preventDefault()
        open('here')
      }
    })
    return el('div', { class: 'field' }, el('label', { for: 'f-openUrl' }, '打开网址'), el('div', { class: 'urlrow' }, input, go, only))
  },

  ext() {
    const b = el('button', { type: 'button', class: 'ghost' }, '加载灵图插件（解压目录）')
    b.addEventListener('click', () => window.desktop.loadExtension())
    return el(
      'div',
      { class: 'field' },
      b,
      el('p', { class: 'hint' }, '把灵图插件解压到一个文件夹，点上面按钮选择该文件夹，之后每次启动都会自动加载。'),
    )
  },

  catInfo() {
    return el('p', { class: 'hint' }, CATS[category()].look)
  },

  kwEditor() {
    const sel = el('select', { id: 'f-kwScope' }, ...PLATFORMS.map((p) => el('option', { value: p.id }, p.name)))
    sel.value = kwScope()
    sel.addEventListener('change', async () => {
      await save({ kwScope: sel.value }, true)
      render()
    })
    const area = el('textarea', { id: 'f-kw', rows: '6', spellcheck: 'false', placeholder: builtinKws() })
    area.value = ((cfg[kwStoreName()] || {})[kwKey()] || '')
    area.addEventListener('change', async () => {
      await freshCfg()
      const store = { ...(cfg[kwStoreName()] || {}), [kwKey()]: area.value.trim() }
      await save({ [kwStoreName()]: store })
    })
    const pName = (PLATFORMS.find((p) => p.id === kwScope()) || {}).name || ''
    const onCount = ALL_SITES.filter((s) => s.p === kwScope() && siteEntry(s).on).length
    const info =
      category() === 'cotton'
        ? pName + ' 所有国家共用这一份关键词，搜索时自动翻译成当地语言。' + (onCount ? '已���选 ' + onCount + ' 个站点。' : '还没勾选 ' + pName + ' 的站点')
        : CATS[category()].name + ' 品类所有网站共用这一份关键词。留空 = 用内置词。'
    return el(
      'div',
      { class: 'field' },
      el('label', { for: 'f-kwScope' }, '编辑哪个网站的关键词（各国站点共用，自动翻译）'),
      sel,
      el('label', { for: 'f-kw' }, '该网站关键词（每行一个，依次轮询搜索）'),
      area,
      el('p', { class: 'hint' }, info),
    )
  },

  copyKw() {
    const b = el('button', { type: 'button', class: 'ghost' }, '复制到其他网站')
    b.addEventListener('click', async () => {
      await freshCfg()
      const store = { ...(cfg[kwStoreName()] || {}) }
      const text = store[kwKey()] || builtinKws()
      if (category() !== 'cotton') return flash('非纯棉 T 品类本身就是所有网站共用一份关键词')
      if (!text.trim()) return flash('当前关键词是空的', true)
      if (!confirm('把当前关键词复制到所有其他网站？会覆盖它们原来的关键词。')) return
      for (const p of PLATFORMS) store[p.id] = text
      await save({ platKws: store })
      flash('已复制到全部 ' + PLATFORMS.length + ' 个网站')
    })
    return el('div', { class: 'row' }, b)
  },

  randRow() {
    const color = el(
      'select',
      { 'aria-label': '随机词颜色' },
      ...[['both', '黑白各半'], ['black', '只要黑 T'], ['white', '只要白 T']].map(([v, t]) => el('option', { value: v }, t)),
    )
    color.value = cfg.kwRandColor || 'both'
    color.addEventListener('change', () => save({ kwRandColor: color.value }))
    const count = el('input', { type: 'number', min: '1', max: '200', 'aria-label': '随机词数量' })
    count.value = cfg.kwRandCount || 10
    count.addEventListener('change', () => {
      const v = Math.min(200, Math.max(1, Number(count.value) || 10))
      count.value = v
      save({ kwRandCount: v })
    })
    const gen = el('button', { type: 'button', class: 'ghost' }, '随机生成')
    gen.addEventListener('click', () => pageAct('randKw'))
    return el('div', { class: 'grid3' }, color, count, gen)
  },

  kwHist() {
    const info = el('span', { class: 'hint' }, '已生成过 … 个词')
    window.desktop.kwHist().then((n) => (info.textContent = '已生成过 ' + n + ' 个词'))
    const clear = el('button', { type: 'button', class: 'link' }, '清空生成记录')
    clear.addEventListener('click', async () => {
      if (!confirm('清空所有生成过的随机词记录？清空后可能再生成以前出现过的词。')) return
      await window.desktop.kwHistClear()
      info.textContent = '已生成过 0 个词'
      flash('已清空生成记录')
    })
    return el('div', { class: 'between' }, info, clear)
  },

  sites() {
    const wrap = el('div', { class: 'sites' })
    const none = el('button', { type: 'button', class: 'link' }, '取消全部站点')
    none.addEventListener('click', async () => {
      await freshCfg()
      const sites = { ...(cfg.sites || {}) }
      for (const s of ALL_SITES) sites[s.id] = { ...siteEntry(s), on: false }
      await save({ sites })
      render()
    })
    wrap.append(el('div', { class: 'between end' }, none))
    for (const p of PLATFORMS) {
      if (!p.sites.length) continue
      const list = ALL_SITES.filter((s) => s.p === p.id)
      const on = list.filter((s) => siteEntry(s).on).length
      const det = el('details', { open: on ? '' : null }, el('summary', {}, p.name + (on ? '（已选 ' + on + '）' : '')))
      for (const s of list) {
        const e = siteEntry(s)
        const id = 'site-' + s.id
        const box = el('input', { id, type: 'checkbox' })
        box.checked = !!e.on
        box.addEventListener('change', () => patchSite(s.id, { on: box.checked }))
        const kw = el('input', { type: 'text', 'aria-label': s.name + ' 专用关键词', placeholder: '留空 = 用上面共用关键词', spellcheck: 'false' })
        kw.value = e.kws || ''
        kw.addEventListener('change', () => patchSite(s.id, { kws: kw.value.trim() }))
        const open = el('button', { type: 'button', class: 'ghost small', title: s.url, 'aria-label': '打开 ' + p.name + ' ' + s.name }, '打开')
        open.addEventListener('click', () => window.desktop.open(s.url))
        det.append(el('div', { class: 'site' }, el('label', { class: 'check', for: id }, box, s.name), kw, open))
      }
      wrap.append(det)
    }
    return wrap
  },

  resetWords() {
    const b = el('button', { type: 'button', class: 'link' }, '恢复默认词库')
    b.addEventListener('click', async () => {
      if (!confirm('把跳过词和标题删除词恢复成默认词库？')) return
      await save({ skipWords: defaults.skip, removeWords: defaults.remove })
      render()
    })
    return el('div', {}, b)
  },

  db() {
    const info = el('p', { class: 'hint' }, '去重库：读取中…')
    const refresh = async () => {
      const d = await window.desktop.dbInfo()
      info.textContent = d ? '去重库：已同步 ' + d.synced + ' 张 · 已审核 ' + d.done + ' 个 · 图案指纹 ' + d.hashes + ' 个' : ''
    }
    const exp = el('button', { type: 'button', class: 'ghost' }, '备份去重库')
    const imp = el('button', { type: 'button', class: 'ghost' }, '导入去重库')
    exp.addEventListener('click', async () => {
      const r = await window.desktop.dbExport()
      if (r && r.ok) flash('已备份到：' + r.file)
    })
    imp.addEventListener('click', async () => {
      const r = await window.desktop.dbImport()
      if (r && r.error) flash(r.error, true)
      else if (r && r.ok) {
        flash('已导入，已打开的网页会自动刷新')
        refresh()
      }
    })
    refresh()
    return el('div', { class: 'field' }, info, el('div', { class: 'row' }, exp, imp), el('p', { class: 'hint' }, '重装或换电脑前先备份，导入后旧商品不会再被同步。'))
  },
}

function render() {
  groupsNav.replaceChildren(
    ...GROUPS.map((g) => {
      const b = el('button', { type: 'button', 'aria-pressed': String(g.id === current) }, g.name)
      b.addEventListener('click', () => {
        current = g.id
        render()
      })
      return b
    }),
  )
  const g = GROUPS.find((x) => x.id === current)
  const bar = el(
    'div',
    { class: 'taskbar' },
    fieldNode(TASK_BAR),
    el('p', { class: 'hint' }, '这些按钮会操作最近使用的那个网页窗口；网页右侧的面板会显示进度和日志。'),
  )
  form.replaceChildren(...g.fields.map(fieldNode), bar)
}

form.addEventListener('submit', (e) => e.preventDefault())

window.desktop.onValuesChanged(async () => {
  const a = document.activeElement
  if (a && form.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return
  await freshCfg()
  render()
})

Promise.all([window.desktop.getCfg(), window.desktop.defaults()]).then(([c, d]) => {
  cfg = c || {}
  defaults = d || defaults
  render()
})
