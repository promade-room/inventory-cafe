import { useState, useEffect } from 'react';
import { getMasuk, getBarangs, getSuppliers, createMasuk, deleteMasuk } from '../services/api';

export default function MasukPage() {
  const [data, setData] = useState([]);
  const [barangs, setBarangs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  useEffect(() => { loadData(); loadOptions(); }, []);

  const loadData = async () => {
    try { const { data } = await getMasuk(); setData(data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadOptions = async () => {
    try {
      const [b, s] = await Promise.all([getBarangs({}), getSuppliers()]);
      setBarangs(b.data); setSuppliers(s.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    payload.barang_id = parseInt(payload.barang_id);
    payload.supplier_id = payload.supplier_id ? parseInt(payload.supplier_id) : null;
    payload.jumlah = parseInt(payload.jumlah);
    payload.harga_satuan = parseFloat(payload.harga_satuan);
    try {
      await createMasuk(payload);
      setModal(false);
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus?')) return;
    try { await deleteMasuk(id); loadData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Barang Masuk</h1>
        <button onClick={() => setModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-amber-700">
          + Tambah Barang Masuk
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Tanggal</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Kode</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Barang</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Supplier</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-200">Jumlah</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-200">Harga</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Batch</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Exp</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-200">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-orange-100">
                <td className="px-4 py-3 text-sm">{item.tanggal_masuk}</td>
                <td className="px-4 py-3 text-sm font-mono">{item.barang_kode}</td>
                <td className="px-4 py-3 text-sm font-medium">{item.barang_nama}</td>
                <td className="px-4 py-3 text-sm">{item.supplier_nama || '-'}</td>
                <td className="px-4 py-3 text-right font-medium">{item.jumlah}</td>
                <td className="px-4 py-3 text-right">Rp {parseFloat(item.harga_satuan).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-200">{item.batch_number}</td>
                <td className="px-4 py-3 text-sm">{item.tanggal_kadaluarsa || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="text-center py-8 text-gray-200">Tidak ada data</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tambah Barang Masuk</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Barang</label>
                <select name="barang_id" className="w-full border rounded-lg px-3 py-2" required>
                  <option value="">Pilih Barang</option>
                  {barangs.map(b => <option key={b.id} value={b.id}>{b.kode} - {b.nama}</option>)}
                </select></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Supplier</label>
                <select name="supplier_id" className="w-full border rounded-lg px-3 py-2">
                  <option value="">Pilih Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Jumlah</label>
                <input type="number" name="jumlah" className="w-full border rounded-lg px-3 py-2" required /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Harga Satuan</label>
                <input type="number" name="harga_satuan" step="0.01" className="w-full border rounded-lg px-3 py-2" required /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Tanggal Masuk</label>
                <input type="date" name="tanggal_masuk" defaultValue={new Date().toISOString().slice(0,10)} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Tanggal Kadaluarsa (opsional)</label>
                <input type="date" name="tanggal_kadaluarsa" className="w-full border rounded-lg px-3 py-2" /></div>
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