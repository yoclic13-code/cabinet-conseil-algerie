$base = 'http://localhost:3001'
$tmp = Join-Path $env:TEMP 'cca-admin-flow'
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$pass = 0; $fail = 0

function Ok($name, $cond, $detail) {
  if ($cond) { Write-Host "OK   $name - $detail" -ForegroundColor Green; $script:pass++ }
  else { Write-Host "FAIL $name - $detail" -ForegroundColor Red; $script:fail++ }
}

# 1 Login
[System.IO.File]::WriteAllText("$tmp\login.json", '{"email":"admin@cabinet-conseil.dz","password":"Admin123!"}')
$login = curl.exe -s -X POST "$base/api/admin/auth/login" -H "Content-Type: application/json" --data-binary "@$tmp\login.json" | ConvertFrom-Json
$token = $login.token
$H = "Authorization: Bearer $token"
Ok 'login' ($null -ne $token) $login.user.email

# 2 Get page
$pages = curl.exe -s "$base/api/admin/pages" -H $H | ConvertFrom-Json
$pageId = $pages.data[0].id
Ok 'pages' ($null -ne $pageId) $pages.data[0].slug

# 3 Create section
$secBody = @{
  pageId = $pageId
  type = 'texte'
  visible = $true
  contenuFR = @{ title = 'Phase 4 test'; body = 'Contenu cree depuis le flux admin' }
  contenuEN = @{ title = 'Phase 4 test'; body = 'Content from admin flow' }
} | ConvertTo-Json -Depth 5 -Compress
[System.IO.File]::WriteAllText("$tmp\section.json", $secBody)
$sec = curl.exe -s -X POST "$base/api/admin/sections" -H $H -H "Content-Type: application/json" --data-binary "@$tmp\section.json" | ConvertFrom-Json
$sectionId = $sec.data.id
Ok 'create section' ($null -ne $sectionId) "type=$($sec.data.type)"

# 4 Reorder
$all = curl.exe -s "$base/api/admin/sections?pageId=$pageId&includeHidden=true" -H $H | ConvertFrom-Json
$items = @()
# reverse order
$rev = @($all.data); [array]::Reverse($rev)
for ($i=0; $i -lt $rev.Count; $i++) { $items += @{ id = $rev[$i].id; ordre = $i } }
$orderBody = @{ items = $items } | ConvertTo-Json -Depth 5 -Compress
[System.IO.File]::WriteAllText("$tmp\order.json", $orderBody)
$ord = curl.exe -s -X PATCH "$base/api/admin/sections/order" -H $H -H "Content-Type: application/json" --data-binary "@$tmp\order.json" | ConvertFrom-Json
Ok 'reorder sections' ($ord.ok -eq $true) "count=$($items.Count)"

# 5 Article brouillon
$artBody = @{
  titreFR = 'Article flux Phase 4'
  titreEN = 'Phase 4 flow article'
  extraitFR = 'Extrait brouillon pour test admin.'
  extraitEN = 'Draft excerpt for admin test.'
  contenuFR = @{ type = 'doc'; content = @(@{ type = 'paragraph'; content = @(@{ type = 'text'; text = 'Corps brouillon.' }) }) }
  contenuEN = @{ type = 'doc' }
  categorie = 'Test'
  tags = @('phase4')
  auteur = 'Admin'
  statut = 'brouillon'
} | ConvertTo-Json -Depth 8 -Compress
[System.IO.File]::WriteAllText("$tmp\article.json", $artBody)
$art = curl.exe -s -X POST "$base/api/admin/articles" -H $H -H "Content-Type: application/json" --data-binary "@$tmp\article.json" | ConvertFrom-Json
$articleId = $art.data.id
Ok 'article brouillon' ($art.data.statut -eq 'brouillon') "id=$articleId slug=$($art.data.slug)"

# Public should NOT list brouillon
$pub = curl.exe -s "$base/api/articles" | ConvertFrom-Json
$foundDraft = @($pub.data | Where-Object { $_.id -eq $articleId }).Count -gt 0
Ok 'brouillon invisible public' (-not $foundDraft) "publicTotal=$($pub.meta.total)"

# 6 Publish
$pubBody = @{
  statut = 'publie'
  datePublication = ([DateTime]::UtcNow.ToString('o'))
} | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText("$tmp\publish.json", $pubBody)
$published = curl.exe -s -X PATCH "$base/api/admin/articles/$articleId" -H $H -H "Content-Type: application/json" --data-binary "@$tmp\publish.json" | ConvertFrom-Json
Ok 'article publie' ($published.data.statut -eq 'publie') $published.data.statut

$pub2 = curl.exe -s "$base/api/articles" | ConvertFrom-Json
$foundPub = @($pub2.data | Where-Object { $_.slug -eq $published.data.slug }).Count -gt 0
Ok 'publie visible public' ($foundPub) "slug=$($published.data.slug)"

# 7 Client UI reachable
$code = curl.exe -s -o NUL -w "%{http_code}" http://localhost:5173/admin/login
Ok 'UI /admin/login' ($code -eq '200') "http=$code"

Write-Host ""
Write-Host "Result: $pass OK / $($pass+$fail) fails=$fail" -ForegroundColor Cyan
if ($fail -gt 0) { exit 1 }
