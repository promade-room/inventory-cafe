@echo off
echo Menarik pembaruan dari git...
call git pull origin main

echo Menginstall dependensi backend...
cd backend
call npm install
cd ..

echo Menginstall dependensi frontend...
cd frontend
call npm install

echo Melakukan build frontend...
call npm run build
cd ..

echo Pembaruan selesai!
pause
