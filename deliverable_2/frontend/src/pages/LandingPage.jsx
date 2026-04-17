import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, Users, BarChart2, ArrowRight, ChevronRight } from 'lucide-react';
import './LandingPage.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const FEATURES = [
  {
    icon: Vote,
    title: 'Vota le proposte',
    desc: 'Esprimi la tua opinione su temi che contano per la città di Trento.',
  },
  {
    icon: Users,
    title: 'Proponi iniziative',
    desc: 'Condividi idee con la comunità e raccogli il supporto dei tuoi concittadini.',
  },
  {
    icon: BarChart2,
    title: 'Partecipa ai sondaggi',
    desc: 'Rispondi alle consultazioni del Comune e influenza le decisioni pubbliche.',
  },
];

const STEPS = [
  { num: '01', title: 'Accedi', desc: 'Con il tuo account Google, in un clic.' },
  { num: '02', title: 'Esplora', desc: 'Scopri votazioni attive, proposte e sondaggi.' },
  { num: '03', title: 'Partecipa', desc: 'Vota, proponi e fai sentire la tua voce.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp">

      {/* Navbar */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <span className="lp-nav__logo">IoSonoTrento</span>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero__glow" />
        <div className="lp-hero__content">
          <h1 className="lp-hero__headline">
            Partecipa alla vita della tua città
          </h1>
          <p className="lp-hero__sub">
            Vota, proponi e lascia la tua voce sulle decisioni<br />
            che contano per Trento.
          </p>
          <div className="lp-hero__actions">
            <button
              className="lp-btn lp-btn--green"
              onClick={() => { window.location.href = `${BACKEND_URL}/auth/google`; }}
            >
              Accedi
            {/*<ArrowRight size={16} />*/}
            </button>
            <button
              className="lp-btn lp-btn--ghost"
              onClick={() => navigate('/login')}
            >
              Sei un operatore?
            </button>
          </div>
        </div>

        {/* Floating preview cards */}
        {/*
        <div className="lp-hero__preview">
          <div className="lp-preview-card lp-preview-card--main">
            <div className="lp-preview-card__bar">
              <span /><span /><span />
            </div>
            <div className="lp-preview-card__row">
              <div className="lp-preview-chip lp-preview-chip--blue" />
              <div className="lp-preview-chip lp-preview-chip--green" />
            </div>
            <div className="lp-preview-card__title" />
            <div className="lp-preview-card__line lp-preview-card__line--80" />
            <div className="lp-preview-card__line lp-preview-card__line--60" />
            <div className="lp-preview-card__grid">
              <div className="lp-preview-stat">
                <div className="lp-preview-stat__num" />
                <div className="lp-preview-stat__label" />
              </div>
              <div className="lp-preview-stat">
                <div className="lp-preview-stat__num lp-preview-stat__num--green" />
                <div className="lp-preview-stat__label" />
              </div>
              <div className="lp-preview-stat">
                <div className="lp-preview-stat__num lp-preview-stat__num--red" />
                <div className="lp-preview-stat__label" />
              </div>
            </div>
          </div>

          <div className="lp-preview-card lp-preview-card--secondary">
            <div className="lp-preview-card__bar">
              <span /><span /><span />
            </div>
            <div className="lp-preview-card__title lp-preview-card__title--sm" />
            <div className="lp-preview-card__line lp-preview-card__line--70" />
            <div className="lp-preview-donut">
              <div className="lp-preview-donut__ring" />
            </div>
            <div className="lp-preview-legend">
              <div className="lp-preview-legend__item"><span style={{background:'#1f3a89'}}/></div>
              <div className="lp-preview-legend__item"><span style={{background:'#e7000b'}}/></div>
              <div className="lp-preview-legend__item"><span style={{background:'#99a1af'}}/></div>
            </div>
          </div>
        </div>
        */}
      </section>

      {/* Features */}
      <section className="lp-features">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow">Cosa puoi fare</p>
          <h2 className="lp-section-title">Strumenti di partecipazione civica</h2>
          <div className="lp-features__grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="lp-feature-card">
                <div className="lp-feature-card__icon">
                  <Icon size={20} />
                </div>
                <h3 className="lp-feature-card__title">{title}</h3>
                <p className="lp-feature-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="lp-steps">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow">Come funziona</p>
          <h2 className="lp-section-title">Tre passi per partecipare</h2>
          <div className="lp-steps__grid">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="lp-step">
                <span className="lp-step__num">{num}</span>
                <h3 className="lp-step__title">{title}</h3>
                <p className="lp-step__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="lp-cta">
        <div className="lp-cta__glow" />
        <div className="lp-section-inner lp-cta__inner">
          <h2 className="lp-cta__title">Pronto a fare la differenza?</h2>
          <p className="lp-cta__sub">La tua città ha bisogno della tua voce.</p>
          <button
            className="lp-btn lp-btn--green lp-btn--lg"
            onClick={() => { window.location.href = `${BACKEND_URL}/auth/google`; }}
          >
            Accedi ora
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <span className="lp-footer__logo">IoSonoTrento</span>
        <span className="lp-footer__copy">© Comune di Trento</span>
        <div className="lp-footer__links">
          <a href="#">Privacy</a>
          <a href="#">Accessibilità</a>
        </div>
      </footer>

    </div>
  );
}
