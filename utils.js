/* utils.js — SCOROVIA
 * Fonctions utilitaires partagées entre toutes les pages.
 * Charger après supabase-js et avant les scripts inline.
 */

const SUPABASE_URL = 'https://rsdlcqsmuvaqkohjqsjs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oVYZTlF0zB2RgLVWXXvkUg_sn7U6b9w';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

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
