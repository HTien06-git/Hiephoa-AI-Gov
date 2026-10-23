@echo off
chcp 65001 > nul
echo =========================================================================
echo    🚀 KHỞI ĐỘNG HỆ THỐNG HIỆP HÒA AI-GOV (TỈNH TÂY NINH)
echo =========================================================================
echo.
echo Đang khởi động Backend Server (Cổng 5000)...
start "HIỆP HÒA AI-GOV BACKEND" cmd /k "cd backend && npm start"

timeout /t 2 /nobreak > nul

echo Đang khởi động Frontend Web App (Cổng 5173)...
start "HIỆP HÒA AI-GOV FRONTEND" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================================
echo ✅ Đã khởi động xong cả 2 máy chủ!
echo 🌐 Giao diện Người dân:  http://localhost:5173
echo 📱 Cán bộ Một cửa quét QR: http://localhost:5173/#/can-bo-mot-cua
echo ⚙️ Backend API:           http://localhost:5000/api
echo =========================================================================
pause
