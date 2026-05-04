/* TopBar — sticky at top of every operator page.
   Mirrors deliverable_2/frontend/src/components/TopBar.jsx */

function TopBar({ nome = 'Marco', cognome = 'Rossi' }) {
  const initials = `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || '?';
  const fullName = [nome, cognome].filter(Boolean).join(' ') || 'Operatore';

  return (
    <header className="topbar">
      <a className="topbar__logo" href="#">IoSonoTrento</a>
      <div className="topbar__right">
        <button className="topbar__bell" aria-label="Notifiche">
          <IconBell size={20} />
        </button>
        <div className="topbar__user">
          <div className="topbar__avatar">{initials}</div>
          <span className="topbar__name">{fullName}</span>
        </div>
      </div>
    </header>
  );
}

window.TopBar = TopBar;
