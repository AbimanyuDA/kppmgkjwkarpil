@echo off
echo ============================================
echo Setup Database GKJW Finance System
echo ============================================
echo.

set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB_NAME=gkjw_finance

echo Step 1: Membuat database %DB_NAME%...
%PSQL_PATH% -U postgres -c "CREATE DATABASE %DB_NAME%;"

echo.
echo Step 2: Menjalankan migration...
%PSQL_PATH% -U postgres -d %DB_NAME% -f "%~dp0backend\migrations\001_init.sql"

echo.
echo ============================================
echo Database setup selesai!
echo ============================================
echo.
echo Default users yang sudah dibuat:
echo - Admin: admin@gkjw.com / admin123
echo - Member: member@gkjw.com / member123
echo.
pause
