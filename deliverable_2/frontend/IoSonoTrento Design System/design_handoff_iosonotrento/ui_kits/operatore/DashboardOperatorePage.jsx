/* DashboardOperatorePage — recreates the upstream dashboard.
   Greeting, 3 nav cards, 2 action buttons, search + filter pills + activity grid. */

const NAV_CARDS = [
  { Icon: IconVote,       iconBg: 'rgba(31,58,137,0.18)',  iconColor: '#829aff', label: 'Gestione votazioni', desc: 'Crea e monitora le votazioni',         link: '#votazioni',   linkColor: '#829aff' },
  { Icon: IconBarChart,   iconBg: 'rgba(0,122,82,0.18)',   iconColor: '#00c47a', label: 'Gestione sondaggi',  desc: 'Crea e gestisci i sondaggi',           link: '#sondaggi',    linkColor: '#00c47a' },
  { Icon: IconLayoutGrid, iconBg: 'rgba(146,64,14,0.18)',  iconColor: '#f59e0b', label: 'Moderazione bacheca',desc: 'Gestisci le proposte dei cittadini',   link: '#moderazione', linkColor: '#f59e0b' },
];
const FILTERS = ['Tutte le attività', 'Votazioni attive', 'Sondaggi attivi', 'Proposte in arrivo'];
const FAKE_ACTIVITIES = [
  { _id: 1, tipo: 'votazione', titolo: 'Riqualificazione Piazza Duomo', stato: 'attivo',  data_fine: '2026-05-12' },
  { _id: 2, tipo: 'sondaggio', titolo: 'Servizi di mobilità urbana',     stato: 'attivo',  data_fine: '2026-05-08' },
  { _id: 3, tipo: 'votazione', titolo: 'Nuovo regolamento parchi',       stato: 'attivo',  data_fine: '2026-05-20' },
  { _id: 4, tipo: 'sondaggio', titolo: 'Orari biblioteche civiche',      stato: 'attivo',  data_fine: '2026-05-15' },
];

function fmt(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function DashboardOperatorePage({ onOpenProfile, onOpenCrea }) {
  const [filtro, setFiltro] = React.useState('Tutte le attività');
  const [search, setSearch] = React.useState('');

  const filtered = FAKE_ACTIVITIES.filter(a =>
    !search || a.titolo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page page--dashboard">

      <header className="page-header">
        <h1 className="greeting">Ciao, Marco 👋</h1>
      </header>

      <div className="nav-cards">
        {NAV_CARDS.map(({ Icon, iconBg, iconColor, label, desc, linkColor }) => (
          <a key={label} href="#" className="nav-card">
            <div className="nav-card__icon" style={{ background: iconBg }}>
              <Icon size={20} style={{ color: iconColor }}/>
            </div>
            <div>
              <p className="nav-card__label">{label}</p>
              <p className="nav-card__desc">{desc}</p>
            </div>
            <span className="nav-card__link" style={{ color: linkColor }}>
              Vai <IconChevronRight size={12}/>
            </span>
          </a>
        ))}
      </div>

      <div className="action-row">
        <button className="action-btn action-btn--primary" onClick={onOpenCrea}>
          <div className="action-btn__icon"><IconPlus size={18}/></div>
          <div className="action-btn__text">
            <span className="action-btn__title">Crea una nuova votazione</span>
            <span className="action-btn__subtitle">Avvia una nuova votazione pubblica</span>
          </div>
          <IconChevronRight size={16}/>
        </button>
        <button className="action-btn action-btn--secondary">
          <div className="action-btn__icon action-btn__icon--green"><IconPlus size={18}/></div>
          <div className="action-btn__text">
            <span className="action-btn__title">Crea un nuovo sondaggio</span>
            <span className="action-btn__subtitle">Raccogli feedback dalla comunità</span>
          </div>
          <IconChevronRight size={16} style={{ color: 'rgba(255,255,255,0.5)' }}/>
        </button>
      </div>

      <div className="searchbar">
        <IconSearch size={16} style={{ color: 'rgba(255,255,255,0.35)' }}/>
        <input
          className="searchbar__input"
          placeholder="Ricerca una proposta o iniziativa…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <h2 className="activity__title">
          <IconActivity size={16} style={{ color: '#829aff' }}/>
          Attività recenti
        </h2>
        <div className="filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn ${filtro === f ? 'filter-btn--active' : ''}`}
              onClick={() => setFiltro(f)}
            >{f}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 14 }}>Nessuna attività trovata.</p>
        ) : (
          <div className="activity-grid">
            {filtered.map(a => (
              <div key={a._id} className="activity-card">
                <div className="activity-card__header">
                  <span className="act-badge act-badge--tipo">
                    {a.tipo === 'votazione' ? 'Votazione' : 'Sondaggio'}
                  </span>
                  <span className="act-badge act-badge--stato">In corso</span>
                </div>
                <p className="activity-card__titolo">{a.titolo}</p>
                <div className="activity-card__footer">
                  <span className="activity-card__termine">Termine: {fmt(a.data_fine)}</span>
                  <button className="btn-pill">Riepilogo</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={onOpenProfile}
        style={{
          alignSelf:'flex-start', background:'none', border:'1px dashed rgba(255,255,255,0.18)',
          color:'rgba(255,255,255,0.55)', padding:'8px 14px', borderRadius:12,
          fontFamily:'Montserrat', fontSize:12, cursor:'pointer'
        }}
      >
        Demo &middot; vai a Profilo operatore →
      </button>

    </div>
  );
}

window.DashboardOperatorePage = DashboardOperatorePage;
