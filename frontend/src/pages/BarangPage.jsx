import { useState, useEffect } from 'react';
import { getBarangs, getKategoris, createBarang, updateBarang, deleteBarang, getBarang } from '../services/api';
import { formatNumber, formatDate } from '../utils/format';

export default function BarangPage() {
  const [data, setData] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [filter, setFilter] = useState({ search: '', kategori_id: '' });
  const [detailModal, setDetailModal] = useState({ open: false, barang: null, batches: [] });

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

  const handleViewDetail = async (barang) => {
    try {
      const { data } = await getBarang(barang.id);
      setDetailModal({ open: true, barang, batches: data.batches || [] });
    } catch (err) { console.error(err); }
  };

  const getStatusColor = (batch) => {
    if (!batch.tanggal_kadaluarsa) return 'bg-green-100 text-green-700';
    const hari = Math.ceil((new Date(batch.tanggal_kadaluarsa) - new Date()) / (1000 * 60 * 60 * 24));
    if (hari <= 0) return 'bg-red-100 text-red-700';
    if (hari <= 7) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
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
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-800"> className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-4 py-3 text-left text-sm font-medium text-gray-800">Kode</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-4 py-3 text-left text-sm font-medium text-gray-800">Nama</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-4 py-3 text-left text-sm font-medium text-gray-800">Kategori</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-4 py-3 text-left text-sm font-medium text-gray-800">Satuan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-4 py-3 text-right text-sm font-medium text-gray-800">Stok</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-4 py-3 text-right text-sm font-medium text-gray-800">Min</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white" className="px-4 py-3 text-right text-sm font-medium text-gray-800">Aksi</th>
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
                  {formatNumber(item.stok_sekarang || 0)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-800">{formatNumber(item.minimal_stok)}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => handleViewDetail(item)} className="text-green-600 hover:underline mr-3">Detail</button>
                  <button type="button" onClick={() => setModal({ open: true, mode: 'edit', data: item })} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="text-center py-8 text-gray-800">Tidak ada data</p>}
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

      {/* Detail Batch Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detail Batch - {detailModal.barang?.nama}</h2>
              <button onClick={() => setDetailModal({ open: false, barang: null, batches: [] })} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700">Kode: <span className="font-medium">{detailModal.barang?.kode}</span></p>
              <p className="text-sm text-gray-700">Stok Total: <span className="font-bold text-green-600">{formatNumber(detailModal.barang?.stok_sekarang || 0)} {detailModal.barang?.satuan}</span></p>
            </div>

            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Batch</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Tgl Masuk</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Tgl Expired</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-white">Jumlah Awal</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-white">Sisa</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {detailModal.batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-orange-100">
                    <td className="px-4 py-3 text-sm font-mono">{batch.batch_number}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(batch.tanggal_masuk)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(batch.tanggal_kadaluarsa) || '-'}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(batch.jumlah)}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatNumber(batch.sisa || 0)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(batch)}`}>
                        {batch.tanggal_kadaluarsa ? (Math.ceil((new Date(batch.tanggal_kadaluarsa) - new Date()) / (1000 * 60 * 60 * 24)) <= 0 ? 'Expired' : Math.ceil((new Date(batch.tanggal_kadaluarsa) - new Date()) / (1000 * 60 * 60 * 24)) + ' hari') : 'Aman'}
                      </span>
                    </td>
                  </tr>
                ))}
                {detailModal.batches.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-800">Belum ada batch</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}