@echo off
set NODE_ENV=production

echo Menjalankan Server Inventory Cafe...
cd backend

echo Membuka aplikasi di browser dalam beberapa detik...
:: Membuka browser di background menggunakan jeda ping
start /B cmd /c "ping 127.0.0.1 -n 5 > nul && start http://localhost:3006"

:: Menjalankan node server
npm start

:: Pause agar jika terjadi error, terminal tidak langsung tertutup
pause
