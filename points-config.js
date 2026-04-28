/* exported PointsConfig */
/**
 * points-config.js — SCOROVIA
 * Charge la configuration des points depuis Supabase et expose
 * une API simple pour lire les valeurs et mettre à jour les textes du DOM.
 *
 * Usage dans chaque page :
 *   <script src="points-config.js"></script>
 *   // Après init du profil :
 *   await PointsConfig.load();
 *   PointsConfig.updateDOM();
 */

const PointsConfig = (() => {
  const SUPABASE_URL = 'https://rsdlcqsmuvaqkohjqsjs.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oVYZTlF0zB2RgLVWXXvkUg_sn7U6b9w';

  // Valeurs par défaut (fallback si Supabase inaccessible)
  let config = {
    inscription:    { label: 'Inscription',               points: 20  },
    vote:           { label: 'Voter une photo',            points: 1   },
    pub:            { label: 'Regarder une pub (30s)',     points: 5   },
    parrainage:     { label: 'Parrainage',                 points: 50  },
    upload_photo:   { label: '2ème photo et suivantes',    points: -20 },
    unlock_profile: { label: 'Déverrouiller un profil',   points: -50 },
    message:        { label: 'Envoyer un message',         points: -20 },
  };

  let loaded = false;

  /** Charge la config depuis Supabase (une seule fois par page) */
  async function load() {
    if (loaded) return config;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/points_config?select=id,points,label`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
          }
        }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const rows = await res.json();
      rows.forEach(row => {
        config[row.id] = { label: row.label, points: row.points };
      });
      loaded = true;
    } catch (e) {
      console.warn('[PointsConfig] Fallback aux valeurs par défaut :', e.message);
    }
    return config;
  }

  /** Retourne la valeur d'une clé (ex: PointsConfig.get('vote') → 1) */
  function get(key) {
    return config[key]?.points ?? 0;
  }

  /** Formate un nombre en "+X pts" ou "-X pts" */
  function fmt(key) {
    const v = get(key);
    return (v >= 0 ? '+' : '') + v + ' pt' + (Math.abs(v) > 1 ? 's' : '');
  }

  /**
   * Met à jour tous les éléments DOM portant data-pts-key="<key>"
   * avec la valeur formatée.
   * Exemple HTML : <span data-pts-key="vote"></span>  →  "+1 pt"
   */
  function updateDOM() {
    document.querySelectorAll('[data-pts-key]').forEach(el => {
      const key = el.getAttribute('data-pts-key');
      if (config[key] !== undefined) {
        el.textContent = fmt(key);
      }
    });

    // Mise à jour des attributs data-pts-value (valeur brute pour JS)
    document.querySelectorAll('[data-pts-value]').forEach(el => {
      const key = el.getAttribute('data-pts-value');
      if (config[key] !== undefined) {
        el.setAttribute('data-cost', Math.abs(get(key)));
      }
    });
  }

  return { load, get, fmt, updateDOM };
})();
