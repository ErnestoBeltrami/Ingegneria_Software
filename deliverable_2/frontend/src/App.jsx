import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardOperatorePage from './pages/DashboardOperatorePage';
import CreaSondaggioPage from './pages/CreaSondaggioPage';
import CreaVotazionePage from './pages/CreaVotazionePage';
import GestioneSondaggiPage from './pages/GestioneSondaggiPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardOperatorePage />} />
        <Route path="/sondaggi" element={<GestioneSondaggiPage />} />
        <Route path="/sondaggi/crea" element={<CreaSondaggioPage />} />
        <Route path="/votazioni/crea" element={<CreaVotazionePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
