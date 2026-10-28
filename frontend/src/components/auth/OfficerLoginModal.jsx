import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { getDeviceFingerprint } from '../../utils/deviceFingerprint';
import { getSnapshotHeaders, saveClientSnapshot } from '../../services/persistentBackup';
import TrongDongWatermark from '../common/TrongDongWatermark';
import DongSonBorder from '../common/DongSonBorder';

export default function OfficerLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [warningInfo, setWarningInfo] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({ deviceId: '', deviceName: '' });
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Khởi tạo Device Fingerprint & Kiểm tra trạng thái khóa từ máy chủ
  useEffect(() => {
    if (!isOpen) return;

    const fp = getDeviceFingerprint();
    setDeviceInfo(fp);
    setErrorMessage('');
    setWarningInfo(null);

    // Kiểm tra trạng thái thiết bị từ Server
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/auth/device-status?deviceId=${encodeURIComponent(fp.deviceId)}`);
        if (res.ok) {
          const data = await res.json();
          setDeviceStatus(data);
          if (data.isLocked || (data.device && data.device.isLocked)) {
            setErrorMessage('THIẾT BỊ NÀY ĐÃ BỊ KHÓA DO NHẬP SAI TÀI KHOẢN QUÁ 5 LẦN. Vui lòng liên hệ Admin để Reset lượt đăng nhập.');
          }
        }
      } catch (err) {
        console.warn('Lỗi kiểm tra trạng thái thiết bị:', err);
      }
    };

    checkStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  const isLocked = Boolean(deviceStatus?.isLocked || (deviceStatus?.device && deviceStatus.device.isLocked) || deviceStatus?.failedCount >= 5);

  const handleCopyDeviceId = () => {
    if (!deviceInfo.deviceId) return;
    navigator.clipboard.writeText(deviceInfo.deviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setWarningInfo(null);

    try {
      const payload = {
        username: username.trim(),
        password,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName
      };

      let snapHeaders = {};
      try { snapHeaders = getSnapshotHeaders(); } catch (e) {}

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...snapHeaders
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.status === 403) {
        // Thiết bị đã bị khóa cứng sau 5 lần sai
        setDeviceStatus({ isLocked: true, failedCount: 5, ...data });
        setErrorMessage(data.message || 'THIẾT BỊ NÀY ĐÃ BỊ KHÓA DO NHẬP SAI TÀI KHOẢN QUÁ 5 LẦN. Vui lòng liên hệ Admin để Reset lượt đăng nhập.');
        return;
      }

      if (!res.ok) {
        // Nhập sai từ lần 1-4 hoặc lỗi xác thực
        if (data.failedCount !== undefined) {
          setWarningInfo({
            failedCount: data.failedCount,
            remainingAttempts: data.remainingAttempts
          });
          setErrorMessage(data.message);
          setDeviceStatus(prev => ({ ...(prev || {}), failedCount: data.failedCount, isLocked: data.isLocked }));
        } else {
          setErrorMessage(data.error || data.message || 'Đăng nhập không thành công.');
        }
        return;
      }

      // Đăng nhập thành công
      if (data.token) {
        if (data.clientSnapshot) {
          saveClientSnapshot(data.clientSnapshot);
        }
        localStorage.setItem('hiephoa_auth_token', data.token);
        localStorage.setItem('hiephoa_user', JSON.stringify(data.user));
        sessionStorage.setItem('hiephoa_auth_token', data.token);
        sessionStorage.setItem('hiephoa_user', JSON.stringify(data.user));
        
        onLoginSuccess(data.user, data.token);
        onClose();
      }
    } catch (err) {
      console.error('Lỗi kết nối máy chủ đăng nhập:', err);
      setErrorMessage('Không thể kết nối máy chủ. Vui lòng kiểm tra lại mạng hoặc thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-red-700/30 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Background Họa tiết Trống đồng Đông Sơn mờ chìm */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] overflow-hidden flex items-center justify-center">
          <TrongDongWatermark size={500} opacity={1} />
        </div>

        {/* HEADER MODAL */}
        <div className="relative bg-gradient-to-r from-red-800 via-red-700 to-amber-700 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center backdrop-blur-sm">
                {isLocked ? (
                  <ShieldAlert className="w-6 h-6 text-red-300 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-amber-300" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-amber-300">
                  Cổng Cán Bộ & Quản Trị Viên
                </h3>
                <p className="text-xs text-red-100 font-medium">
                  UBND Xã Hiệp Hòa, Tỉnh Tây Ninh
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ĐƯỜNG DIỀM ĐÔNG SƠN TRUYỀN THỐNG */}
        <DongSonBorder height={6} />

        {/* NỘI DUNG FORM HOẶC MÀN HÌNH KHÓA */}
        <div className="relative p-6 overflow-y-auto flex-1">
          
          {/* MÀN HÌNH KHÓA CỨNG KHI NHẬP SAI 5 LẦN */}
          {isLocked ? (
            <div className="bg-red-50 border-2 border-red-600 rounded-2xl p-5 text-center animate-shake">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
                <Lock className="w-8 h-8" />
              </div>
              
              <h4 className="text-lg font-black text-red-700 uppercase tracking-tight mb-2">
                THIẾT BỊ NÀY ĐÃ BỊ KHÓA CỨNG
              </h4>
              
              <p className="text-sm font-bold text-red-900 leading-relaxed mb-4">
                Thiết bị đã nhập sai tài khoản quá 5/5 lần theo quy định bảo mật.<br />
                <span className="text-xs text-red-700 font-semibold">
                  (Kể cả nhập đúng mật khẩu ở lần kế tiếp cũng KHÔNG được phép truy cập).
                </span>
              </p>

              <div className="bg-white rounded-xl p-3 border border-red-200 text-left text-xs mb-4 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>Tên thiết bị:</span>
                  <span className="font-bold text-slate-900">{deviceInfo.deviceName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>Mã định danh thiết bị (Device ID):</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-black text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      {deviceInfo.deviceId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDeviceId}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                      title="Sao chép mã thiết bị"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>Trạng thái bảo mật:</span>
                  <span className="font-bold text-red-600">5/5 - ĐÃ KHÓA CỨNG TOÀN DIỆN</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold mb-4">
                👉 Vui lòng liên hệ <strong>Quản trị viên (Admin)</strong> để được kiểm tra và bấm nút <strong>"Reset lượt đăng nhập về 0/5"</strong> trên Bảng Quản trị.
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition-all"
              >
                Đóng cửa sổ & Về giao diện nhân dân
              </button>
            </div>
          ) : (
            /* FORM ĐĂNG NHẬP THƯỜNG */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* CẢNH BÁO NHẬP SAI TỪ LẦN 1 ĐẾN 4 */}
              {warningInfo && warningInfo.failedCount > 0 && (
                <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-3.5 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <p className="font-black text-amber-800">
                      CẢNH BÁO BẢO MẬT: Nhập sai {warningInfo.failedCount}/5 lần!
                    </p>
                    <p className="mt-0.5">
                      Còn <strong>{warningInfo.remainingAttempts}</strong> lần thử trước khi thiết bị này bị khóa cứng.
                    </p>
                  </div>
                </div>
              )}

              {/* LỖI THÔNG THƯỜNG */}
              {errorMessage && !warningInfo && (
                <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-2 text-xs text-red-800 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TÀI KHOẢN */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">
                  Tên tài khoản (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên tài khoản (Ví dụ: admin hoặc tên cán bộ)"
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* MẬT KHẨU */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">
                  Mật khẩu bảo mật
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* THÔNG TIN THIẾT BỊ ĐANG SỬ DỤNG */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    Thiết bị:
                  </span>
                  <span className="font-bold text-slate-800">{deviceInfo.deviceName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mã Fingerprint:</span>
                  <span className="font-mono font-bold text-slate-700">{deviceInfo.deviceId}</span>
                </div>
              </div>

              {/* NÚT SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-black text-sm uppercase tracking-wide shadow-lg shadow-red-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang xác thực hệ thống...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Đăng Nhập Hệ Thống</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
