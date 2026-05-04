import { useNavigate } from 'react-router-dom';

export default function ProfiloCompletatoPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, sans-serif',
      color: '#fff',
      gap: '16px',
      padding: '32px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48 }}>✓</div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, margin: 0 }}>
        Profilo completato!
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 360, margin: 0 }}>
        Il tuo account è attivo. Presto potrai accedere alle votazioni e ai sondaggi della città.
      </p>
      <button
        onClick={() => navigate('/cittadino/dashboard')}
        style={{
          marginTop: 8,
          padding: '12px 28px',
          background: '#1f3a89',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        Torna alla home
      </button>
    </div>
  );
}
