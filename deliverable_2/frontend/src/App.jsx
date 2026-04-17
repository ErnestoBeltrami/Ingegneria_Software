import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardOperatorePage from './pages/operatore/DashboardOperatorePage';
import CreaSondaggioPage from './pages/operatore/CreaSondaggioPage';
import CreaVotazionePage from './pages/operatore/CreaVotazionePage';
import GestioneSondaggiPage from './pages/operatore/GestioneSondaggiPage';
import GestioneVotazioniPage from './pages/operatore/GestioneVotazioniPage';
import RiepilogoVotazionePage from './pages/operatore/RiepilogoVotazionePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardOperatorePage />} />
        <Route path="/sondaggi" element={<GestioneSondaggiPage />} />
        <Route path="/sondaggi/crea" element={<CreaSondaggioPage />} />
        <Route path="/votazioni" element={<GestioneVotazioniPage />} />
        <Route path="/votazioni/crea" element={<CreaVotazionePage />} />
        <Route path="/votazioni/:id/riepilogo" element={<RiepilogoVotazionePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
