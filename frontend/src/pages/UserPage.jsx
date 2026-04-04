import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

export default function UserPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { const { data } = await getUsers(); setData(data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    try {
      if (modal.mode === 'add') await createUser(payload);
      else await updateUser(modal.data.id, payload);
      setModal({ open: false, mode: 'add', data: null });
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus?')) return;
    try { await deleteUser(id); loadData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
        <button onClick={() => setModal({ open: true, mode: 'add', data: null })} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-amber-700">
          + Tambah User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-800">bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-800">ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-800">Username</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-800">Nama Lengkap</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-800">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-800">Dibuat</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-800">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-orange-100">
                <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                <td className="px-6 py-4 text-sm font-mono">{item.username}</td>
                <td className="px-6 py-4 text-sm font-medium">{item.nama_lengkap}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    item.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{item.created_at?.slice(0,10)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setModal({ open: true, mode: 'edit', data: item })} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{modal.mode === 'add' ? 'Tambah' : 'Edit'} User</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Username</label>
                <input name="username" defaultValue={modal.data?.username} className="w-full border rounded-lg px-3 py-2" required disabled={modal.mode === 'edit'} /></div>
              {modal.mode === 'add' && (
                <div className="mb-3"><label className="block text-sm font-medium mb-1">Password</label>
                  <input name="password" type="password" className="w-full border rounded-lg px-3 py-2" required /></div>
              )}
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input name="nama_lengkap" defaultValue={modal.data?.nama_lengkap} className="w-full border rounded-lg px-3 py-2" required /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" defaultValue={modal.data?.role || 'staff'} className="w-full border rounded-lg px-3 py-2">
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="owner">Owner</option>
                </select></div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModal({ open: false, mode: 'add', data: null })} className="px-4 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}