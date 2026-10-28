// Mirrors the userscript's DEFAULTS; values are stored in the same `cfg` object the script reads.
const GROUPS = [
  {
    id: 'ai',
    name: '豆包审核',
    fields: [
      { k: 'useAi', t: 'check', d: true, label: '启用豆包（总开关）', hint: '不勾选 = 所有功能都不用豆包：不审核、不翻译关键词、「豆包帮我想更多词」和「推荐站点」也停用，不产生任何豆包费用。随机生成关键词、像素颜色判断、去重照常工作。' },
      { k: 'arkKey', t: 'password', d: '', label: '豆包 API Key（火山方舟）' },
      { k: 'arkModel', t: 'text', d: 'doubao-seed-2-0-pro', label: '模型 / 接入点 ID', hint: '填文字/看图模型，如 doubao-seed-2-0-pro、doubao-seed-2-0-lite。Seedance 2.0（视频）和 Seedream（画图）不能用于审核和翻译，填了会自动改回。' },
      { k: 'aiCheck', t: 'check', d: true, label: '用豆包审核每个商品（违规 / IP 侵权）' },
      { k: 'aiVision', t: 'check', d: true, label: '审核时看图（双面 / 满印 / 颜色）' },
    ],
  },
  {
    id: 'sync',
    name: '采集同步',
    fields: [
      {
        k: 'handoff', t: 'select', d: 'alt1', label: '审核通过后',
        options: [['alt1', '自动按 Alt+1 采集并同步（推荐）'], ['click', '自动点「采集并同步」按钮'], ['mark', '只标绿框，我自己按 Alt+1']],
      },
      { k: 'clickGap', t: 'number', d: 3, min: 0, label: '每次采集间隔（秒）', hint: '不再使用灵图 API。如果 Alt+1 没反应，改选「自动点按钮」。' },
      { k: 'saveOriginal', t: 'check', d: false, label: '同时把原图和标题保存到电脑' },
    ],
  },
  {
    id: 'filter',
    name: '过滤',
    fields: [
      { k: 'gender', t: 'select', d: 'men', label: '男装 / 女装', options: [['men', '男装'], ['women', '女装']] },
      { k: 'colorMode', t: 'select', d: 'black', label: '颜色', options: [['black', '只采黑色'], ['white', '只采白色'], ['rotate', '轮换：先黑色再白色']] },
      { k: 'minSales', t: 'number', d: 20, min: 1, label: '最低销量/评价数' },
      { k: 'target', t: 'number', d: 60, min: 1, label: '每次搜索采集' },
      { k: 'maxPages', t: 'number', d: 5, min: 1, label: '最多翻页' },
      { k: 'pixelCheck', t: 'check', d: true, label: '检测图片：颜色不对 / 印花太满的不要' },
      { k: 'darkMin', t: 'number', d: 40, min: 5, max: 95, label: '黑色占比下限 %' },
      { k: 'lightMin', t: 'number', d: 35, min: 5, max: 95, label: '白色占比下限 %' },
      { k: 'noPlain', t: 'check', d: true, label: '不采纯色款（纯黑 / 纯白 / 素色），必须有印花' },
      { k: 'printMin', t: 'number', d: 3, min: 0, max: 50, step: 0.5, label: '印花占比下限 %（低于算纯色）' },
      { k: 'enterStore', t: 'check', d: true, label: '高销量商品自动进店铺采集，采完退出店铺' },
      { k: 'storeCount', t: 'number', d: 3, min: 0, label: '进店数量' },
      { k: 'storeTarget', t: 'number', d: 30, min: 1, label: '每家店采集' },
      { k: 'storeMinSales', t: 'number', d: 500, min: 0, label: '进店销量门槛（≥）' },
    ],
  },
  {
    id: 'auto',
    name: '自动',
    fields: [
      { k: 'schedule', t: 'text', d: '', label: '定时开工（多个用逗号隔开，如 09:00,20:00）', placeholder: '留空 = 不定时' },
      { k: 'dailyCap', t: 'number', d: 0, min: 0, label: '每日最多同步（0 = 不限）' },
      { k: 'reportTime', t: 'text', d: '22:00', label: '日报推送时间' },
      { k: 'restEvery', t: 'number', d: 30, min: 0, label: '每采几张休息一次' },
      { k: 'restMin', t: 'number', d: 3, min: 0, label: '每次休息分钟' },
      { k: 'autoResume', t: 'check', d: true, label: '遇到验证码 / 要登录 / 国家不对：提醒我，处理好后自动继续' },
      { k: 'beep', t: 'check', d: true, label: '需要我处理时响铃提醒' },
      { k: 'pushType', t: 'select', d: 'none', label: '手机推送', options: [['none', '不推送'], ['serverchan', 'Server 酱'], ['pushplus', 'PushPlus']] },
      { k: 'pushKey', t: 'password', d: '', label: '推送 Key' },
    ],
  },
  {
    id: 'dedupe',
    name: '去重',
    hint: '同一个商品 ID 永远只同步一次；灵图按钮显示「再次采集」的也会跳过；所有窗口共用一个去重库。',
    fields: [{ k: 'imgDedupe', t: 'check', d: true, label: '图案相似去重：不同卖家的同款图也不重复采' }],
    db: true,
  },
]

const form = document.getElementById('settings')
const groupsNav = document.getElementById('groups')
const saved = document.getElementById('saved')
let cfg = {}
let current = 'ai'
let savedTimer = null

function el(tag, attrs, ...kids) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs || {})) if (v != null) node.setAttribute(k, v)
  node.append(...kids.filter((k) => k != null))
  return node
}

function valueOf(f) {
  return cfg[f.k] == null ? f.d : cfg[f.k]
}

function fieldNode(f) {
  const id = 'f-' + f.k
  const hint = f.hint ? el('p', { class: 'hint' }, f.hint) : null
  if (f.t === 'check') {
    const input = el('input', { id, type: 'checkbox' })
    input.checked = !!valueOf(f)
    input.addEventListener('change', () => save({ [f.k]: input.checked }))
    return el('div', { class: 'field' }, el('label', { class: 'check', for: id }, input, f.label), hint)
  }
  let input
  if (f.t === 'select') {
    input = el('select', { id }, ...f.options.map(([v, text]) => el('option', { value: v }, text)))
    input.value = valueOf(f)
  } else {
    input = el('input', {
      id,
      type: f.t,
      min: f.min,
      max: f.max,
      step: f.step,
      placeholder: f.placeholder,
      spellcheck: 'false',
    })
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
  })
  return el('div', { class: 'field' }, el('label', { for: id }, f.label), input, hint)
}

async function dbNode() {
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
}

async function render() {
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
  const nodes = [el('h2', {}, g.name)]
  if (g.hint) nodes.push(el('p', { class: 'hint' }, g.hint))
  nodes.push(...g.fields.map(fieldNode))
  if (g.db) nodes.push(await dbNode())
  form.replaceChildren(...nodes)
}

function flash(text, err) {
  saved.textContent = text
  saved.className = 'msg ' + (err ? 'err' : 'ok')
  clearTimeout(savedTimer)
  savedTimer = setTimeout(() => (saved.textContent = ''), 4000)
}

async function save(patch) {
  const ok = await window.desktop.setCfg(patch)
  if (!ok) return flash('保存失败', true)
  Object.assign(cfg, patch)
  flash('已保存，已打开的网页会自动刷新生效')
}

form.addEventListener('submit', (e) => e.preventDefault())

window.desktop.getCfg().then((c) => {
  cfg = c || {}
  render()
})
