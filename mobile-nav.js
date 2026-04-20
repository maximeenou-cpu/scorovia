// SCOROVIA — Mobile Bottom Nav
// À inclure dans toutes les pages avec : <script src="mobile-nav.js"></script>

(function() {
  const CSS = `
  .mobile-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: rgba(13,13,26,0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255,255,255,0.08);
    z-index: 50;
    padding: 8px 0;
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }

  .mobile-bottom-nav ul {
    display: flex;
    align-items: center;
    justify-content: space-around;
    list-style: none;
    margin: 0; padding: 0;
  }

  .mobile-bottom-nav li a,
  .mobile-bottom-nav li button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 12px;
    transition: background 0.2s;
    min-width: 52px;
  }

  .mobile-bottom-nav li a:active,
  .mobile-bottom-nav li button:active {
    background: rgba(255,255,255,0.06);
  }

  .mobile-bottom-nav .nav-icon {
    font-size: 22px;
    line-height: 1;
  }

  .mobile-bottom-nav .nav-label {
    font-size: 10px;
    font-family: 'DM Sans', sans-serif;
    color: rgba(240,238,248,0.4);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .mobile-bottom-nav li.active .nav-label {
    color: #FFE27A;
  }

  .mobile-bottom-nav li.active .nav-icon {
    filter: drop-shadow(0 0 6px rgba(245,200,66,0.6));
  }

  /* Badge non lu */
  .mobile-bottom-nav .nav-badge {
    position: absolute;
    top: 2px; right: 6px;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #FF4D8D;
    border: 2px solid rgba(13,13,26,0.97);
  }

  .mobile-bottom-nav li {
    position: relative;
  }

  /* Espace pour éviter que le contenu passe derrière la nav */
  body.has-mobile-nav .main,
  body.has-mobile-nav main {
    padding-bottom: 70px;
  }

  /* Sur messages.html, ajuster la zone de saisie */
  body.has-mobile-nav .chat-input-area {
    bottom: 65px;
  }

  @media (max-width: 768px) {
    .mobile-bottom-nav { display: block; }
    .sidebar { display: none !important; }
    .main { margin-left: 0 !important; }
    /* Cacher le menu ☰ flottant */
    .menu-btn { display: none !important; }
  }
  `;

  // Injecter le CSS
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // Détecter la page courante
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const pages = [
    { href: 'dashboard.html', icon: '🏠', label: 'Accueil', match: ['dashboard.html'] },
    { href: 'noter.html',     icon: '⭐', label: 'Noter',   match: ['noter.html'] },
    { href: 'mesnotes.html',  icon: '📊', label: 'Mes notes', match: ['mesnotes.html'] },
    { href: 'messages.html',  icon: '💬', label: 'Messages', match: ['messages.html'], badge: false },
    { href: 'points.html',    icon: '⚡', label: 'Points',  match: ['points.html', 'classement.html', 'profil.html'] },
  ];

  // Créer la nav
  const nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav';
  nav.innerHTML = `<ul>${pages.map(p => {
    const isActive = p.match.includes(path);
    return `<li class="${isActive ? 'active' : ''}">
      <a href="${p.href}">
        <span class="nav-icon">${p.icon}</span>
        <span class="nav-label">${p.label}</span>
        ${p.badge ? '<span class="nav-badge"></span>' : ''}
      </a>
    </li>`;
  }).join('')}</ul>`;

  document.body.appendChild(nav);
  document.body.classList.add('has-mobile-nav');

  // Vérifier les messages non lus (si Supabase disponible)
  function checkUnreadMessages() {
    if (typeof supabase === 'undefined') return;
    const stored = localStorage.getItem('scorovia_user');
    if (!stored) return;
    try {
      const user = JSON.parse(stored);
      if (!user.id) return;
      const { createClient } = supabase;
      const sb = createClient(
        'https://rsdlcqsmuvaqkohjqsjs.supabase.co',
        'sb_publishable_oVYZTlF0zB2RgLVWXXvkUg_sn7U6b9w'
      );
      sb.from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)
        .then(({ count }) => {
          if (count > 0) {
            const msgItem = nav.querySelector('li:nth-child(4)');
            if (msgItem && !msgItem.querySelector('.nav-badge')) {
              msgItem.style.position = 'relative';
              const badge = document.createElement('span');
              badge.className = 'nav-badge';
              msgItem.appendChild(badge);
            }
          }
        });
    } catch(e) {}
  }

  // Vérifier après chargement de la page
  window.addEventListener('load', () => {
    setTimeout(checkUnreadMessages, 1500);
  });

})();
