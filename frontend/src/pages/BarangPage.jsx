import { useState, useEffect } from 'react';
import { getBarangs, getKategoris, createBarang, updateBarang, deleteBarang } from '../services/api';

export default function BarangPage() {
  const [data, setData] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [filter, setFilter] = useState({ search: '', kategori_id: '' });

  useEffect(() => { loadData(); loadKategori(); }, []);
  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    try {
      const { data } = await getBarangs(filter);
      setData(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadKategori = async () => {
    try { const { data } = await getKategoris(); setKategori(data); }
    catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    payload.kategori_id = payload.kategori_id || null;
    payload.minimal_stok = parseInt(payload.minimal_stok) || 0;
    try {
      if (modal.mode === 'add') await createBarang(payload);
      else await updateBarang(modal.data.id, payload);
      setModal({ open: false, mode: 'add', data: null });
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus?')) return;
    try { await deleteBarang(id); loadData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Barang</h1>
        <button onClick={() => setModal({ open: true, mode: 'add', data: null })} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-amber-700">
          + Tambah Barang
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <input placeholder="Cari kode/nama..." className="border rounded-lg px-4 py-2 flex-1"
          value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
        <select className="border rounded-lg px-4 py-2" value={filter.kategori_id}
          onChange={(e) => setFilter({ ...filter, kategori_id: e.target.value })}>
          <option value="">Semua Kategori</option>
          {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Kode</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Nama</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Kategori</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-200">Satuan</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-200">Stok</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-200">Min</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-200">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-orange-100">
                <td className="px-4 py-3 text-sm font-mono">{item.kode}</td>
                <td className="px-4 py-3 text-sm font-medium">{item.nama}</td>
                <td className="px-4 py-3 text-sm">{item.kategori_nama || '-'}</td>
                <td className="px-4 py-3 text-sm">{item.satuan}</td>
                <td className={`px-4 py-3 text-right font-bold ${item.stok_sekarang <= item.minimal_stok ? 'text-red-600' : 'text-green-600'}`}>
                  {item.stok_sekarang || 0}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-200">{item.minimal_stok}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setModal({ open: true, mode: 'edit', data: item })} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="text-center py-8 text-gray-200">Tidak ada data</p>}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{modal.mode === 'add' ? 'Tambah' : 'Edit'} Barang</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Kode</label>
                <input name="kode" defaultValue={modal.data?.kode} className="w-full border rounded-lg px-3 py-2" required /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Nama</label>
                <input name="nama" defaultValue={modal.data?.nama} className="w-full border rounded-lg px-3 py-2" required /></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Kategori</label>
                <select name="kategori_id" defaultValue={modal.data?.kategori_id || ''} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Pilih Kategori</option>
                  {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Satuan</label>
                <select name="satuan" defaultValue={modal.data?.satuan || 'pcs'} className="w-full border rounded-lg px-3 py-2">
                  <option value="pcs">Pcs</option>
                  <option value="gram">Gram</option>
                  <option value="liter">Liter</option>
                  <option value="pack">Pack</option>
                  <option value="kg">Kg</option>
                </select></div>
              <div className="mb-3"><label className="block text-sm font-medium mb-1">Minimal Stok</label>
                <input type="number" name="minimal_stok" defaultValue={modal.data?.minimal_stok || 0} className="w-full border rounded-lg px-3 py-2" /></div>
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