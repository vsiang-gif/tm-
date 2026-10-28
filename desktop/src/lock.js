const form = document.getElementById('form')
const input = document.getElementById('key')
const remember = document.getElementById('remember')
const msg = document.getElementById('msg')
const submit = document.getElementById('submit')

function show(cls, text) {
  msg.className = 'msg ' + cls
  msg.textContent = text
}

async function auto() {
  submit.disabled = true
  show('', '正在验证已保存的密钥…')
  const res = await window.desktop.autoUnlock()
  if (res.ok) return show('ok', '验证成功，正在启动…')
  submit.disabled = false
  show(res.none ? '' : 'err', res.none ? '' : res.message)
  input.focus()
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  submit.disabled = true
  show('', '正在联网验证…')
  const res = await window.desktop.unlock(input.value, remember.checked)
  if (res.ok) return show('ok', '验证成功' + (res.holder ? '，欢迎 ' + res.holder : '') + '，正在启动…')
  if (res.offline) {
    submit.disabled = false
    return show('err', res.message)
  }
  input.value = ''
  input.focus()
  show('err', res.left > 0 ? res.message + '，还可以尝试 ' + res.left + ' 次' : '错误次数过多，程序即将退出')
  submit.disabled = res.left <= 0
})

auto()
