@echo off
echo Menarik pembaruan dari git...
call git pull origin server

echo Menginstall dependensi frontend...
cd frontend
call npm install

echo Melakukan build frontend...
call npm run build
cd ..

echo Menginstall dependensi backend...
cd backend
call npm install
cd ..

echo Pembaruan selesai!
