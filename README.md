# Scorovia

Application web de notation de photos par la communauté. Les utilisateurs soumettent une photo, la communauté la note de 1 à 10, et un classement est établi.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | HTML/CSS/JS vanilla (SPA sans framework) |
| Auth + BDD | Supabase (PostgreSQL + Auth Google OAuth) |
| Storage | Supabase Storage (bucket `photos`) |
| Serverless | Supabase Edge Functions (runtime Deno) |
| Déploiement | Vercel |
| Paiement | Stripe (Payment Links + Webhooks) |
| Modération images | SightEngine (proxy côté serveur) |
| Email | Formspree |
| Anti-spam | Google reCAPTCHA v3 |
| Pub | Google AdSense |
| PWA | Service Worker + Web App Manifest |

## Structure des fichiers

```
/
├── index.html          # Landing page publique
├── login.html          # Authentification (Google OAuth)
├── dashboard.html      # Tableau de bord utilisateur
├── noter.html          # Interface de notation
├── mesnotes.html       # Gestion des photos soumises
├── classement.html     # Classement communautaire
├── messages.html       # Messagerie entre utilisateurs
├── points.html         # Solde et historique des points
├── profil.html         # Profil et paramètres du compte
├── admin.html          # Back-office (accès restreint)
├── contact.html        # Formulaire de contact (Formspree)
├── legal.html          # CGU / Politique de confidentialité
├── 404.html            # Page d'erreur
│
├── mobile-nav.js       # Navigation mobile partagée
├── premium.js          # Logique statut Premium
├── points-config.js    # Chargement config points depuis Supabase
├── service-worker.js   # Cache PWA
├── manifest.json       # Manifest PWA
├── vercel.json         # Config déploiement + headers sécurité
│
└── supabase/
    └── functions/
        └── check-image/
            └── index.ts  # Proxy SightEngine (Edge Function)
```

## Base de données (Supabase)

Tables principales :

| Table | Rôle |
|---|---|
| `users` | Profils utilisateurs (points, premium, ville, genre…) |
| `photos` | Photos soumises (url, note_moyenne, nb_votes, active) |
| `votes` | Historique des notes données |
| `messages` | Messagerie (sender_id, receiver_id, content, read) |
| `points_history` | Journal des transactions de points |
| `points_config` | Valeurs des récompenses (modifiables depuis l'admin) |
| `promo_codes` | Codes influenceurs (code, points_bonus, uses) |
| `reports` | Signalements de photos |

La sécurité repose entièrement sur les **Row Level Security (RLS)** Supabase. La clé `anon` est publique par conception.

## Edge Functions

### `check-image`

Proxy serveur pour l'API SightEngine. Le client envoie l'URL de l'image + son JWT Supabase ; la fonction vérifie le JWT, appelle SightEngine avec les credentials stockés en variables d'environnement Deno, et retourne le résultat.

Variables d'environnement requises :
```
SIGHTENGINE_USER=...
SIGHTENGINE_SECRET=...
```

## Déploiement

### Prérequis

- Compte Vercel lié au dépôt GitHub
- Projet Supabase configuré
- Compte Stripe avec Payment Links créés
- Compte SightEngine

### Variables d'environnement Supabase (Edge Functions)

À configurer dans le dashboard Supabase → Settings → Edge Functions :
```
SIGHTENGINE_USER
SIGHTENGINE_SECRET
```

### Déploiement Vercel

Le déploiement est automatique à chaque push sur la branche principale. Les headers de sécurité (CSP, HSTS, X-Frame-Options…) sont définis dans `vercel.json`.

### Edge Functions

```bash
supabase functions deploy check-image
```

## Sécurité

- **RLS** : toutes les tables ont des politiques RLS activées
- **CSP** : Content Security Policy stricte via `vercel.json`
- **HSTS** : `max-age=31536000; includeSubDomains`
- **SightEngine** : credentials exclusivement côté serveur (Edge Function)
- **XSS** : `escapeHtml()` appliqué sur toutes les données DB insérées dans le DOM
- **URLs** : `safeUrl()` valide le protocole `https:` avant tout `img.src`
- **Admin** : accès restreint par vérification d'email côté client (`ADMIN_EMAIL`)

> Note : la restriction admin est côté client uniquement. Pour une sécurité renforcée, implémenter une vérification via RLS ou Edge Function.

## Points et monétisation

Le système de points récompense l'engagement :

| Action | Points |
|---|---|
| Donner une note | +1 pt |
| Regarder une pub | +5 pts |
| Parrainer un ami | +50 pts |
| Soumettre une photo (2e+) | −20 pts |
| Débloquer un filtre classement | −points variable |

Les valeurs sont configurables depuis l'admin (table `points_config`).

Les achats de points et l'abonnement Premium (9,99€/mois) sont gérés via Stripe Payment Links avec `client_reference_id` pour lier la transaction à l'utilisateur.
