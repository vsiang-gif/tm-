const form = document.getElementById('form')
const input = document.getElementById('key')
const msg = document.getElementById('msg')
const submit = document.getElementById('submit')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  submit.disabled = true
  const res = await window.desktop.unlock(input.value)
  if (res.ok) {
    msg.className = 'msg ok'
    msg.textContent = '验证成功，正在启动…'
    return
  }
  input.value = ''
  input.focus()
  msg.className = 'msg err'
  msg.textContent = res.left > 0 ? '密钥错误，还可以尝试 ' + res.left + ' 次' : '错误次数过多，程序即将退出'
  submit.disabled = res.left <= 0
})
