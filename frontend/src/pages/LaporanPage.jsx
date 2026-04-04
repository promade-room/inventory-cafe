import { useState, useEffect } from 'react';
import { getLaporanStok, getLaporanExpired, getLaporanMovement } from '../services/api';
import { formatRupiah, formatDate, formatNumber } from '../utils/format';

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState('stok');
  const [stok, setStok] = useState([]);
  const [expired, setExpired] = useState([]);
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stok') {
        const { data } = await getLaporanStok();
        setStok(data);
      } else if (activeTab === 'expired') {
        const { data } = await getLaporanExpired();
        setExpired(data);
      } else if (activeTab === 'movement') {
        const { data } = await getLaporanMovement();
        setMovement(data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Laporan</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['stok', 'expired', 'movement'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            {tab === 'stok' ? '📊 Laporan Stok' : tab === 'expired' ? '⚠️ Akan Expired' : '📈 Movement'}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-10">Loading...</div> : (
        <>
          {activeTab === 'stok' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kode</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kat</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Masuk</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Keluar</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Stok</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stok.map(item => (
                    <tr key={item.id} className="hover:bg-orange-100">
                      <td className="px-4 py-3 text-sm font-mono">{item.kode}</td>
                      <td className="px-4 py-3 text-sm font-medium">{item.nama}</td>
                      <td className="px-4 py-3 text-sm">{item.kategori_nama || '-'}</td>
                      <td className="px-4 py-3 text-right">{formatNumber(item.total_masuk || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatNumber(item.total_keluar || 0)}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatNumber(item.stok_sekarang || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatRupiah(item.total_nilai || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'expired' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Barang</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Batch</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Sisa</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tgl Expired</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expired.map(item => (
                    <tr key={item.id} className="hover:bg-orange-100">
                      <td className="px-4 py-3 text-sm font-medium">{item.barang_nama}</td>
                      <td className="px-4 py-3 text-sm font-mono">{item.batch_number}</td>
                      <td className="px-4 py-3 text-right">{formatNumber(item.sisa || 0)}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(item.tanggal_kadaluarsa)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.hari_expired <= 0 ? 'bg-red-100 text-red-700' : item.hari_expired <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {item.hari_expired <= 0 ? 'Expired' : `${item.hari_expired} hari`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expired.length === 0 && <p className="text-center py-8 text-gray-700">Tidak ada barang expired</p>}
            </div>
          )}

          {activeTab === 'movement' && movement && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Top 10 Barang Paling Banyak Keluar</h3>
                <div className="space-y-2">
                  {movement.top_keluar.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm">{idx + 1}. {item.nama}</span>
                      <span className="font-bold text-primary">{formatNumber(item.total_keluar)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-sm">Grafik movement bisa ditambahkan dengan library chart.js</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}