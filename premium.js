/* exported Premium */
/**
 * premium.js — SCOROVIA
 * Inclure dans toutes les pages APRÈS supabase.js :
 *   <script src="premium.js"></script>
 *
 * Dans chaque init(), après avoir chargé le profil :
 *   Premium.init(profile);
 *
 * API disponible :
 *   Premium.active            → bool
 *   Premium.canUnlockFree()   → bypass 50 pts (déverrouiller profil votant)
 *   Premium.canMessageFree()  → bypass 20 pts (envoyer un message)
 *   Premium.canFilterFree()   → bypass 5 pts (filtres classement)
 *   Premium.checkCost(cost, pts, showToastFn) → bool (false = bloqué)
 */

window.Premium = (() => {

  let _active = false;

  // ─── INIT ──────────────────────────────────────────────────────────────────
  // Appeler une fois le profil Supabase chargé.
  function init(profile) {
    _active = profile.is_premium === true &&
      (!profile.premium_until || new Date(profile.premium_until) > new Date());

    if (_active) _applyUI();
    return _active;
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────
  function canUnlockFree()  { return _active; }
  function canMessageFree() { return _active; }
  function canFilterFree()  { return _active; }

  /**
   * Vérifie si l'action peut être faite (Premium ou points suffisants).
   * Retourne true = go, false = bloqué (toast + redirect déjà gérés).
   *
   * Exemple d'utilisation :
   *   if (!Premium.checkCost(50, userProfile.points, showToast)) return;
   *   // ... débiter les points et continuer
   */
  function checkCost(cost, currentPoints, showToastFn) {
    if (_active) return true;
    if (currentPoints < cost) {
      showToastFn(`⚡ Points insuffisants — ${cost} pts requis`, 'error');
      setTimeout(() => window.location.href = 'points.html', 2000);
      return false;
    }
    return true;
  }

  // ─── UI AUTO ───────────────────────────────────────────────────────────────
  // Appliqué automatiquement sur toutes les pages si Premium actif.
  // Conventions à respecter dans le HTML de chaque page :
  //
  //   id="premium-badge-sidebar"   → badge ★ PREMIUM à afficher dans la sidebar
  //   class="premium-cta-hide"     → bannières/boutons "Passer Premium" à masquer
  //   class="msg-cost-hint"        → div hint "20 pts par message" à remplacer
  //   class="filter-tab-cost"      → span "(- 5 pts)" sur filtres classement
  //   id="modal-msg-btn"           → bouton message dans profil.html

  function _applyUI() {

    // 1. Badge ★ PREMIUM dans la sidebar
    document.querySelectorAll('#premium-badge-sidebar, .premium-badge-sidebar')
      .forEach(el => { el.style.display = 'inline-flex'; });

    // 2. Masquer tous les CTA "Passer Premium"
    document.querySelectorAll('.premium-cta-hide')
      .forEach(el => { el.style.display = 'none'; });

    // 3. Hint coût message → "illimité"
    document.querySelectorAll('.msg-cost-hint')
      .forEach(el => {
        el.innerHTML = '★ Messages illimités — <strong style="color:var(--gold2)">Premium actif</strong>';
      });

    // 4. Masquer les labels de coût sur les filtres classement
    document.querySelectorAll('.filter-tab-cost')
      .forEach(el => { el.style.display = 'none'; });

    // 5. Texte bouton message dans profil.html
    const msgBtn = document.getElementById('modal-msg-btn');
    if (msgBtn) msgBtn.textContent = '💬 Envoyer un message gratuit';
  }

  // ─── EXPORT ────────────────────────────────────────────────────────────────
  return {
    init,
    get active() { return _active; },
    canUnlockFree,
    canMessageFree,
    canFilterFree,
    checkCost,
  };

})();
