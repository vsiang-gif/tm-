const data = window.desktop.platforms()
const list = document.getElementById('list')

if (data) {
  document.getElementById('ver').textContent = 'v' + data.appVersion + ' · 脚本 v' + data.version
  for (const p of data.platforms) {
    if (!p.sites.length) continue
    const section = document.createElement('section')
    section.className = 'platform'
    const h = document.createElement('h2')
    h.textContent = p.name
    const row = document.createElement('div')
    row.className = 'chips'
    for (const s of p.sites) {
      const b = document.createElement('button')
      b.type = 'button'
      b.textContent = s.name
      b.title = s.url
      b.addEventListener('click', () => window.desktop.open(s.url))
      row.appendChild(b)
    }
    section.append(h, row)
    list.appendChild(section)
  }
}

document.getElementById('custom').addEventListener('submit', (e) => {
  e.preventDefault()
  const v = document.getElementById('url').value.trim()
  if (v) window.desktop.open(/^https?:\/\//i.test(v) ? v : 'https://' + v)
})

document.getElementById('ext').addEventListener('click', () => window.desktop.loadExtension())

for (const tab of document.querySelectorAll('.tabs [data-tab]')) {
  tab.addEventListener('click', () => {
    for (const t of document.querySelectorAll('.tabs [data-tab]')) {
      const on = t === tab
      t.setAttribute('aria-selected', String(on))
      document.getElementById('tab-' + t.dataset.tab).hidden = !on
    }
  })
}
