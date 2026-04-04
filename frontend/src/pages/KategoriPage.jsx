import { useState, useEffect } from 'react';
import { getKategoris, createKategori, updateKategori, deleteKategori } from '../services/api';

export default function KategoriPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await getKategoris();
      setData(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    try {
      if (modal.mode === 'add') await createKategori(payload);
      else await updateKategori(modal.data.id, payload);
      setModal({ open: false, mode: 'add', data: null });
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus?')) return;
    try { await deleteKategori(id); loadData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kategori Barang</h1>
        <button onClick={() => setModal({ open: true, mode: 'add', data: null })} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-amber-700">
          + Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-800"> className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-6 py-3 text-left text-sm font-medium text-gray-800">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-6 py-3 text-left text-sm font-medium text-gray-800">Nama</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-6 py-3 text-left text-sm font-medium text-gray-800">Icon</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-6 py-3 text-left text-sm font-medium text-gray-800">Warna</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-6 py-3 text-right text-sm font-medium text-gray-800">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-orange-100">
                <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.nama}</td>
                <td className="px-6 py-4 text-2xl">{item.icon || '📦'}</td>
                <td className="px-6 py-4">
                  <span className="inline-block w-6 h-6 rounded" style={{ backgroundColor: item.color || '#ccc' }}></span>
                </td>
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
            <h2 className="text-xl font-bold mb-4">{modal.mode === 'add' ? 'Tambah' : 'Edit'} Kategori</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input name="nama" defaultValue={modal.data?.nama} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
                <input name="icon" defaultValue={modal.data?.icon} className="w-full border rounded-lg px-3 py-2" placeholder="📦" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Warna</label>
                <input type="color" name="color" defaultValue={modal.data?.color || '#D97706'} className="w-full h-10 border rounded-lg" />
              </div>
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