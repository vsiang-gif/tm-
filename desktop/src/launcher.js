const data = window.desktop.platforms()
if (data) document.getElementById('ver').textContent = 'v' + data.appVersion + ' · 脚本 v' + data.version
