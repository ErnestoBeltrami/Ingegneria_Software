import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { API_BASE } from './config/api';
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
import ModerazioneBachecaPage from './pages/operatore/ModerazioneBachecaPage';
import CompletaProfiloPage from './pages/CompletaProfiloPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProfiloCompletatoPage from './pages/ProfiloCompletatoPage';
import DashboardCittadinePage from './pages/cittadino/dashboard/DashboardCittadinePage';
import Votazione from './pages/cittadino/votazione/Votazione';
import VotaSondaggio from './pages/cittadino/sondaggio/VotaSondaggio';
import CreaIniziativaPage from './pages/cittadino/bacheca/CreaIniziativaPage';
import BachecaPage from './pages/cittadino/bacheca/BachecaPage';
import ProfiloCittadinePage from './pages/cittadino/ProfiloCittadinePage';
import ArchivioPage from './pages/cittadino/ArchivioPage';
import RiepilogoVotazione from './pages/cittadino/riepilogo/RiepilogoVotazione';
import RiepilogoSondaggio from './pages/cittadino/riepilogo/RiepilogoSondaggio';

function CompletaProfiloRoute() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const googleUser = {
    nome: params.get('nome') || '',
    email: params.get('email') || '',
    picture: params.get('picture') || '',
  };
  const onboardingToken = params.get('onboardingToken');

  const handleSubmit = async ({ dataNascita, circoscrizione, genere, categoria }) => {
    const res = await fetch(`${API_BASE}/auth/complete-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${onboardingToken}`,
      },
      body: JSON.stringify({ dataNascita, circoscrizione, genere, categoria }),
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
    <ThemeProvider>
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
          <Route path="/moderazione" element={<ModerazioneBachecaPage />} />
          <Route path="/completa-profilo" element={<CompletaProfiloRoute />} />
          <Route path="/profilo-completato" element={<ProfiloCompletatoPage />} />
          <Route path="/cittadino/dashboard" element={<DashboardCittadinePage />} />
          <Route path="/cittadino/votazione/:id" element={<Votazione />} />
          <Route path="/cittadino/sondaggio/:id" element={<VotaSondaggio />} />
          <Route path="/cittadino/bacheca" element={<BachecaPage />} />
          <Route path="/cittadino/iniziativa/crea" element={<CreaIniziativaPage />} />
          <Route path="/cittadino/profilo" element={<ProfiloCittadinePage />} />
          <Route path="/cittadino/archivio" element={<ArchivioPage />} />
          <Route path="/cittadino/archivio/votazione/:id" element={<RiepilogoVotazione />} />
          <Route path="/cittadino/archivio/sondaggio/:id" element={<RiepilogoSondaggio />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
    </ThemeProvider >
  );
}
