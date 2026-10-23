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
  Sparkles
} from 'lucide-react';

export default function AdminDeviceManager({ authToken }) {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'LOCKED', 'WARNING'

  const token = authToken || localStorage.getItem('hiephoa_auth_token') || sessionStorage.getItem('hiephoa_auth_token');

  // Tải danh sách thiết bị từ Backend API
  const fetchDevices = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      } else {
        const err = await res.json();
        setActionMessage({ type: 'error', text: err.error || 'Không thể tải danh sách thiết bị.' });
      }
    } catch (err) {
      console.error('Fetch devices error:', err);
      setActionMessage({ type: 'error', text: 'Lỗi mạng khi tải danh sách thiết bị.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Reset 1 thiết bị về 0/5
  const handleResetDevice = async (deviceId) => {
    try {
      const res = await fetch(`/api/admin/devices/${encodeURIComponent(deviceId)}/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: `✅ Đã mở khóa & đặt lại lượt đăng nhập về 0/5 cho thiết bị [${deviceId}]` });
        fetchDevices();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Không thể reset thiết bị.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Lỗi máy chủ khi reset thiết bị.' });
    }
  };

  // Reset tất cả thiết bị
  const handleResetAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn mở khóa và Reset toàn bộ các thiết bị bị khóa về 0/5?')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/devices/reset-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: `✅ Đã mở khóa toàn bộ ${data.unlockedCount} thiết bị thành công!` });
        fetchDevices();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Lỗi khi reset toàn bộ.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Lỗi kết nối khi reset toàn bộ.' });
    }
  };

  // Tạo thiết bị demo đang bị khóa cứng 5/5
  const handleCreateDemo = async () => {
    try {
      const res = await fetch('/api/admin/devices/demo-lock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: `🎯 Đã tạo thành công thiết bị mẫu [${data.device.deviceId}] đang bị KHÓA CỨNG (5/5 sai) để demo!` });
        fetchDevices();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Không thể tạo demo.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Lỗi khi tạo thiết bị demo.' });
    }
  };

  // Tính toán số liệu thống kê
  const totalCount = devices.length;
  const lockedCount = devices.filter(d => d.isLocked || d.failedCount >= 5).length;
  const warningCount = devices.filter(d => !d.isLocked && d.failedCount > 0 && d.failedCount < 5).length;
  const safeCount = devices.filter(d => !d.isLocked && d.failedCount === 0).length;

  // Lọc thiết bị hiển thị
  const filteredDevices = devices.filter(d => {
    if (filter === 'LOCKED') return d.isLocked || d.failedCount >= 5;
    if (filter === 'WARNING') return !d.isLocked && d.failedCount > 0 && d.failedCount < 5;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 animate-fadeIn">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-100 text-red-800 text-[11px] font-black uppercase tracking-wider">
              Bảo Mật Cấp Cao (Admin Only)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Quản Trị Bảo Mật & Mở Khóa Thiết Bị Cán Bộ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Giám sát nhận diện phần cứng, tự động khóa cứng sau 5 lần nhập sai tài khoản và reset lượt truy cập.
          </p>
        </div>

        {/* CÁC NÚT HÀNH ĐỘNG NHANH */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCreateDemo}
            className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Tạo nhanh 1 thiết bị điện thoại mẫu đang bị khóa cứng 5/5 để biểu diễn trước BGK"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Tạo thiết bị khóa mẫu (Demo BGK)</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            disabled={lockedCount === 0}
            className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Unlock className="w-4 h-4" />
            <span>Reset tất cả ({lockedCount})</span>
          </button>

          <button
            type="button"
            onClick={fetchDevices}
            disabled={isLoading}
            className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* THÔNG BÁO HÀNH ĐỘNG */}
      {actionMessage && (
        <div className={`mt-4 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-900 border border-red-300'
        }`}>
          <span>{actionMessage.text}</span>
          <button type="button" onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* 4 CARD THỐNG KÊ NHANH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">Tổng thiết bị ghi nhận</div>
          <div className="text-2xl font-black mt-1">{totalCount}</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('LOCKED')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filter === 'LOCKED' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
          }`}
        >
          <div className="text-[11px] font-black uppercase text-red-700 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Đã khóa cứng (5/5)</span>
          </div>
          <div className="text-2xl font-black text-red-700 mt-1">{lockedCount} thiết bị</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('WARNING')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filter === 'WARNING' ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <div className="text-[11px] font-bold uppercase text-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cảnh báo (1-4 lần sai)</span>
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1">{warningCount} thiết bị</div>
        </button>

        <div className="p-3.5 rounded-2xl border bg-emerald-50 text-emerald-900 border-emerald-200 text-left">
          <div className="text-[11px] font-bold uppercase text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hợp lệ / Bình thường</span>
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{safeCount} thiết bị</div>
        </div>
      </div>

      {/* BẢNG DANH SÁCH THIẾT BỊ */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Thiết Bị & Fingerprint</th>
              <th className="py-3.5 px-4">IP & Trình duyệt</th>
              <th className="py-3.5 px-4">Tài khoản thử</th>
              <th className="py-3.5 px-4 text-center">Lượt sai</th>
              <th className="py-3.5 px-4 text-center">Trạng thái khóa</th>
              <th className="py-3.5 px-4 text-right">Hành động Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 font-semibold">
                  Chưa ghi nhận thiết bị nào trong danh sách bộ nhớ.
                </td>
              </tr>
            ) : (
              filteredDevices.map((dev) => {
                const isDevLocked = dev.isLocked || dev.failedCount >= 5;
                const isWarning = !isDevLocked && dev.failedCount > 0;

                return (
                  <tr key={dev.deviceId} className={`hover:bg-slate-50 transition-colors ${isDevLocked ? 'bg-red-50/40' : ''}`}>
                    
                    {/* Thiết Bị & Fingerprint */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                          isDevLocked ? 'bg-red-600 text-white' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{dev.deviceName || 'Thiết bị không rõ'}</div>
                          <div className="font-mono text-[10px] text-slate-500 font-semibold">
                            ID: {dev.deviceId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* IP & Trình duyệt */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{dev.ipAddress || '127.0.0.1'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                        {dev.userAgent || 'Trình duyệt Web'}
                      </div>
                    </td>

                    {/* Tài khoản thử */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dev.lastUsername || '—'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{dev.lockedAt ? new Date(dev.lockedAt).toLocaleTimeString('vi-VN') : 'Mới cập nhật'}</span>
                      </div>
                    </td>

                    {/* Lượt sai */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-black text-xs ${
                        isDevLocked
                          ? 'bg-red-600 text-white shadow-sm animate-pulse'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {dev.failedCount || 0} / 5
                      </span>
                    </td>

                    {/* Trạng thái khóa */}
                    <td className="py-3.5 px-4 text-center">
                      {isDevLocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-black text-[11px] border border-red-300">
                          <Lock className="w-3 h-3 text-red-600" />
                          <span>5/5 - ĐÃ KHÓA CỨNG</span>
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>CẢNH BÁO ({dev.failedCount}/5)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>HỢP LỆ (0/5)</span>
                        </span>
                      )}
                    </td>

                    {/* Hành động Reset */}
                    <td className="py-3.5 px-4 text-right">
                      {dev.failedCount > 0 || isDevLocked ? (
                        <button
                          type="button"
                          onClick={() => handleResetDevice(dev.deviceId)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-sm flex items-center gap-1 ml-auto cursor-pointer transition-all"
                          title="Mở khóa thiết bị và đặt lại lượt sai về 0"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset 0/5 (Mở khóa)</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-semibold italic">
                          Không cần mở khóa
                        </span>
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
  );
}
