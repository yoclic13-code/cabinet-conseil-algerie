$base = 'http://localhost:3001'
$tmp = Join-Path $env:TEMP 'cca-api-tests'
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$pass = 0; $fail = 0

function Assert-Ok($name, $condition, $detail) {
  if ($condition) {
    Write-Host "OK   $name - $detail" -ForegroundColor Green
    $script:pass++
  } else {
    Write-Host "FAIL $name - $detail" -ForegroundColor Red
    $script:fail++
  }
}

Set-Content -Path "$tmp\login.json" -Encoding ascii -Value '{"email":"admin@cabinet-conseil.dz","password":"Admin123!"}'
$login = curl.exe -s -X POST "$base/api/admin/auth/login" -H "Content-Type: application/json" --data-binary "@$tmp\login.json" | ConvertFrom-Json
$token = $login.token
Assert-Ok 'login' ($null -ne $token) "user=$($login.user.email)"
$Hauth = "Authorization: Bearer $token"

$h = curl.exe -s "$base/api/health" | ConvertFrom-Json
Assert-Ok 'health' ($h.status -eq 'ok') $h.status

curl.exe -s -D "$tmp\pages.hdr" -o "$tmp\pages.json" "$base/api/pages" | Out-Null
$pages = Get-Content "$tmp\pages.json" -Raw | ConvertFrom-Json
$hdr = Get-Content "$tmp\pages.hdr" -Raw
$pageId = $pages.data[0].id
Assert-Ok 'GET /api/pages' ($pages.data.Count -ge 1) "count=$($pages.data.Count)"
Assert-Ok 'cache-control' ($hdr -match 'max-age=60') 'present'

$accueil = curl.exe -s "$base/api/pages/accueil" | ConvertFrom-Json
Assert-Ok 'GET /api/pages/accueil' ($accueil.data.slug -eq 'accueil') "sections=$($accueil.data.sections.Count)"

$sections = curl.exe -s "$base/api/sections?pageSlug=accueil" | ConvertFrom-Json
Assert-Ok 'GET /api/sections' ($sections.data.Count -ge 1) "count=$($sections.data.Count) type=$($sections.data[0].type)"

$sectionBody = @{
  pageId = $pageId
  type = 'image-texte'
  visible = $true
  contenuFR = @{ title = 'Titre FR'; body = 'Corps JSON' }
  contenuEN = @{ title = 'Title EN'; body = 'Body JSON' }
} | ConvertTo-Json -Depth 5 -Compress
[System.IO.File]::WriteAllText("$tmp\section.json", $sectionBody)
$sec = curl.exe -s -X POST "$base/api/admin/sections" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\section.json" | ConvertFrom-Json
Assert-Ok 'POST section image-texte' ($sec.data.type -eq 'image-texte' -and $sec.data.contenuFR.title -eq 'Titre FR') "id=$($sec.data.id)"

$orderBody = @{ items = @(@{ id = $sec.data.id; ordre = 1 }) } | ConvertTo-Json -Compress -Depth 5
[System.IO.File]::WriteAllText("$tmp\order.json", $orderBody)
$ord = curl.exe -s -X PATCH "$base/api/admin/sections/order" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\order.json" | ConvertFrom-Json
Assert-Ok 'PATCH sections/order' ($ord.ok -eq $true) 'ok'

Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 32,32
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::Teal); $g.Dispose()
$bmp.Save("$tmp\up.png", [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
$up = curl.exe -s -X POST "$base/api/admin/upload" -H $Hauth -F "file=@$tmp\up.png" -F "altFR=Alt" | ConvertFrom-Json
Assert-Ok 'POST upload webp' ($up.data.url -like '*.webp') $up.data.url

$artBody = @{
  titreFR='Formation QSE Oran'; titreEN='QSE Training Oran'
  extraitFR='Extrait formation QSE pour operateurs.'
  extraitEN='QSE training excerpt for operators.'
  contenuFR=@{ type='doc'; content=@(@{type='paragraph'; content=@(@{type='text'; text='Contenu article suffisamment long pour le calcul du temps de lecture estime.'})}) }
  contenuEN=@{ type='doc' }
  categorie='Formation'; tags=@('qse'); auteur='Redaction'
  statut='publie'
  datePublication=([DateTime]::UtcNow.ToString('o'))
} | ConvertTo-Json -Depth 8 -Compress
[System.IO.File]::WriteAllText("$tmp\article.json", $artBody)
$art = curl.exe -s -X POST "$base/api/admin/articles" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\article.json" | ConvertFrom-Json
Assert-Ok 'POST article' ($null -ne $art.data.slug) "slug=$($art.data.slug)"
$arts = curl.exe -s "$base/api/articles" | ConvertFrom-Json
Assert-Ok 'GET articles' ($arts.meta.total -ge 1) "total=$($arts.meta.total)"

$evBody = @{
  titreFR='Webinaire HSE'; titreEN='HSE Webinar'
  descriptionFR='Desc FR'; descriptionEN='Desc EN'
  dateDebut=([DateTime]::UtcNow.AddDays(10).ToString('o'))
  lieu='En ligne'
} | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText("$tmp\event.json", $evBody)
$ev = curl.exe -s -X POST "$base/api/admin/evenements" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\event.json" | ConvertFrom-Json
Assert-Ok 'POST evenement' ($ev.data.statut -eq 'a_venir') "slug=$($ev.data.slug)"
$evs = curl.exe -s "$base/api/evenements" | ConvertFrom-Json
Assert-Ok 'GET evenements' ($evs.data.Count -ge 1) "count=$($evs.data.Count)"

[System.IO.File]::WriteAllText("$tmp\secteur.json", '{"nomFR":"Mines","nomEN":"Mining","icone":"mine"}')
$secteur = curl.exe -s -X POST "$base/api/admin/secteurs" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\secteur.json" | ConvertFrom-Json
Assert-Ok 'POST secteur' ($null -ne $secteur.data.id) $secteur.data.id
Assert-Ok 'GET secteurs' ((curl.exe -s "$base/api/secteurs" | ConvertFrom-Json).data.Count -ge 1) 'list'

[System.IO.File]::WriteAllText("$tmp\zone.json", '{"paysRegionFR":"Senegal","paysRegionEN":"Senegal","descriptionFR":"Projets Afrique de l Ouest","descriptionEN":"West Africa projects","niveau":"afrique"}')
$zone = curl.exe -s -X POST "$base/api/admin/zones" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\zone.json" | ConvertFrom-Json
Assert-Ok 'POST zone' ($null -ne $zone.data.id) $zone.data.id
Assert-Ok 'GET zones' ((curl.exe -s "$base/api/zones" | ConvertFrom-Json).data.Count -ge 1) 'list'

[System.IO.File]::WriteAllText("$tmp\ref.json", '{"nom":"Sociedad Demo","logo":"/uploads/demo.webp"}')
$ref = curl.exe -s -X POST "$base/api/admin/references" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\ref.json" | ConvertFrom-Json
Assert-Ok 'POST reference' ($null -ne $ref.data.id) $ref.data.id
Assert-Ok 'GET references' ((curl.exe -s "$base/api/references" | ConvertFrom-Json).data.Count -ge 1) 'list'

[System.IO.File]::WriteAllText("$tmp\contact.json", '{"service":"Formation","zone":"Senegal","secteur":"Mines","description":"Besoin formation HSE equipe terrain 20 personnes.","nom":"Sara K","societe":"Mine SA","email":"sara.k@example.com","telephone":"+221770000000","website":""}')
$contact = curl.exe -s -X POST "$base/api/contact-flow" -H "Content-Type: application/json" --data-binary "@$tmp\contact.json" | ConvertFrom-Json
Assert-Ok 'POST contact-flow' ($contact.ok -eq $true -and $contact.data.id) "lead=$($contact.data.id)"
$leadId = $contact.data.id

$leads = curl.exe -s "$base/api/admin/leads?statut=nouveau" -H $Hauth | ConvertFrom-Json
Assert-Ok 'GET leads filtre' ($leads.data.Count -ge 1) "count=$($leads.data.Count)"

[System.IO.File]::WriteAllText("$tmp\lead.json", '{"statut":"traite"}')
$leadPatch = curl.exe -s -X PATCH "$base/api/admin/leads/$leadId" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\lead.json" | ConvertFrom-Json
Assert-Ok 'PATCH lead traite' ($leadPatch.data.statut -eq 'traite') $leadPatch.data.statut

$csv = curl.exe -s "$base/api/admin/leads/export.csv" -H $Hauth
Assert-Ok 'GET leads CSV' ($csv -match 'email' -and $csv -match 'sara') "len=$($csv.Length)"

[System.IO.File]::WriteAllText("$tmp\settings.json", '{"nomCabinet":"Cabinet Conseil Algerie","baselineFR":"QSE HSE Environnement","baselineEN":"QSE HSE Environment","ville":"Alger","pays":"Algerie","email":"contact@cabinet-conseil.dz","googleAnalyticsId":"G-ABC123"}')
$set = curl.exe -s -X PUT "$base/api/admin/settings" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\settings.json" | ConvertFrom-Json
Assert-Ok 'PUT settings' ($set.data.googleAnalyticsId -eq 'G-ABC123') $set.data.googleAnalyticsId

$seoBody = @{ pageId=$pageId; titleFR='Accueil SEO'; titleEN='Home SEO'; descriptionFR='Desc FR SEO page accueil cabinet.'; descriptionEN='EN SEO home description consulting.' } | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText("$tmp\seo.json", $seoBody)
$seo = curl.exe -s -X PUT "$base/api/admin/seo" -H $Hauth -H "Content-Type: application/json" --data-binary "@$tmp\seo.json" | ConvertFrom-Json
Assert-Ok 'PUT seo' ($seo.data.titleFR -eq 'Accueil SEO') $seo.data.titleFR

$sm = curl.exe -s "$base/sitemap.xml"
Assert-Ok 'sitemap.xml' ($sm -match '<urlset' -and $sm -match 'actualites') "len=$($sm.Length)"
$feed = curl.exe -s "$base/feed.xml"
Assert-Ok 'feed.xml' ($feed -match '<rss' -and $feed -match 'Formation QSE') "len=$($feed.Length)"
$robots = curl.exe -s "$base/robots.txt"
Assert-Ok 'robots.txt' ($robots -match 'Sitemap:') 'ok'

$code = curl.exe -s -o NUL -w "%{http_code}" "$base/api/admin/settings"
Assert-Ok 'admin without JWT returns 401' ($code -eq '401') $code

Write-Host ""
Write-Host "Result: $pass OK / $($pass+$fail) - fails=$fail" -ForegroundColor Cyan
if ($fail -gt 0) { exit 1 }
