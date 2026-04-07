import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import KategoriPage from './pages/KategoriPage';
import BarangPage from './pages/BarangPage';
import SupplierPage from './pages/SupplierPage';
import MasukPage from './pages/MasukPage';
import KeluarPage from './pages/KeluarPage';
import LaporanPage from './pages/LaporanPage';
import UserPage from './pages/UserPage';
import SettingsPage from './pages/SettingsPage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="kategori" element={<KategoriPage />} />
          <Route path="barang" element={<BarangPage />} />
          <Route path="supplier" element={<SupplierPage />} />
          <Route path="masuk" element={<MasukPage />} />
          <Route path="keluar" element={<KeluarPage />} />
          <Route path="laporan" element={<LaporanPage />} />
          <Route path="users" element={<UserPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;