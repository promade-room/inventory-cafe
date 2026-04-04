import { useState, useEffect } from 'react';
import { getDashboardStats, getLaporanMovement } from '../services/api';
import { formatRupiah, formatNumber } from '../utils/format';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, movementRes] = await Promise.all([
        getDashboardStats(),
        getLaporanMovement()
      ]);
      setStats(statsRes.data);
      setMovement(movementRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium text-sm">
          📦 Metode FIFO (First In First Out)
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary">
          <p className="text-white text-sm">Total Barang</p>
          <p className="text-3xl font-bold text-gray-800">{formatNumber(stats?.total_barang || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-white text-sm">Nilai Stok</p>
          <p className="text-3xl font-bold text-gray-800">{formatRupiah(stats?.total_nilai_stok || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-white text-sm">Masuk Hari Ini</p>
          <p className="text-3xl font-bold text-gray-800">{formatNumber(stats?.masuk_hari_ini?.jumlah || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <p className="text-white text-sm">Keluar Hari Ini</p>
          <p className="text-3xl font-bold text-gray-800">{formatNumber(stats?.keluar_hari_ini?.jumlah || 0)}</p>
        </div>
      </div>

      {/* Charts Section */}
      {movement && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Pergerakan Stok (7 Hari Terakhir)</h2>
            <div className="h-48">
              <Line
                data={{
                  labels: movement.masuk.map((_, idx) => `Hari ${idx + 1}`),
                  datasets: [
                    { label: 'Masuk', data: movement.masuk.map(m => m.masuk || 0), borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4, fill: true },
                    { label: 'Keluar', data: movement.keluar.map(k => k.keluar || 0), borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', tension: 0.4, fill: true }
                  ]
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }}
              />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Barang Keluar</h2>
            <div className="h-48">
              <Bar
                data={{
                  labels: movement.top_keluar.slice(0, 10).map((_, idx) => `${idx + 1}. ${_.nama.substring(0, 15)}`),
                  datasets: [{ label: 'Jumlah', data: movement.top_keluar.slice(0, 10).map(t => t.total_keluar), backgroundColor: '#D97706', borderRadius: 4 }]
                }}
                options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Alert Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-sm text-gray-800">Min: {formatNumber(item.minimal_stok)}</p>
                  </div>
                  <span className="text-red-600 font-bold">{formatNumber(item.stok_sekarang)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white text-center py-4">Tidak ada stok kritikal</p>
          )}
        </div>

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
                    <p className="text-sm text-gray-800">Batch: {item.batch_number}</p>
                  </div>
                  <span className={`font-bold ${item.hari <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                    {item.hari} hari
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white text-center py-4">Tidak ada barang akan expired</p>
          )}
        </div>
      </div>
    </div>
  );
}