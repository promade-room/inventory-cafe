import { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';

export default function SupplierPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { const { data } = await getSuppliers(); setData(data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    try {
      if (modal.mode === 'add') await createSupplier(payload);
      else await updateSupplier(modal.data.id, payload);
      setModal({ open: false, mode: 'add', data: null });
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus?')) return;
    try { await deleteSupplier(id); loadData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Supplier</h1>
        <button onClick={() => setModal({ open: true, mode: 'add', data: null })} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-amber-700">
          + Tambah Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-lg text-gray-800">{item.nama}</h3>
            <p className="text-sm text-gray-700 mt-1">📍 {item.alamat || '-'}</p>
            <p className="text-sm text-gray-700">📞 {item.telepon || '-'}</p>
            <p className="text-sm text-gray-700">✉️ {item.email || '-'}</p>
            {item.catatan && <p className="text-sm text-gray-400 mt-2 italic">"{item.catatan}"</p>}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button onClick={() => setModal({ open: true, mode: 'edit', data: item })} className="flex-1 text-blue-600 py-2 rounded border hover:bg-blue-50">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="flex-1 text-red-600 py-2 rounded border hover:bg-red-50">Hapus</button>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-gray-700 col-span-full text-center py-8">Tidak ada data</p>}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{modal.mode === 'add' ? 'Tambah' : 'Edit'} Supplier</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Nama</label>
                <input name="nama" defaultValue={modal.data?.nama} className="w-full border rounded-lg px-3 py-2" required /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Alamat</label>
                <textarea name="alamat" defaultValue={modal.data?.alamat} className="w-full border rounded-lg px-3 py-2" rows="2"></textarea></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Telepon</label>
                <input name="telepon" defaultValue={modal.data?.telepon} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" defaultValue={modal.data?.email} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea name="catatan" defaultValue={modal.data?.catatan} className="w-full border rounded-lg px-3 py-2" rows="2"></textarea></div>
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