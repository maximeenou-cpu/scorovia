# patch-points-config.ps1
# Patche toutes les pages Scorovia pour utiliser points-config.js
# Lancer depuis la racine du repo

$pages = @(
    "dashboard.html",
    "points.html",
    "mesnotes.html",
    "noter.html",
    "classement.html",
    "index.html"
)

# Injecter le script tag points-config.js après premium.js
foreach ($file in $pages) {
    if (!(Test-Path $file)) { Write-Host "⏭  Non trouvé : $file"; continue }
    $content = Get-Content $file -Raw -Encoding UTF8

    # Déjà patché ?
    if ($content -match 'points-config\.js') {
        Write-Host "⏭  Déjà patché : $file"
    } else {
        $content = $content -replace '(<script src="premium\.js"></script>)', '$1<script src="points-config.js"></script>'
        Write-Host "✅ Script tag injecté : $file"
    }

    # ── dashboard.html ──────────────────────────────────────────
    if ($file -eq "dashboard.html") {
        # earn-pts textes en dur
        $content = $content -replace '<div class="earn-pts">\+1 pt</div>', '<div class="earn-pts" data-pts-key="vote">+1 pt</div>'
        $content = $content -replace '<div class="earn-pts">\+5 pts</div>', '<div class="earn-pts" data-pts-key="pub">+5 pts</div>'
        $content = $content -replace '<div class="earn-pts">\+50 pts</div>', '<div class="earn-pts" data-pts-key="parrainage">+50 pts</div>'
        # Appel PointsConfig dans init() après Premium.init
        $content = $content -replace '(Premium\.init\(profile\);)', '$1 PointsConfig.load().then(()=>PointsConfig.updateDOM());'
        Write-Host "   → Textes dashboard patchés"
    }

    # ── points.html ──────────────────────────────────────────────
    if ($file -eq "points.html") {
        $content = $content -replace '<div class="earn-pts pts-green">(\+1 pt[^<]*)</div>', '<div class="earn-pts pts-green" data-pts-key="vote">$1</div>'
        $content = $content -replace '<div class="earn-pts pts-purple">(\+5 pts[^<]*)</div>', '<div class="earn-pts pts-purple" data-pts-key="pub">$1</div>'
        $content = $content -replace '<div class="earn-pts pts-gold">(\+50 pts[^<]*)</div>', '<div class="earn-pts pts-gold" data-pts-key="parrainage">$1</div>'
        $content = $content -replace '(Premium\.init\(profile\);)', '$1 PointsConfig.load().then(()=>PointsConfig.updateDOM());'
        Write-Host "   → Textes points patchés"
    }

    # ── mesnotes.html ────────────────────────────────────────────
    if ($file -eq "mesnotes.html") {
        # Upload cost badge
        $content = $content -replace '(1ère photo gratuite · ⚡) 20 pts', '$1 <span data-pts-key="upload_photo">20 pts</span>'
        # Coût dans la modale
        $content = $content -replace "(SOUMETTRE MA PHOTO \(-10 pts\))", 'SOUMETTRE MA PHOTO (-<span data-pts-key="upload_photo" style="display:inline">10</span> pts)'
        $content = $content -replace '(Premium\.init\(profile\);)', '$1 PointsConfig.load().then(()=>PointsConfig.updateDOM());'
        Write-Host "   → Textes mesnotes patchés"
    }

    # ── noter.html ───────────────────────────────────────────────
    if ($file -eq "noter.html") {
        # Remplacer sessionPts += 1 par la valeur dynamique
        $content = $content -replace 'sessionPts \+= 1;', 'sessionPts += PointsConfig.get("vote");'
        # Remplacer le crédit points +1 par la valeur dynamique
        $content = $content -replace 'const newPts = \(userProfile\?\.points \|\| 0\) \+ 1;', 'const votePoints = PointsConfig.get("vote"); const newPts = (userProfile?.points || 0) + votePoints;'
        $content = $content -replace "(await sb\.from\('points_history'\)\.insert\(\{[^}]*action: 'Note donnée', points: )1(\}\))", '${1}votePoints$2'
        Write-Host "   → Textes noter patchés"
    }

    # ── classement.html ──────────────────────────────────────────
    if ($file -eq "classement.html") {
        $content = $content -replace '(<span class="tab-lock filter-tab-cost">)\(-5 pts\)(</span>)', '$1<span data-pts-key="unlock_profile">-5 pts</span>$2'
        $content = $content -replace '(Premium\.init\(profile\);)', '$1 PointsConfig.load().then(()=>PointsConfig.updateDOM());'
        Write-Host "   → Textes classement patchés"
    }

    # ── index.html ───────────────────────────────────────────────
    if ($file -eq "index.html") {
        $content = $content -replace '(<div class="pts-val">)\+1 pt(</div>)', '<div class="pts-val" data-pts-key="vote">+1 pt</div>'
        $content = $content -replace '(<div class="pts-val">)\+5 pts(</div>)', '<div class="pts-val" data-pts-key="pub">+5 pts</div>'
        $content = $content -replace '(<div class="pts-val">)\+50 pts(</div>)', '<div class="pts-val" data-pts-key="parrainage">+50 pts</div>'
        Write-Host "   → Textes index patchés"
    }

    Set-Content $file -Value $content -Encoding UTF8 -NoNewline
}

Write-Host ""
Write-Host "✔ Terminé ! Pense à git add . && git commit -m 'feat: points dynamiques via points-config.js' && git push"
