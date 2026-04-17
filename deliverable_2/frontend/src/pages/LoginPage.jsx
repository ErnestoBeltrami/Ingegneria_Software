import { useState } from 'react';
import { ArrowRight, CheckSquare, Users, MapPin, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const features = [
  { icon: CheckSquare, name: 'Vota le proposte', desc: 'Esprimi la tua opinione su temi che contano' },
  { icon: Users, name: 'Proponi iniziative', desc: 'Condividi le tue idee con la comunità' },
  { icon: MapPin, name: 'Cambia Trento', desc: 'Partecipa attivamente alla vita civica' },
];

export default function LoginPage() {
  const [view, setView] = useState('select'); // 'select' | 'operatore' | 'success'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCittadinoLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleOperatoreLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/operatore/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password_inserita: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Credenziali non valide');
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'operatore');
      setView('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('select');
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="flex min-h-screen">

      {/* Pannello sinistro — branding */}
      <div className="flex w-1/2 flex-col justify-between bg-[#090a0a] px-14 py-16 text-white">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold leading-10">IoSonoTrento</h1>
          <p className="text-base text-white/50">La tua voce per la tua città</p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold leading-snug">
            Partecipa alla vita<br />della tua città
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-white/60">
            Vota sulle iniziative locali, proponi idee e contribuisci a costruire una Trento migliore.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {features.map(({ icon: Icon, name, desc }) => (
            <div key={name} className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-white/10">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-xs text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/30">Servizio offerto dal Comune di Trento</p>
      </div>

      {/* Pannello destro */}
      <div className="flex flex-1 items-center justify-center bg-[#f9fafc] px-12">
        <div className="flex w-full max-w-sm flex-col gap-8">

          {view === 'success' && (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-[#101828]">Accesso effettuato</h2>
                <p className="text-base text-[#6a7282]">
                  Bentornato, <span className="font-semibold text-[#101828]">{username}</span>.
                  La dashboard è in costruzione.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-[#99a1af]">
                <ShieldCheck size={13} />
                <span>Piattaforma sicura — Comune di Trento</span>
              </div>
            </>
          )}

          {view === 'select' && (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-[#101828]">Benvenuto</h2>
                <p className="text-base text-[#6a7282]">
                  Scegli il tuo ruolo per accedere alla piattaforma
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button variant="cittadino" onClick={handleCittadinoLogin}>
                  <span className="flex-1 text-center">Accedi come cittadino</span>
                  <ArrowRight size={18} />
                </Button>
                <Button variant="operatore" onClick={() => setView('operatore')}>
                  <span className="flex-1 text-center">Accedi come operatore</span>
                  <ArrowRight size={18} />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[#99a1af]">
                <ShieldCheck size={13} />
                <span>Piattaforma sicura — Comune di Trento</span>
              </div>
            </>
          )}

          {view === 'operatore' && (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-[#101828]">Accesso operatore</h2>
                <p className="text-base text-[#6a7282]">
                  Inserisci le tue credenziali per accedere
                </p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleOperatoreLogin} noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Inserisci username"
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Inserisci password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                {error && (
                  <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
                )}
                <Button variant="operatore" type="submit" disabled={loading} className="justify-center">
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
              </form>

              <Button variant="ghost" onClick={handleBack}>
                ← Torna alla selezione ruolo
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-[#99a1af]">
                <ShieldCheck size={13} />
                <span>Piattaforma sicura — Comune di Trento</span>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
