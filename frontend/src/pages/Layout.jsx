import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    setSidebarOpen(false);
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/kategori', label: 'Kategori', icon: '🏷️' },
    { path: '/barang', label: 'Barang', icon: '📦' },
    { path: '/supplier', label: 'Supplier', icon: '🚚' },
    { path: '/masuk', label: 'Barang Masuk', icon: '📥' },
    { path: '/keluar', label: 'Barang Keluar', icon: '📤' },
    { path: '/laporan', label: 'Laporan', icon: '📋' },
    { path: '/settings', label: 'Pengaturan', icon: '⚙️' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-700 text-white rounded-lg shadow-lg"
      >
        ☰
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-700 to-slate-800 text-white flex flex-col h-full transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-600 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">☕ Andung Cafe</h1>
            <p className="text-xs text-slate-400 mt-1">Sistem Informasi Inventory</p>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-white text-xl">✕</button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
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
              onClick={closeSidebar}
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
      <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}