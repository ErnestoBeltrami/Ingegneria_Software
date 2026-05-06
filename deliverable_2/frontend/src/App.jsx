import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
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
import DashboardCittadino from './pages/cittadino/dashboard/Dashboard';
import Votazione from './pages/cittadino/Votazione';
import Sondaggio from './pages/cittadino/Sondaggio';
import CreaIniziativaPage from './pages/cittadino/CreaIniziativaPage';
import ProfiloCittadinePage from './pages/cittadino/ProfiloCittadinePage';
import Dashboard from './pages/cittadino/dashboard/Dashboard';

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
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cittadino/dashboard" element={<Dashboard />} />
          <Route path="/cittadino/votazione/:id" element={<Votazione />} />
          <Route path="/cittadino/sondaggio/:id" element={<Sondaggio />} />
          <Route path="*" element={<Navigate to="/cittadino/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
