import { useState } from 'react';

export default function SettingsPage() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok!' });
      return;
    }
    if (password.new.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter!' });
      return;
    }
    setMessage({ type: 'success', text: 'Password berhasil diubah!' });
    setPassword({ current: '', new: '', confirm: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profil User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input value={user.username || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nama Lengkap</label>
            <input value={user.nama_lengkap || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Role</label>
            <input value={user.role || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100 capitalize" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ubah Password</h2>
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handlePasswordChange}>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Password Saat Ini</label>
            <input type="password" value={password.current} onChange={(e) => setPassword({...password, current: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Password Baru</label>
            <input type="password" value={password.new} onChange={(e) => setPassword({...password, new: e.target.value})} className="w-full border rounded-lg px-3 py-2" required minLength="6" />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Konfirmasi Password Baru</label>
            <input type="password" value={password.confirm} onChange={(e) => setPassword({...password, confirm: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-amber-700">Simpan Password</button>
        </form>
      </div>
    </div>
  );
}