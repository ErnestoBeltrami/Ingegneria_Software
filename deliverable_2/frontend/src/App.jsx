import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardOperatorePage from './pages/operatore/DashboardOperatorePage';
import CreaSondaggioPage from './pages/operatore/CreaSondaggioPage';
import CreaVotazionePage from './pages/operatore/CreaVotazionePage';
import GestioneSondaggiPage from './pages/operatore/GestioneSondaggiPage';
import GestioneVotazioniPage from './pages/operatore/GestioneVotazioniPage';
import RiepilogoVotazionePage from './pages/operatore/RiepilogoVotazionePage';
import RiepilogoSondaggioPage from './pages/operatore/RiepilogoSondaggioPage';
import ModificaVotazionePage from './pages/operatore/ModificaVotazionePage';
import ModificaSondaggioPage from './pages/operatore/ModificaSondaggioPage';
import ProfiloOperatorePage from './pages/operatore/ProfiloOperatorePage';

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
        <Route path="/sondaggi/:id/riepilogo" element={<RiepilogoSondaggioPage />} />
        <Route path="/votazioni/:id/modifica" element={<ModificaVotazionePage />} />
        <Route path="/sondaggi/:id/modifica" element={<ModificaSondaggioPage />} />
        <Route path="/operatore/profilo" element={<ProfiloOperatorePage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
