import React, { useState, useEffect } from 'react';
import CitizenHomePage from './pages/CitizenHomePage';
import OfficerScanPage from './pages/OfficerScanPage';
import OfficerLoginModal from './components/auth/OfficerLoginModal';

export default function App() {
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('hiephoa_auth_token') || sessionStorage.getItem('hiephoa_auth_token') || null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hiephoa_user') || sessionStorage.getItem('hiephoa_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [currentMode, setCurrentMode] = useState(() => {
    const hasToken = Boolean(localStorage.getItem('hiephoa_auth_token') || sessionStorage.getItem('hiephoa_auth_token'));
    if ((window.location.hash === '#/can-bo-mot-cua' || window.location.pathname === '/can-bo-mot-cua') && hasToken) {
      return 'officer';
    }
    return 'citizen';
  });

  // Xác thực token với Server khi khởi chạy
  useEffect(() => {
    if (!authToken) return;

    fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(async (res) => {
        if (res.status === 401) {
          // Token thực sự đã hết hạn hoặc bị từ chối
          handleLogout();
          return;
        }
        const data = await res.json();
        if ((data.success || data.valid) && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => {
        console.warn('Xác thực phiên trực tuyến tạm thời gián đoạn:', err);
        // Lỗi mạng hoặc server offline tạm thời: giữ nguyên phiên làm việc cục bộ
      });
  }, [authToken]);


  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/can-bo-mot-cua') {
        const hasToken = Boolean(localStorage.getItem('hiephoa_auth_token') || sessionStorage.getItem('hiephoa_auth_token'));
        if (hasToken) {
          setCurrentMode('officer');
        } else {
          // Chưa đăng nhập: Mở modal đăng nhập & đưa hash về trang chủ
          window.location.hash = '#/';
          setIsLoginModalOpen(true);
        }
      } else {
        setCurrentMode('citizen');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchMode = (mode) => {
    if (mode === 'officer') {
      const hasToken = Boolean(localStorage.getItem('hiephoa_auth_token') || sessionStorage.getItem('hiephoa_auth_token'));
      if (!hasToken) {
        setIsLoginModalOpen(true);
        return;
      }
      setCurrentMode('officer');
      window.location.hash = '#/can-bo-mot-cua';
    } else {
      setCurrentMode('citizen');
      window.location.hash = '#/';
    }
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    setIsLoginModalOpen(false);
    setCurrentMode('officer');
    window.location.hash = '#/can-bo-mot-cua';
  };

  const handleLogout = () => {
    localStorage.removeItem('hiephoa_auth_token');
    localStorage.removeItem('hiephoa_user');
    sessionStorage.removeItem('hiephoa_auth_token');
    sessionStorage.removeItem('hiephoa_user');
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentMode('citizen');
    window.location.hash = '#/';
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {currentMode === 'officer' && authToken ? (
        <OfficerScanPage
          onSwitchToCitizen={() => switchMode('citizen')}
          currentUser={currentUser}
          authToken={authToken}
          onLogout={handleLogout}
        />
      ) : (
        <CitizenHomePage
          onSwitchToOfficer={() => switchMode('officer')}
        />
      )}

      {/* Modal Đăng nhập Cán bộ & Quản trị viên */}
      <OfficerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
