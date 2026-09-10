import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function AutoUpdateChecker() {
  const location = useLocation();
  const checkingRef = useRef(false);

  const checkVersion = async () => {
    if (checkingRef.current) return;
    // Abaikan saat mode dev (jika __APP_VERSION__ tidak di-inject)
    if (typeof __APP_VERSION__ === 'undefined') return;

    try {
      checkingRef.current = true;
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.version && data.version !== __APP_VERSION__) {
          const lastReloadedVersion = sessionStorage.getItem('__last_reloaded_version');
          if (lastReloadedVersion !== data.version) {
            sessionStorage.setItem('__last_reloaded_version', data.version);
            // Refresh halaman agar mendapatkan bundle JS & HTML versi terbaru
            window.location.reload(true);
          }
        }
      }
    } catch (err) {
      // Ignore network errors
    } finally {
      checkingRef.current = false;
    }
  };

  // Cek setiap perpindahan route
  useEffect(() => {
    checkVersion();
  }, [location.pathname]);

  // Cek saat tab browser kembali dibuka/fokus & polling berkala (setiap 60 detik)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    window.addEventListener('focus', checkVersion);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(checkVersion, 60 * 1000);

    return () => {
      window.removeEventListener('focus', checkVersion);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  return null;
}
