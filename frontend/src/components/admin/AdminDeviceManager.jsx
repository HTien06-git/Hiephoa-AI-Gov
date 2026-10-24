import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  Smartphone,
  Globe,
  Clock,
  User,
  CheckCircle2,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  Sparkles,
  UserPlus,
  Users,
  Eye,
  Check,
  Copy,
  Edit2
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function AdminDeviceManager({ authToken, initialSubTab = 'DEVICES' }) {
  const [subTab, setSubTab] = useState(initialSubTab); // 'DEVICES' | 'OFFICERS'
  const [devices, setDevices] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'LOCKED', 'WARNING'

  // Modal tạo tài khoản cán bộ mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newDepartment, setNewDepartment] = useState('Tư pháp - Hộ tịch');
  const [newRole, setNewRole] = useState('OFFICER'); // 'OFFICER' | 'ADMIN'
  const [isSubmittingOfficer, setIsSubmittingOfficer] = useState(false);

  // Modal đổi mật khẩu cán bộ
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [newOfficerPassword, setNewOfficerPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const token = authToken || localStorage.getItem('hiephoa_auth_token') || sessionStorage.getItem('hiephoa_auth_token');

  // Tải danh sách thiết bị
  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.devices || data.data || [];
        setDevices(list);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách thiết bị:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tải danh sách tài khoản cán bộ
  const fetchOfficers = async () => {
    try {
      const res = await fetch('/api/admin/officers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.officers || data.data || [];
        setOfficers(list);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách cán bộ:', err);
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchOfficers();
  }, []);

  // Reset 1 thiết bị về 0/5
  const handleResetDevice = async (deviceId) => {
    try {
      const res = await fetch(`/api/admin/devices/${encodeURIComponent(deviceId)}/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: `✅ Đã mở khóa & đặt lại lượt đăng nhập về 0/5 cho thiết bị [${deviceId}]` });
        fetchDevices();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Thao tác không thành công' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Lỗi mạng khi gọi lệnh mở khóa.' });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Reset toàn bộ thiết bị
  const handleResetAll = async () => {
    if (!window.confirm('Xác nhận mở khóa và reset tất cả thiết bị về 0/5?')) return;
    try {
      const res = await fetch('/api/admin/devices/reset-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: `✅ ${data.message}` });
        fetchDevices();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Lỗi khi reset toàn bộ thiết bị.' });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Tạo thiết bị khóa mẫu để biểu diễn tính năng trước Ban Giám khảo
  const handleCreateDemoLock = async () => {
    try {
      const res = await fetch('/api/admin/devices/demo-lock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: `🎯 Đã tạo thành công thiết bị giả lập bị khóa 5/5: [${data.device?.deviceId || 'HH-DEV-DEMO'}]`
        });
        fetchDevices();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Không thể tạo thiết bị khóa mẫu.' });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Tạo tài khoản cán bộ mới
  const handleCreateOfficerSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    setIsSubmittingOfficer(true);
    try {
      const res = await fetch('/api/admin/officers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newFullName,
          department: newDepartment,
          role: newRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: `✅ Đã tạo thành công tài khoản cán bộ "${newUsername}"!` });
        setShowCreateModal(false);
        setNewUsername('');
        setNewPassword('');
        setNewFullName('');
        fetchOfficers();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Không thể tạo tài khoản.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Lỗi kết nối khi tạo tài khoản.' });
    } finally {
      setIsSubmittingOfficer(false);
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Khóa / Mở khóa tài khoản cán bộ
  const handleToggleLockOfficer = async (officer) => {
    if (officer.username === 'admin') {
      alert('Không thể khóa tài khoản Quản Trị Viên (Admin) gốc.');
      return;
    }
    const newLockState = !officer.isLocked;
    const confirmText = newLockState
      ? `Xác nhận TẠM KHÓA tài khoản cán bộ [${officer.username}]?`
      : `Xác nhận MỞ KHÓA tài khoản cán bộ [${officer.username}]?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await apiClient.updateOfficer(officer.username, { isLocked: newLockState }, token);
      if (res && res.success) {
        setActionMessage({
          type: 'success',
          text: `✅ ${newLockState ? 'Đã tạm khóa' : 'Đã mở khóa'} tài khoản cán bộ "${officer.username}"!`
        });
        fetchOfficers();
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Cập nhật thất bại.' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Lỗi khi cập nhật trạng thái tài khoản.' });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Đổi mật khẩu cán bộ
  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!editingOfficer || !newOfficerPassword) return;

    setIsUpdatingPassword(true);
    try {
      const res = await apiClient.updateOfficer(
        editingOfficer.username,
        { password: newOfficerPassword },
        token
      );
      if (res && res.success) {
        setActionMessage({
          type: 'success',
          text: `✅ Đã đổi mật khẩu cho tài khoản "${editingOfficer.username}" thành công!`
        });
        setEditingOfficer(null);
        setNewOfficerPassword('');
        fetchOfficers();
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Không thể đổi mật khẩu.' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Lỗi mạng khi đổi mật khẩu.' });
    } finally {
      setIsUpdatingPassword(false);
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Lọc thiết bị theo trạng thái
  const filteredDevices = devices.filter((dev) => {
    if (filter === 'LOCKED') return dev.isLocked || dev.failedCount >= 5;
    if (filter === 'WARNING') return dev.failedCount > 0 && !dev.isLocked && dev.failedCount < 5;
    return true;
  });

  const totalLocked = devices.filter(d => d.isLocked || d.failedCount >= 5).length;
  const totalWarning = devices.filter(d => d.failedCount > 0 && !d.isLocked && d.failedCount < 5).length;

  return (
    <div className="bg-white rounded-3xl p-5 md:p-7 border border-slate-200/90 shadow-sm mt-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#991B1B] text-xs font-black uppercase mb-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>TRUNG TÂM QUẢN TRỊ BẢO MẬT & TÀI KHOẢN HỆ THỐNG</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Cán Bộ & Bảo Mật Thiết Bị Đăng Nhập
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Giám sát tài khoản trực tuyến, số lượng hồ sơ xử lý và cơ chế khóa cứng thiết bị nhập sai quá 5 lần.
          </p>
        </div>

        {/* CỤM NÚT SUBTABS */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSubTab('OFFICERS')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'OFFICERS'
                ? 'bg-[#991B1B] text-white shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tài Khoản Cán Bộ ({officers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('DEVICES')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              subTab === 'DEVICES'
                ? 'bg-[#991B1B] text-white shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Bảo Mật Thiết Bị (Khóa 5 Lần)</span>
            {totalLocked > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-black">
                {totalLocked}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* THÔNG BÁO HÀNH ĐỘNG */}
      {actionMessage && (
        <div className={`my-4 p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
            : 'bg-rose-50 text-rose-900 border border-rose-300'
        }`}>
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* ======================================================= */}
      {/* SUBTAB 1: QUẢN LÝ TÀI KHOẢN CÁN BỘ MỘT CỬA               */}
      {/* ======================================================= */}
      {subTab === 'OFFICERS' && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase">
                Danh Sách Cán Bộ Tiếp Nhận Tại Bộ Phận Một Cửa
              </h3>
              <p className="text-xs text-slate-500">
                Theo dõi trạng thái Trực tuyến / Ngoại tuyến và số lượng hồ sơ mỗi cán bộ đã giải quyết.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Cấp Thêm Tài Khoản Cán Bộ</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tài Khoản</th>
                  <th className="py-3 px-4">Cán Bộ & Bộ Phận</th>
                  <th className="py-3 px-4">Phân Quyền</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Hồ Sơ Đã Xử Lý</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {officers.map((officer) => {
                  const isOnline = officer.status === 'ONLINE';
                  const isLocked = Boolean(officer.isLocked);

                  return (
                    <tr key={officer.username} className={`hover:bg-slate-50 transition-colors ${isLocked ? 'bg-rose-50/50' : ''}`}>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        {officer.username}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{officer.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {officer.department || 'Bộ phận Một cửa UBND xã'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {officer.role === 'ADMIN' ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-black text-[10px] border border-purple-300">
                            QUẢN TRỊ VIÊN (ADMIN)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-300">
                            CÁN BỘ MỘT CỬA
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                            <Lock className="w-3 h-3 text-rose-600" />
                            ĐÃ TẠM KHÓA
                          </span>
                        ) : isOnline ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                            TRỰC TUYẾN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            NGOẠI TUYẾN
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-black text-slate-900 text-sm">
                        {officer.processedCount || 0} hồ sơ
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút đổi mật khẩu */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOfficer(officer);
                              setNewOfficerPassword('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                            title="Đổi mật khẩu"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                            <span className="hidden sm:inline">Đổi MK</span>
                          </button>

                          {/* Nút Khóa / Mở khóa (không cho khóa admin) */}
                          {officer.username !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleToggleLockOfficer(officer)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                                isLocked
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                              }`}
                              title={isLocked ? 'Mở khóa tài khoản' : 'Tạm khóa tài khoản'}
                            >
                              {isLocked ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Mở khóa</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Tạm khóa</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* SUBTAB 2: BẢO MẬT THIẾT BỊ & RESET KHÓA 5 LẦN          */}
      {/* ======================================================= */}
      {subTab === 'DEVICES' && (
        <div className="mt-5 space-y-4">
          {/* STATS STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase">Tổng thiết bị ghi nhận</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">{devices.length} máy</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-xs text-rose-700 font-bold uppercase">Thiết bị bị khóa cứng (5/5)</span>
              <div className="text-xl font-black text-rose-700 mt-0.5">{totalLocked} máy</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-800 font-bold uppercase">Đang cảnh báo (1-4 lần sai)</span>
              <div className="text-xl font-black text-amber-800 mt-0.5">{totalWarning} máy</div>
            </div>
          </div>

          {/* ACTIONS TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất cả ({devices.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('LOCKED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filter === 'LOCKED' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Đã khóa ({totalLocked})
              </button>
              <button
                type="button"
                onClick={() => setFilter('WARNING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filter === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cảnh báo ({totalWarning})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateDemoLock}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs"
                title="Tạo 1 thiết bị khóa mẫu để biểu diễn tính năng mở khóa"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tạo máy mẫu khóa 5/5</span>
              </button>

              <button
                type="button"
                onClick={handleResetAll}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1 shadow-2xs"
                title="Reset tất cả thiết bị về 0/5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mở khóa tất cả thiết bị</span>
              </button>

              <button
                type="button"
                onClick={fetchDevices}
                className="p-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600"
                title="Tải lại danh sách"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* BẢNG THIẾT BỊ */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Thiết Bị & Mã Định Danh</th>
                  <th className="py-3 px-4">Địa Chỉ IP</th>
                  <th className="py-3 px-4">Tài Khoản Thử</th>
                  <th className="py-3 px-4 text-center">Lượt Sai</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 font-medium">
                      Không có thiết bị nào trong danh mục lọc này.
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((dev) => {
                    const isDevLocked = dev.isLocked || dev.failedCount >= 5;
                    const isWarning = !isDevLocked && dev.failedCount > 0;

                    return (
                      <tr key={dev.deviceId} className={`hover:bg-slate-50 transition-colors ${isDevLocked ? 'bg-rose-50/40' : ''}`}>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{dev.deviceName || 'Thiết bị di động/PC'}</div>
                          <div className="font-mono text-[10px] text-slate-500">ID: {dev.deviceId}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {dev.ipAddress || '127.0.0.1'}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {dev.lastUsername || '—'}
                        </td>

                        <td className="py-3.5 px-4 text-center font-black">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            isDevLocked ? 'bg-rose-600 text-white' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {dev.failedCount || 0}/5
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isDevLocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black text-[10px] border border-rose-300">
                              <Lock className="w-3 h-3 text-rose-600" />
                              5/5 ĐÃ KHÓA CỨNG
                            </span>
                          ) : isWarning ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              CẢNH BÁO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              HỢP LỆ (0/5)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {(isDevLocked || dev.failedCount > 0) ? (
                            <button
                              type="button"
                              onClick={() => handleResetDevice(dev.deviceId)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs"
                              title="Mở khóa thiết bị"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Mở khóa 0/5</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Không bị khóa</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CẤP THÊM TÀI KHOẢN CÁN BỘ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-[#991B1B] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Cấp Tài Khoản Cán Bộ Mới</h3>
                  <p className="text-xs text-slate-500">Bộ phận Một cửa UBND xã Hiệp Hòa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOfficerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Tên tài khoản (Username) *
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ví dụ: canbo4, diachinh2..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Mật khẩu đăng nhập *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Họ và tên cán bộ *
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Thị Lan"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Bộ phận chuyên môn
                </label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none"
                >
                  <option value="Tư pháp - Hộ tịch">Tư pháp - Hộ tịch</option>
                  <option value="Địa chính - Xây dựng - Đất đai">Địa chính - Xây dựng - Đất đai</option>
                  <option value="Văn phòng - Chứng thực">Văn phòng - Chứng thực</option>
                  <option value="Lao động - Thương binh & Xã hội">Lao động - Thương binh & Xã hội</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Phân quyền
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none"
                >
                  <option value="OFFICER">Cán Bộ Một Cửa</option>
                  <option value="ADMIN">Quản Trị Viên (Admin)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOfficer}
                  className="px-5 py-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs uppercase shadow-sm disabled:opacity-50"
                >
                  {isSubmittingOfficer ? 'Đang tạo...' : 'Xác Nhận Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ĐỔI MẬT KHẨU CÁN BỘ */}
      {editingOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-amber-300 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Đổi Mật Khẩu Cán Bộ</h3>
                  <p className="text-xs text-slate-500 font-mono">{editingOfficer.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingOfficer(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Mật khẩu mới cho {editingOfficer.name} *
                </label>
                <input
                  type="password"
                  value={newOfficerPassword}
                  onChange={(e) => setNewOfficerPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOfficer(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold text-xs uppercase shadow-sm"
                >
                  {isUpdatingPassword ? 'Đang lưu...' : 'Lưu Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
