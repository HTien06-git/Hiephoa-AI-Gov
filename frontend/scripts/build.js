const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('[HIỆP HÒA AI-GOV] Bắt đầu quá trình build cho Vercel...');
console.log('[HIỆP HÒA AI-GOV] Thư mục hiện tại:', process.cwd());

if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
  console.log('[HIỆP HÒA AI-GOV] Phát hiện cấu trúc Root: Đang cài đặt và build frontend...');
  execSync('npm --prefix frontend install && npm --prefix frontend run build', { stdio: 'inherit' });
} else {
  console.log('[HIỆP HÒA AI-GOV] Đang ở trực tiếp trong thư mục frontend...');
  execSync('npm install && npm run build', { stdio: 'inherit' });
}

console.log('[HIỆP HÒA AI-GOV] Build hoàn tất thành công!');
