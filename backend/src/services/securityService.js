const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Xác định môi trường thực thi (Local vs Vercel Serverless)
const isVercel = Boolean(process.env.VERCEL);

// Đường dẫn lưu trữ: Trên Vercel chỉ cho phép ghi vào /tmp/, trên Local lưu vào src/data/
const DB_FILE = isVercel
  ? path.join('/tmp', 'security_db.json')
  : path.resolve(__dirname, '../data/security_db.json');

// Khởi tạo bộ nhớ toàn cục phòng trường hợp Serverless tái sử dụng container
if (!globalThis.__HIEPHOA_SECURITY_STORE__) {
  globalThis.__HIEPHOA_SECURITY_STORE__ = {
    devices: {},
    officers: {}
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'HiepHao_AI_Gov_Secret_Security_Key_2026';

// Danh sách tài khoản hệ thống mặc định (Hỗ trợ cấu hình qua Environment Variables)
const DEFAULT_USERS = {
  admin: {
    username: 'admin',
    password: process.env.ADMIN_PASSWORD || 'HiepHoa@2026',
    role: 'ADMIN',
    name: 'Quản Trị Viên Hệ Thống (Admin)',
    status: 'ONLINE',
    isLocked: false,
    processedCount: 156,
    department: 'Ban Quản Trị Trung Tâm',
    createdAt: new Date().toISOString()
  },
  canbo1: {
    username: 'canbo1',
    password: process.env.OFFICER_PASSWORD || 'MotCua@2026',
    role: 'OFFICER',
    name: 'Trần Văn Hòa (Cán bộ Tư pháp - Hộ tịch)',
    status: 'ONLINE',
    isLocked: false,
    processedCount: 42,
    department: 'Tư pháp - Hộ tịch',
    createdAt: new Date().toISOString()
  },
  canbo2: {
    username: 'canbo2',
    password: process.env.OFFICER_PASSWORD || 'MotCua@2026',
    role: 'OFFICER',
    name: 'Lê Quốc Hùng (Cán bộ Địa chính - Xây dựng)',
    status: 'ONLINE',
    isLocked: false,
    processedCount: 28,
    department: 'Địa chính - Xây dựng - Đất đai',
    createdAt: new Date().toISOString()
  },
  canbo3: {
    username: 'canbo3',
    password: process.env.OFFICER_PASSWORD || 'MotCua@2026',
    role: 'OFFICER',
    name: 'Nguyễn Thị Bích (Cán bộ Văn phòng - Chứng thực)',
    status: 'OFFLINE',
    isLocked: false,
    processedCount: 35,
    department: 'Văn phòng - Thống kê - Chứng thực',
    createdAt: new Date().toISOString()
  }
};

class SecurityService {
  constructor() {
    this.loadStore();
  }

  // Tải dữ liệu từ file hoặc bộ nhớ cache
  loadStore() {
    try {
      if (!globalThis.__HIEPHOA_SECURITY_STORE__.officers) {
        globalThis.__HIEPHOA_SECURITY_STORE__.officers = { ...DEFAULT_USERS };
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.devices === 'object') {
          globalThis.__HIEPHOA_SECURITY_STORE__.devices = parsed.devices;
        }
        if (parsed && typeof parsed.officers === 'object') {
          globalThis.__HIEPHOA_SECURITY_STORE__.officers = {
            ...DEFAULT_USERS,
            ...parsed.officers
          };
        }
      }
    } catch (err) {
      console.warn('[SecurityService] Load store notice, using memory store:', err.message);
    }
  }


  // Lưu an toàn vào file (hỗ trợ cả /tmp của Vercel)
  saveStore() {
    try {
      const dataToSave = JSON.stringify(globalThis.__HIEPHOA_SECURITY_STORE__, null, 2);
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, dataToSave, 'utf8');
    } catch (err) {
      console.warn('[SecurityService] Save store notice (read-only fallback active):', err.message);
    }
  }

  // Lấy trạng thái của một thiết bị cụ thể
  getDeviceStatus(deviceId) {
    if (!deviceId) return { failedCount: 0, isLocked: false, remainingAttempts: 5 };
    const dev = globalThis.__HIEPHOA_SECURITY_STORE__.devices[deviceId];
    if (!dev) {
      return {
        deviceId,
        failedCount: 0,
        isLocked: false,
        remainingAttempts: 5
      };
    }
    return {
      deviceId: dev.deviceId,
      deviceName: dev.deviceName || 'Thiết bị không xác định',
      ipAddress: dev.ipAddress || '127.0.0.1',
      lastUsername: dev.lastUsername || '',
      failedCount: dev.failedCount || 0,
      isLocked: Boolean(dev.isLocked || dev.failedCount >= 5),
      remainingAttempts: Math.max(0, 5 - (dev.failedCount || 0)),
      lockedAt: dev.lockedAt || null,
      updatedAt: dev.updatedAt || null
    };
  }

  // Ghi nhận lần nhập sai và khóa cứng nếu đủ 5 lần
  recordFailedAttempt(deviceId, deviceName, ipAddress, username) {
    if (!deviceId) return { failedCount: 1, isLocked: false, remainingAttempts: 4 };

    const devices = globalThis.__HIEPHOA_SECURITY_STORE__.devices;
    const current = devices[deviceId] || {
      deviceId,
      failedCount: 0,
      isLocked: false
    };

    current.deviceName = deviceName || current.deviceName || 'Thiết bị di động/PC';
    current.ipAddress = ipAddress || current.ipAddress || '127.0.0.1';
    current.lastUsername = username || current.lastUsername || '';
    current.failedCount = (current.failedCount || 0) + 1;
    current.updatedAt = new Date().toISOString();

    if (current.failedCount >= 5) {
      current.isLocked = true;
      current.lockedAt = new Date().toISOString();
    }

    devices[deviceId] = current;
    this.saveStore();

    return {
      deviceId,
      failedCount: current.failedCount,
      isLocked: current.isLocked,
      remainingAttempts: Math.max(0, 5 - current.failedCount)
    };
  }

  // Đặt lại số lần sai khi đăng nhập đúng (nếu chưa bị khóa)
  recordSuccessLogin(deviceId) {
    if (!deviceId) return;
    const devices = globalThis.__HIEPHOA_SECURITY_STORE__.devices;
    if (devices[deviceId]) {
      devices[deviceId].failedCount = 0;
      devices[deviceId].isLocked = false;
      devices[deviceId].updatedAt = new Date().toISOString();
      this.saveStore();
    }
  }

  // Admin Reset lượt đăng nhập của 1 thiết bị về 0/5 (Mở khóa)
  resetDevice(deviceId) {
    if (!deviceId) return false;
    const devices = globalThis.__HIEPHOA_SECURITY_STORE__.devices;
    if (devices[deviceId]) {
      devices[deviceId].failedCount = 0;
      devices[deviceId].isLocked = false;
      devices[deviceId].resetAt = new Date().toISOString();
      devices[deviceId].updatedAt = new Date().toISOString();
      this.saveStore();
      return true;
    }
    return false;
  }

  // Admin Reset tất cả thiết bị đang bị khóa
  resetAllDevices() {
    const devices = globalThis.__HIEPHOA_SECURITY_STORE__.devices;
    let count = 0;
    for (const id in devices) {
      if (devices[id].isLocked || devices[id].failedCount > 0) {
        devices[id].failedCount = 0;
        devices[id].isLocked = false;
        devices[id].resetAt = new Date().toISOString();
        devices[id].updatedAt = new Date().toISOString();
        count++;
      }
    }
    this.saveStore();
    return count;
  }

  // Tạo thiết bị khóa mẫu để biểu diễn tính năng mở khóa trước Ban Giám khảo
  createDemoLockedDevice() {
    const demoId = `HH-DEV-DEMO${Math.floor(100 + Math.random() * 900)}`;
    const devices = globalThis.__HIEPHOA_SECURITY_STORE__.devices;
    devices[demoId] = {
      deviceId: demoId,
      deviceName: 'iPhone 15 Pro (Safari iOS - Mẫu Test)',
      ipAddress: '113.161.45.88',
      lastUsername: 'hacker_test',
      failedCount: 5,
      isLocked: true,
      lockedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveStore();
    return devices[demoId];
  }

  // Lấy toàn bộ danh sách thiết bị
  getAllDevices() {
    const devices = globalThis.__HIEPHOA_SECURITY_STORE__.devices;
    return Object.values(devices).sort((a, b) => {
      // Ưu tiên thiết bị bị khóa lên đầu
      if (a.isLocked && !b.isLocked) return -1;
      if (!a.isLocked && b.isLocked) return 1;
      return (b.failedCount || 0) - (a.failedCount || 0);
    });
  }

  // Tạo mới tài khoản Cán bộ / Admin
  createOfficer(username, password, name, role = 'OFFICER', department = 'Bộ phận Một cửa') {
    this.loadStore();
    if (!username || !password) {
      throw new Error('Tên tài khoản và mật khẩu không được để trống.');
    }
    const cleanUser = decodeURIComponent(username).trim().toLowerCase();
    const officers = globalThis.__HIEPHOA_SECURITY_STORE__.officers || {};

    const existingKey = Object.keys(officers).find(k => k.toLowerCase() === cleanUser);
    if (existingKey) {
      throw new Error(`Tài khoản "${cleanUser}" đã tồn tại trong hệ thống.`);
    }

    const newOfficer = {
      username: cleanUser,
      password: password,
      name: name ? name.trim() : (role === 'ADMIN' ? 'Quản Trị Viên' : 'Cán Bộ Một Cửa'),
      role: role === 'ADMIN' ? 'ADMIN' : 'OFFICER',
      department: department || 'Bộ phận Một cửa',
      status: 'ONLINE',
      isLocked: false,
      processedCount: 0,
      createdAt: new Date().toISOString()
    };

    officers[cleanUser] = newOfficer;
    globalThis.__HIEPHOA_SECURITY_STORE__.officers = officers;
    this.saveStore();

    return {
      username: newOfficer.username,
      name: newOfficer.name,
      role: newOfficer.role,
      department: newOfficer.department,
      status: newOfficer.status,
      isLocked: newOfficer.isLocked,
      processedCount: newOfficer.processedCount,
      createdAt: newOfficer.createdAt
    };
  }

  // Cập nhật tài khoản cán bộ (đổi mật khẩu, khóa/mở khóa, cập nhật tên)
  updateOfficer(username, updates = {}) {
    this.loadStore();
    if (!username) return null;
    const cleanUser = decodeURIComponent(username).trim().toLowerCase();
    const officers = globalThis.__HIEPHOA_SECURITY_STORE__.officers || {};
    
    // Tìm kiếm không phân biệt hoa thường và hỗ trợ cả username hoặc email
    let foundKey = Object.keys(officers).find(k => 
      k.toLowerCase() === cleanUser || 
      k.toLowerCase() === username.trim().toLowerCase()
    );

    let officer = foundKey 
      ? officers[foundKey] 
      : (DEFAULT_USERS[cleanUser] ? { ...DEFAULT_USERS[cleanUser] } : null);

    // Nếu chưa tồn tại trong store (ví dụ tài khoản vừa tạo hoặc từ phiên khác), tự động upsert
    if (!officer) {
      officer = {
        username: cleanUser,
        password: updates.password || 'MotCua@2026',
        name: updates.name ? updates.name.trim() : (updates.role === 'ADMIN' ? 'Quản Trị Viên' : 'Cán Bộ Một Cửa'),
        role: updates.role === 'ADMIN' ? 'ADMIN' : 'OFFICER',
        department: updates.department || 'Bộ phận Một cửa',
        status: 'ONLINE',
        isLocked: false,
        processedCount: 0,
        createdAt: new Date().toISOString()
      };
      foundKey = cleanUser;
    }

    if (updates.password) officer.password = updates.password;
    if (updates.name) officer.name = updates.name.trim();
    if (updates.role) officer.role = updates.role;
    if (updates.department) officer.department = updates.department;
    if (typeof updates.isLocked === 'boolean') officer.isLocked = updates.isLocked;
    if (updates.status) officer.status = updates.status;
    if (typeof updates.processedCount === 'number') officer.processedCount = updates.processedCount;
    officer.updatedAt = new Date().toISOString();

    officers[foundKey || cleanUser] = officer;
    globalThis.__HIEPHOA_SECURITY_STORE__.officers = officers;
    this.saveStore();

    return {
      username: officer.username,
      name: officer.name,
      role: officer.role,
      department: officer.department,
      status: officer.status,
      isLocked: officer.isLocked,
      processedCount: officer.processedCount,
      updatedAt: officer.updatedAt
    };
  }

  // Lấy danh sách toàn bộ cán bộ & admin
  getAllOfficers() {
    this.loadStore();
    const officers = globalThis.__HIEPHOA_SECURITY_STORE__.officers || {};
    return Object.values(officers).map(o => ({
      username: o.username,
      name: o.name,
      role: o.role,
      department: o.department || 'Bộ phận Một cửa',
      status: o.status || 'ONLINE',
      isLocked: Boolean(o.isLocked),
      processedCount: o.processedCount || 0,
      createdAt: o.createdAt || new Date().toISOString()
    }));
  }

  // Xác thực tài khoản (hỗ trợ cả tài khoản mặc định và tài khoản mới tạo)
  authenticateUser(username, password) {
    this.loadStore();
    if (!username || !password) return null;
    const cleanUser = decodeURIComponent(username).trim().toLowerCase();
    const officers = globalThis.__HIEPHOA_SECURITY_STORE__.officers || {};
    
    // Tìm kiếm theo username không phân biệt chữ hoa thường
    let foundKey = Object.keys(officers).find(k => 
      k.toLowerCase() === cleanUser || 
      k.toLowerCase() === username.trim().toLowerCase()
    );

    const u = foundKey ? officers[foundKey] : DEFAULT_USERS[cleanUser];

    if (!u) return null;
    if (u.isLocked) {
      throw new Error('Tài khoản này đã bị tạm khóa. Vui lòng liên hệ Quản trị viên.');
    }

    if (u.password === password) {
      u.status = 'ONLINE';
      u.lastLogin = new Date().toISOString();
      officers[foundKey || cleanUser] = u;
      this.saveStore();

      return {
        username: u.username,
        role: u.role,
        name: u.name,
        department: u.department
      };
    }
    return null;
  }


  // Sinh JWT Token
  generateToken(user, deviceId) {
    return jwt.sign(
      {
        username: user.username,
        role: user.role,
        name: user.name,
        deviceId
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
  }

  // Giải mã JWT Token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  }
}

module.exports = new SecurityService();
