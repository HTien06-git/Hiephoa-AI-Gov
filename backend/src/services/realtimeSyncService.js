const fs = require('fs');
const path = require('path');

// Môi trường Vercel Serverless ghi vào /tmp, local ghi vào src/data
const isVercel = Boolean(process.env.VERCEL);
const DB_FILE = isVercel
  ? path.join('/tmp', 'hiephoa_realtime_db.json')
  : path.resolve(__dirname, '../data/hiephoa_realtime_db.json');

// Khởi tạo 03 Hồ sơ Demo thực tế tại UBND xã Hiệp Hòa
const INITIAL_DEMO_SUBMISSIONS = [
  {
    submissionCode: 'HH-1021',
    procedureId: 'PROC_KHAI_SINH',
    procedureTitle: 'Đăng ký khai sinh thông thường',
    citizenName: 'NGUYỄN VĂN AN',
    citizenPhone: '0912345678',
    citizenCccd: '072085012345',
    hamlet: 'Ấp Văn Hiệp',
    formData: {
      ho_ten_nguoi_yeu_cau: 'NGUYỄN VĂN AN',
      so_cccd: '072085012345',
      ngay_cap_cccd: '12/04/2022',
      noi_thuong_tru: 'Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh',
      quan_he_voi_tre: 'Cha đẻ',
      ho_ten_tre: 'NGUYỄN MINH KHÔI',
      gioi_tinh_tre: 'Nam',
      ngay_sinh_tre: '10/10/2026',
      noi_sinh_tre: 'Trung tâm Y tế huyện Đức Hòa',
      dan_toc_tre: 'Kinh',
      quoc_tich_tre: 'Việt Nam',
      ho_ten_cha: 'NGUYỄN VĂN AN',
      ho_ten_me: 'LÊ THỊ MAI',
      nam_sinh_me: '1988',
      so_cccd_me: '072188004567'
    },
    preCheckResult: {
      status: 'PASS',
      score: 95,
      voice_summary: 'Ảnh chụp CCCD và Giấy chứng sinh rõ nét, hợp lệ.'
    },
    status: 'WAITING', // WAITING | PROCESSING | COMPLETED | NEEDS_SUPPLEMENT
    assignedOfficer: 'Chờ tiếp nhận',
    officerNote: '',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  },
  {
    submissionCode: 'HH-1022',
    procedureId: 'PROC_KET_HON',
    procedureTitle: 'Đăng ký kết hôn',
    citizenName: 'TRẦN VĂN ĐỨC',
    citizenPhone: '0933998877',
    citizenCccd: '072093005678',
    hamlet: 'Ấp Hòa Hiệp',
    formData: {
      ho_ten_nam: 'TRẦN VĂN ĐỨC',
      ngay_sinh_nam: '12/03/1993',
      so_cccd_nam: '072093005678',
      noi_thuong_tru_nam: 'Ấp Văn Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh',
      ho_ten_nu: 'NGUYỄN THỊ HOA',
      ngay_sinh_nu: '20/07/1996',
      so_cccd_nu: '072196007890',
      noi_thuong_tru_nu: 'Ấp Hòa Hiệp, xã Hiệp Hòa, tỉnh Tây Ninh',
      lan_ket_hon_nam: 'Lần thứ nhất',
      lan_ket_hon_nu: 'Lần thứ nhất'
    },
    preCheckResult: {
      status: 'PASS',
      score: 98,
      voice_summary: 'Hồ sơ 2 bên nam nữ đầy đủ giấy tờ hợp lệ.'
    },
    status: 'PROCESSING',
    assignedOfficer: 'Trần Văn Hòa (Tư pháp - Hộ tịch)',
    officerNote: 'Cán bộ đang kiểm tra và in bản chính Giấy chứng nhận kết hôn.',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    submissionCode: 'HH-1023',
    procedureId: 'PROC_TINH_TRANG_HON_NHAN',
    procedureTitle: 'Xác nhận tình trạng hôn nhân (Độc thân)',
    citizenName: 'LÊ HOÀNG NAM',
    citizenPhone: '0977889900',
    citizenCccd: '072096001234',
    hamlet: 'Ấp Rừng Dầu',
    formData: {
      ho_ten: 'LÊ HOÀNG NAM',
      gioi_tinh: 'Nam',
      ngay_sinh: '15/06/1996',
      dan_toc: 'Kinh',
      quoc_tich: 'Việt Nam',
      so_cccd: '072096001234',
      noi_thuong_tru: 'Ấp Rừng Dầu, xã Hiệp Hòa, tỉnh Tây Ninh',
      tinh_trang_hon_nhan: 'Chưa đăng ký kết hôn với ai bao giờ (Độc thân)',
      muc_dich_su_dung: 'Để vay vốn phát triển kinh tế hộ gia đình',
      so_luong_ban: '01'
    },
    preCheckResult: null,
    status: 'NEEDS_SUPPLEMENT',
    assignedOfficer: 'Nguyễn Thị Bích (Cán bộ Một cửa)',
    officerNote: 'Bà con mang thêm CCCD của cha mẹ để đối chiếu thông tin cư trú cũ nhé.',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

const INITIAL_STATS = {
  totalVisits: 1420,
  aiVoiceConsultations: 896,
  autoFormsCreated: 352,
  preCheckDocs: 228,
  completedSubmissions: 194
};

const INITIAL_ACTIVITY = [
  {
    id: 'act-1',
    text: 'Cán bộ Trần Văn Hòa đang tiếp nhận hồ sơ kết hôn mã HH-1022',
    time: '5 phút trước',
    type: 'officer'
  },
  {
    id: 'act-2',
    text: 'Người dân tại Ấp Văn Hiệp vừa tạo mã QR Đăng ký khai sinh HH-1021',
    time: '12 phút trước',
    type: 'submission'
  },
  {
    id: 'act-3',
    text: 'Bà con hỏi AI về quy trình tặng cho quyền sử dụng đất nông nghiệp',
    time: '18 phút trước',
    type: 'chat'
  },
  {
    id: 'act-4',
    text: 'AI Vision hoàn tất kiểm tra sơ bộ ảnh CCCD & Tờ khai hợp lệ 98%',
    time: '24 phút trước',
    type: 'precheck'
  }
];

// Khởi tạo global memory store để giữ trạng thái trên Vercel Serverless
if (!globalThis.__HIEPHOA_REALTIME_STORE__) {
  globalThis.__HIEPHOA_REALTIME_STORE__ = {
    counter: 1024,
    submissions: [...INITIAL_DEMO_SUBMISSIONS],
    stats: { ...INITIAL_STATS },
    activityFeed: [...INITIAL_ACTIVITY]
  };
}

class RealtimeSyncService {
  constructor() {
    this.loadStore();
  }

  loadStore() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.submissions)) {
          globalThis.__HIEPHOA_REALTIME_STORE__.submissions = parsed.submissions;
        }
        if (parsed && typeof parsed.counter === 'number') {
          globalThis.__HIEPHOA_REALTIME_STORE__.counter = parsed.counter;
        }
        if (parsed && parsed.stats) {
          globalThis.__HIEPHOA_REALTIME_STORE__.stats = {
            ...INITIAL_STATS,
            ...parsed.stats
          };
        }
        if (parsed && Array.isArray(parsed.activityFeed)) {
          globalThis.__HIEPHOA_REALTIME_STORE__.activityFeed = parsed.activityFeed;
        }
      }
    } catch (err) {
      console.warn('[RealtimeSyncService] Load store warning, fallback to memory:', err.message);
    }
  }

  saveStore() {
    try {
      const dataToSave = JSON.stringify(globalThis.__HIEPHOA_REALTIME_STORE__, null, 2);
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, dataToSave, 'utf8');
    } catch (err) {
      console.warn('[RealtimeSyncService] Save store fallback notice:', err.message);
    }
  }

  // Tạo mới hồ sơ trực tuyến từ người dân (POST /api/submissions)
  createSubmission(payload) {
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;
    const currentCodeNum = store.counter || 1024;
    const submissionCode = `HH-${currentCodeNum}`;
    store.counter = currentCodeNum + 1;

    // Trích xuất họ tên, điện thoại, cccd, ấp
    const formData = payload.formData || {};
    const citizenName =
      formData.ho_ten_nguoi_yeu_cau ||
      formData.ho_ten ||
      formData.ho_ten_nam ||
      payload.citizenName ||
      'Bà con xã Hiệp Hòa';
    const citizenPhone = formData.so_dien_thoai || payload.citizenPhone || '';
    const citizenCccd = formData.so_cccd || formData.so_cccd_nam || payload.citizenCccd || '';
    const hamlet =
      formData.ap_cu_tru ||
      (formData.noi_thuong_tru && formData.noi_thuong_tru.includes('Ấp')
        ? formData.noi_thuong_tru.split(',')[0].trim()
        : 'Xã Hiệp Hòa');

    const newSub = {
      submissionCode,
      procedureId: payload.procedureId || payload.formId || 'PROC_GENERAL',
      procedureTitle: payload.procedureTitle || payload.title || 'Thủ tục hành chính cấp xã',
      citizenName,
      citizenPhone,
      citizenCccd,
      hamlet,
      formData,
      preCheckResult: payload.preCheckResult || null,
      status: 'WAITING', // Mặc định chờ tiếp nhận
      assignedOfficer: 'Chờ tiếp nhận',
      officerNote: '',
      isNew: true, // Cờ báo mới cho màn hình cán bộ
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Đẩy lên đầu danh sách hàng đợi
    store.submissions.unshift(newSub);
    store.stats.autoFormsCreated = (store.stats.autoFormsCreated || 0) + 1;

    // Ghi nhật ký hoạt động
    this.addActivity({
      text: `Bà con ${citizenName} (${hamlet}) vừa gửi trực tuyến hồ sơ ${newSub.procedureTitle} [${submissionCode}]`,
      type: 'submission'
    });

    this.saveStore();
    return newSub;
  }

  // Lấy toàn bộ hàng đợi trực tuyến (GET /api/submissions/live)
  getLiveQueue() {
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;
    const now = Date.now();
    // Đánh dấu isNew nếu tạo trong vòng 60 giây
    const marked = store.submissions.map(sub => {
      const ageMs = now - new Date(sub.createdAt).getTime();
      return {
        ...sub,
        isNew: ageMs < 60000 && sub.status === 'WAITING'
      };
    });

    return {
      submissions: marked,
      stats: store.stats,
      activityFeed: (store.activityFeed || []).slice(0, 10),
      serverTime: new Date().toISOString()
    };
  }

  // Tra cứu theo mã hồ sơ (GET /api/submissions/:code)
  getSubmissionByCode(code) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;
    return store.submissions.find(s => s.submissionCode === clean) || null;
  }

  // Tra cứu linh hoạt theo Căn cước công dân (12 số CCCD), Số điện thoại hoặc Mã hồ sơ
  lookupSubmissions(query) {
    if (!query) return [];
    const q = query.trim().toUpperCase();
    const qDigits = q.replace(/[^0-9]/g, '');
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;

    return store.submissions.filter(s => {
      // 1. Khớp chính xác hoặc chứa mã hồ sơ (HH-1021)
      if (s.submissionCode && s.submissionCode.toUpperCase().includes(q)) return true;

      // 2. Khớp số CCCD (072...)
      if (qDigits && qDigits.length >= 6) {
        if (s.citizenCccd && s.citizenCccd.includes(qDigits)) return true;
        const fd = s.formData || {};
        if (fd.so_cccd && String(fd.so_cccd).includes(qDigits)) return true;
        if (fd.so_cccd_nam && String(fd.so_cccd_nam).includes(qDigits)) return true;
        if (fd.so_cccd_nu && String(fd.so_cccd_nu).includes(qDigits)) return true;
        if (fd.so_cccd_nguoi_yeu_cau && String(fd.so_cccd_nguoi_yeu_cau).includes(qDigits)) return true;
      }

      // 3. Khớp số điện thoại
      if (qDigits && qDigits.length >= 8 && s.citizenPhone && s.citizenPhone.includes(qDigits)) {
        return true;
      }

      // 4. Khớp họ tên người nộp
      if (s.citizenName && s.citizenName.toUpperCase().includes(q)) return true;

      return false;
    });
  }

  // Cập nhật hồ sơ bởi cán bộ Một cửa (PUT /api/submissions/:code)
  updateSubmission(code, updates) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;
    const index = store.submissions.findIndex(s => s.submissionCode === clean);
    if (index === -1) return null;

    const current = store.submissions[index];
    const prevStatus = current.status;

    // Cập nhật các trường
    if (updates.status) current.status = updates.status;
    if (updates.assignedOfficer) current.assignedOfficer = updates.assignedOfficer;
    if (updates.officerNote !== undefined) current.officerNote = updates.officerNote;
    if (updates.formData) current.formData = { ...current.formData, ...updates.formData };
    if (updates.citizenPhone) current.citizenPhone = updates.citizenPhone;
    current.updatedAt = new Date().toISOString();

    // Nếu hoàn tất hồ sơ, tăng bộ đếm hoàn thành
    if (updates.status === 'COMPLETED' && prevStatus !== 'COMPLETED') {
      store.stats.completedSubmissions = (store.stats.completedSubmissions || 0) + 1;
      this.addActivity({
        text: `Hồ sơ ${current.submissionCode} (${current.citizenName}) đã hoàn tất xử lý & in kết quả`,
        type: 'completed'
      });
    } else if (updates.status && updates.status !== prevStatus) {
      const statusMap = {
        PROCESSING: 'đang được xử lý tại quầy',
        NEEDS_SUPPLEMENT: 'cần bổ sung thêm giấy tờ',
        WAITING: 'chuyển sang hàng đợi chờ'
      };
      this.addActivity({
        text: `Hồ sơ ${current.submissionCode} ${statusMap[updates.status] || updates.status}`,
        type: 'officer'
      });
    }

    store.submissions[index] = current;
    this.saveStore();
    return current;
  }

  // Ghi nhật ký tương tác hỏi đáp AI
  recordChatEvent(message) {
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;
    store.stats.aiVoiceConsultations = (store.stats.aiVoiceConsultations || 0) + 1;
    store.stats.totalVisits = (store.stats.totalVisits || 0) + 1;

    const shortMsg = message.length > 50 ? message.slice(0, 48) + '...' : message;
    this.addActivity({
      text: `Bà con hỏi AI: "${shortMsg}"`,
      type: 'chat'
    });
    this.saveStore();
  }

  // Ghi nhận sự kiện kiểm tra ảnh giấy tờ
  recordPreCheckEvent(procTitle) {
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;
    store.stats.preCheckDocs = (store.stats.preCheckDocs || 0) + 1;
    this.addActivity({
      text: `AI hoàn tất kiểm tra sơ bộ giấy tờ: ${procTitle || 'Hồ sơ công dân'}`,
      type: 'precheck'
    });
    this.saveStore();
  }

  addActivity({ text, type }) {
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;
    if (!store.activityFeed) store.activityFeed = [];
    store.activityFeed.unshift({
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text,
      time: 'Vừa xong',
      type: type || 'general'
    });
    if (store.activityFeed.length > 25) {
      store.activityFeed = store.activityFeed.slice(0, 25);
    }
  }

  // Reset toàn bộ hồ sơ đã nộp về trạng thái trắng sạch cho triển khai vận hành thật
  resetAllSubmissions() {
    const store = globalThis.__HIEPHOA_REALTIME_STORE__;
    store.submissions = [];
    store.counter = 1001;
    store.stats = {
      totalVisits: 0,
      aiVoiceConsultations: 0,
      autoFormsCreated: 0,
      preCheckDocs: 0,
      completedSubmissions: 0
    };
    store.activityFeed = [
      {
        id: `act-${Date.now()}`,
        text: 'Quản trị viên đã làm sạch toàn bộ hàng đợi hồ sơ để sẵn sàng vận hành thực tế.',
        time: 'Vừa xong',
        type: 'admin'
      }
    ];
    this.saveStore();
    return store.submissions;
  }

  // Khôi phục hồ sơ
  resetDemoData() {
    return this.resetAllSubmissions();
  }
}

module.exports = new RealtimeSyncService();
