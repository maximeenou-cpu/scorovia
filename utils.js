/* utils.js — SCOROVIA
 * Fonctions utilitaires partagées entre toutes les pages.
 * Charger avant les scripts inline de chaque page.
 */

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(url) {
  if (!url) return null;
  try { const u = new URL(url); return u.protocol === 'https:' ? url : null; } catch { return null; }
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Il y a quelques secondes';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)} jour${Math.floor(diff / 86400) > 1 ? 's' : ''}`;
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + (type || '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}
