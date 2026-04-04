import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary">
          <p className="text-gray-700 text-sm">Total Barang</p>
          <p className="text-xl font-bold text-gray-800">{stats?.total_barang || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-gray-700 text-sm">Nilai Stok</p>
          <p className="text-xl font-bold text-gray-800">Rp {(stats?.total_nilai_stok || 0).toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-gray-700 text-sm">Masuk Hari Ini</p>
          <p className="text-xl font-bold text-gray-800">{stats?.masuk_hari_ini?.jumlah || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <p className="text-gray-700 text-sm">Keluar Hari Ini</p>
          <p className="text-xl font-bold text-gray-800">{stats?.keluar_hari_ini?.jumlah || 0}</p>
        </div>
      </div>

      {/* Alert Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stok Kritikal */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-red-500">⚠️</span> Stok Kritikal
          </h2>
          {stats?.stok_kritikal?.length > 0 ? (
            <div className="space-y-3">
              {stats.stok_kritikal.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.nama}</p>
                    <p className="text-sm text-gray-700">Min: {item.minimal_stok}</p>
                  </div>
                  <span className="text-red-600 font-bold">{item.stok_sekarang}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 text-center py-4">Tidak ada stok kritikal</p>
          )}
        </div>

        {/* Akan Expired */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-orange-500">⏰</span> Akan Expired (7 Hari)
          </h2>
          {stats?.akan_expired?.length > 0 ? (
            <div className="space-y-3">
              {stats.akan_expired.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.barang_nama}</p>
                    <p className="text-sm text-gray-700">Batch: {item.batch_number}</p>
                  </div>
                  <span className={`font-bold ${item.hari <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                    {item.hari} hari
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 text-center py-4">Tidak ada barang akan expired</p>
          )}
        </div>
      </div>
    </div>
  );
}
