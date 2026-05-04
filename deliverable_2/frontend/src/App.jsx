import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
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
import CompletaProfiloPage from './pages/CompletaProfiloPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProfiloCompletatoPage from './pages/ProfiloCompletatoPage';

function CompletaProfiloRoute() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const googleUser = {
    nome: params.get('nome') || '',
    email: params.get('email') || '',
    picture: params.get('picture') || '',
  };
  const cittadinoId = params.get('cittadinoId');

  const handleSubmit = async ({ dataNascita, comuneResidenza, circoscrizione }) => {
    const res = await fetch('/auth/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cittadinoId, dataNascita, comuneResidenza, circoscrizione }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('token', data.token);
    navigate('/profilo-completato', { replace: true });
  };

  return <CompletaProfiloPage googleUser={googleUser} onSubmit={handleSubmit} />;
}

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
        <Route path="/completa-profilo" element={<CompletaProfiloRoute />} />
        <Route path="/profilo-completato" element={<ProfiloCompletatoPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
