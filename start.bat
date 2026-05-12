@echo off
set NODE_ENV=production

echo Menjalankan server...
cd backend

echo Membuka aplikasi di browser dalam beberapa detik...
:: Membuka browser di background menggunakan jeda ping
start /B cmd /c "ping 127.0.0.1 -n 4 > nul && start http://localhost:3000"

:: Menjalankan node server di foreground agar log terlihat dan terminal tidak tertutup
node server.js

:: Pause agar jika terjadi error, terminal tidak langsung tertutup
pause
