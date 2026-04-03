import { useState, useEffect } from 'react';
import { getKeluar, getBarangs, createKeluar, deleteKeluar } from '../services/api';

export default function KeluarPage() {
  const [data, setData] = useState([]);
  const [barangs, setBarangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  useEffect(() => { loadData(); loadBarangs(); }, []);

  const loadData = async () => {
    try { const { data } = await getKeluar(); setData(data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadBarangs = async () => {
    try { const { data } = await getBarangs({}); setBarangs(data); }
    catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    payload.barang_id = parseInt(payload.barang_id);
    payload.jumlah = parseInt(payload.jumlah);
    try {
      await createKeluar(payload);
      setModal(false);
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus?')) return;
    try { await deleteKeluar(id); loadData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Barang Keluar</h1>
        <button onClick={() => setModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-amber-700">
          + Tambah Barang Keluar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tanggal</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Kode</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Barang</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Jumlah</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Keterangan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{item.tanggal_keluar}</td>
                <td className="px-4 py-3 text-sm font-mono">{item.barang_kode}</td>
                <td className="px-4 py-3 text-sm font-medium">{item.barang_nama}</td>
                <td className="px-4 py-3 text-right font-medium">{item.jumlah}</td>
                <td className="px-4 py-3 text-sm">{item.keterangan || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.user_nama}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="text-center py-8 text-gray-500">Tidak ada data</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tambah Barang Keluar (FIFO)</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Barang</label>
                <select name="barang_id" className="w-full border rounded-lg px-3 py-2" required onChange={() => {}}>
                  <option value="">Pilih Barang</option>
                  {barangs.map(b => <option key={b.id} value={b.id}>{b.kode} - {b.nama} (Stok: {b.stok_sekarang || 0})</option>)}
                </select></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Jumlah</label>
                <input type="number" name="jumlah" className="w-full border rounded-lg px-3 py-2" required /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Tanggal Keluar</label>
                <input type="date" name="tanggal_keluar" defaultValue={new Date().toISOString().slice(0,10)} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Keterangan</label>
                <select name="keterangan" className="w-full border rounded-lg px-3 py-2">
                  <option value="">Pilih Keterangan</option>
                  <option value="Produksi">Produksi</option>
                  <option value="Rusak">Rusak</option>
                  <option value="Sample">Sample</option>
                  <option value="Lainnya">Lainnya</option>
                </select></div>
              <p className="text-sm text-gray-500 mb-4">Sistem akan otomatis mengurangi dari batch tertua (FIFO)</p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}