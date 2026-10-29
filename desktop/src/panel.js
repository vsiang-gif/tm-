// Native mirror of the collector panel: the script's panel lives hidden in the page, this window renders and drives it.
const root = document.getElementById('root')
const wait = document.getElementById('wait')
const pick = document.getElementById('pick')
const tpl = document.createElement('template')
let collapsed = false

function morph(from, to) {
  if (from.nodeType !== to.nodeType || from.nodeName !== to.nodeName) {
    from.replaceWith(to.cloneNode(true))
    return
  }
  if (from.nodeType !== 1) {
    if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue
    return
  }
  for (const a of Array.from(from.attributes)) if (!to.hasAttribute(a.name)) from.removeAttribute(a.name)
  for (const a of Array.from(to.attributes)) {
    if (/^on/i.test(a.name)) continue
    if (from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value)
  }
  const next = Array.from(to.childNodes)
  next.forEach((child, i) => {
    const cur = from.childNodes[i]
    if (cur) morph(cur, child)
    else from.appendChild(child.cloneNode(true))
  })
  while (from.childNodes.length > next.length) from.lastChild.remove()
}

function controls() {
  return root.querySelectorAll('input,select,textarea')
}

function render(raw) {
  let snap
  try { snap = JSON.parse(raw) } catch { return }
  tpl.innerHTML = snap.html
  tpl.content.querySelectorAll('*').forEach((el) => {
    for (const a of Array.from(el.attributes)) if (/^on/i.test(a.name)) el.removeAttribute(a.name)
  })
  const fresh = document.createElement('div')
  fresh.appendChild(tpl.content)
  morph(root, Object.assign(fresh, { id: 'root' }))
  root.removeAttribute('hidden')
  root.style.cssText = snap.style || ''
  for (const [k, v] of [
    ['position', 'relative'], ['left', '0'], ['right', 'auto'], ['top', '0'], ['visibility', 'visible'],
    ['pointer-events', 'auto'], ['width', '100%'], ['height', '100vh'], ['border-radius', '0'], ['box-shadow', 'none'],
  ]) root.style.setProperty(k, v, 'important')
  wait.hidden = true

  const list = controls()
  ;(snap.vals || []).forEach(([v, c], i) => {
    const el = list[i]
    if (!el || el === document.activeElement || el.type === 'file') return
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = c
    else if (el.value !== v) el.value = v
  })

  const body = root.querySelector('[data-k="body"]')
  const isCollapsed = !!body && body.style.display === 'none'
  if (isCollapsed !== collapsed) {
    collapsed = isCollapsed
    window.panelApi.collapse(collapsed)
  }
}

function pathOf(el) {
  const path = []
  while (el && el !== root) {
    path.unshift(Array.prototype.indexOf.call(el.parentElement.children, el))
    el = el.parentElement
  }
  return path
}

root.addEventListener('click', (e) => {
  const summary = e.target.closest('summary')
  if (summary && root.contains(summary)) {
    e.preventDefault()
    const details = summary.parentElement
    details.open = !details.open
    window.panelApi.act({ t: 'toggle', path: pathOf(details), open: details.open })
    return
  }
  const btn = e.target.closest('button')
  if (!btn || !root.contains(btn) || btn.disabled) return
  e.preventDefault()
  if (btn.getAttribute('data-k') === 'importDb') {
    pick.value = ''
    pick.click()
    return
  }
  window.panelApi.act({ t: 'click', path: pathOf(btn) })
})

root.addEventListener('change', (e) => {
  const el = e.target
  if (!el.matches('input,select,textarea') || el.type === 'file') return
  const i = Array.prototype.indexOf.call(controls(), el)
  if (i >= 0) window.panelApi.act({ t: 'set', i, v: el.value, c: el.checked })
})

pick.addEventListener('change', async () => {
  const file = pick.files[0]
  const target = root.querySelector('[data-k="dbFile"]')
  if (!file || !target) return
  const i = Array.prototype.indexOf.call(controls(), target)
  window.panelApi.act({ t: 'file', i, name: file.name, text: await file.text() })
})

window.panelApi.onSnapshot(render)
window.panelApi.onReset(() => {
  wait.hidden = false
  root.hidden = true
})
