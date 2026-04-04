import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/kategori', label: 'Kategori', icon: '🏷️' },
    { path: '/barang', label: 'Barang', icon: '📦' },
    { path: '/supplier', label: 'Supplier', icon: '🚚' },
    { path: '/masuk', label: 'Barang Masuk', icon: '📥' },
    { path: '/keluar', label: 'Barang Keluar', icon: '📤' },
    { path: '/laporan', label: 'Laporan', icon: '📋' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-700 to-slate-800 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-600">
          <h1 className="text-xl font-bold">☕ Andung Cafe</h1>
          <p className="text-xs text-slate-400 mt-1">Sistem Informasi Inventory</p>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 hover:bg-slate-600 transition-colors ${
                  isActive ? 'bg-primary text-white border-l-4 border-orange-400' : ''
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 hover:bg-slate-600 transition-colors ${
                  isActive ? 'bg-primary text-white border-l-4 border-orange-400' : ''
                }`
              }
            >
              <span>👤</span>
              <span>Manajemen User</span>
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-slate-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
              {user?.nama_lengkap?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nama_lengkap || '-'}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || '-'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}