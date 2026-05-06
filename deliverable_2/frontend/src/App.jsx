import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/cittadino/dashboard/Dashboard';
import Votazione from './pages/cittadino/Votazione';
import Sondaggio from './pages/cittadino/Sondaggio';

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/votazione/:id" element={<Votazione />} />
        <Route path="/sondaggio/:id" element={<Sondaggio />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
