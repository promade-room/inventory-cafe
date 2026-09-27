@echo off

echo Melakukan build frontend...
cd frontend
call npm run build
cd ..

echo Build selesai!
pause
