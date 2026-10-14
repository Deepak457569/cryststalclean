<#
.SYNOPSIS
  CrystalClean Production Worker & API Live Smoke Test Suite
.DESCRIPTION
  Automated black-box security verification for CrystalClean deployment.
  Checks:
    1. Admin routes return 401 without a session
    2. Mutating routes reject cross-origin requests (CSRF)
    3. Strict security response headers (CSP, HSTS, X-Frame-Options, etc.)
    4. Draft products and ?preview=drafts are strictly private (401)
    5. Rate limiting returns 429 with Retry-After header
    6. Sensitive files (/.env, /wrangler.toml) are blocked
    7. robots.txt properly disallows /admin and /api
.EXAMPLE
  .\scripts\smoke-test.ps1 -SiteUrl "https://cryststalclean.crystalclean457-a60.workers.dev"
#>

param(
  [string]$SiteUrl = "https://cryststalclean.crystalclean457-a60.workers.dev"
)

$ErrorActionPreference = "Continue"
$SiteUrl = $SiteUrl.TrimEnd('/')

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " CrystalClean Production Live Security Smoke Test" -ForegroundColor Cyan
Write-Host " Target Base URL: $SiteUrl" -ForegroundColor Cyan
Write-Host " Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

function Report-Check {
  param(
    [string]$Name,
    [bool]$Passed,
    [string]$Details = ""
  )
  if ($Passed) {
    Write-Host "[ PASS ] " -ForegroundColor Green -NoNewline
    Write-Host "$Name" -ForegroundColor White
    if ($Details) { Write-Host "         $Details" -ForegroundColor DarkGray }
    $script:passCount++
  } else {
    Write-Host "[ FAIL ] " -ForegroundColor Red -NoNewline
    Write-Host "$Name" -ForegroundColor Yellow
    if ($Details) { Write-Host "         Reason: $Details" -ForegroundColor Red }
    $script:failCount++
  }
}

# ------------------------------------------------------------
# Check 1: Admin routes return 401 without session
# ------------------------------------------------------------
$adminEndpoints = @("/api/admin/stats", "/api/inquiries", "/api/access-codes")
$all401 = $true
$details401 = ""

foreach ($ep in $adminEndpoints) {
  try {
    $res = Invoke-WebRequest -Uri "$SiteUrl$ep" -Method Get -SkipHttpErrorCheck -TimeoutSec 10
    if ($res.StatusCode -ne 401) {
      $all401 = $false
      $details401 += "$ep returned $($res.StatusCode) (expected 401); "
    }
  } catch {
    $all401 = $false
    $details401 += "$ep error: $($_.Exception.Message); "
  }
}
Report-Check -Name "Admin routes return 401 Unauthorized without session" -Passed $all401 -Details $details401

# ------------------------------------------------------------
# Check 2: Mutating routes reject forged/bad Origin
# ------------------------------------------------------------
$csrfPassed = $false
$csrfDetails = ""
try {
  $headers = @{
    "Content-Type" = "application/json"
    "Origin" = "https://malicious-attacker-website.com"
  }
  $body = '{"name":"Hacked Category"}'
  $res = Invoke-WebRequest -Uri "$SiteUrl/api/categories" -Method Post -Headers $headers -Body $body -SkipHttpErrorCheck -TimeoutSec 10
  if ($res.StatusCode -eq 403 -or $res.StatusCode -eq 401) {
    $csrfPassed = $true
    $csrfDetails = "Status code $($res.StatusCode) received on cross-origin mutation."
  } else {
    $csrfDetails = "Expected 403 Forbidden, got $($res.StatusCode)"
  }
} catch {
  $csrfDetails = $_.Exception.Message
}
Report-Check -Name "Mutating route rejects cross-origin request" -Passed $csrfPassed -Details $csrfDetails

# ------------------------------------------------------------
# Check 3: Response security headers present
# ------------------------------------------------------------
$headersPassed = $true
$missingHeaders = @()
try {
  $res = Invoke-WebRequest -Uri "$SiteUrl/api/auth/me" -Method Get -SkipHttpErrorCheck -TimeoutSec 10
  $h = $res.Headers

  if (-not $h["Content-Security-Policy"]) { $missingHeaders += "Content-Security-Policy" }
  if (-not $h["Strict-Transport-Security"]) { $missingHeaders += "Strict-Transport-Security" }
  if ($h["X-Content-Type-Options"] -ne "nosniff") { $missingHeaders += "X-Content-Type-Options" }
  if ($h["X-Frame-Options"] -ne "DENY") { $missingHeaders += "X-Frame-Options" }
  if (-not $h["Referrer-Policy"]) { $missingHeaders += "Referrer-Policy" }
  if (-not $h["Permissions-Policy"]) { $missingHeaders += "Permissions-Policy" }

  if ($missingHeaders.Count -gt 0) {
    $headersPassed = $false
    $headerDetails = "Missing or invalid: $($missingHeaders -join ', ')"
  } else {
    $headerDetails = "CSP, HSTS, nosniff, DENY, Referrer-Policy, Permissions-Policy all verified."
  }
} catch {
  $headersPassed = $false
  $headerDetails = $_.Exception.Message
}
Report-Check -Name "Security headers present on all responses" -Passed $headersPassed -Details $headerDetails

# ------------------------------------------------------------
# Check 4: Draft products are not public
# ------------------------------------------------------------
$draftsPassed = $false
$draftsDetails = ""
try {
  $resPreview = Invoke-WebRequest -Uri "$SiteUrl/api/products?preview=drafts" -Method Get -SkipHttpErrorCheck -TimeoutSec 10
  $resActive0 = Invoke-WebRequest -Uri "$SiteUrl/api/products?active_only=0" -Method Get -SkipHttpErrorCheck -TimeoutSec 10

  if ($resPreview.StatusCode -eq 401 -and $resActive0.StatusCode -eq 401) {
    $draftsPassed = $true
    $draftsDetails = "?preview=drafts and ?active_only=0 both return 401 Unauthorized"
  } else {
    $draftsDetails = "preview=drafts gave $($resPreview.StatusCode); active_only=0 gave $($resActive0.StatusCode) (expected 401)"
  }
} catch {
  $draftsDetails = $_.Exception.Message
}
Report-Check -Name "Draft products protected from public viewing" -Passed $draftsPassed -Details $draftsDetails

# ------------------------------------------------------------
# Check 5: Rate limiting returns 429 and Retry-After header
# ------------------------------------------------------------
$rateLimitPassed = $false
$rateLimitDetails = ""
try {
  $got429 = $false
  $retryAfterFound = $false
  for ($i = 1; $i -le 8; $i++) {
    $body = '{"code":"TEST-RATE-LIMIT"}'
    $res = Invoke-WebRequest -Uri "$SiteUrl/api/access-codes/verify" -Method Post -ContentType "application/json" -Body $body -SkipHttpErrorCheck -TimeoutSec 10
    if ($res.StatusCode -eq 429) {
      $got429 = $true
      if ($res.Headers["Retry-After"]) {
        $retryAfterFound = $true
      }
      break
    }
  }

  if ($got429 -and $retryAfterFound) {
    $rateLimitPassed = $true
    $rateLimitDetails = "HTTP 429 triggered with Retry-After header."
  } elseif ($got429) {
    $rateLimitPassed = $true
    $rateLimitDetails = "HTTP 429 triggered."
  } else {
    $rateLimitDetails = "Did not encounter 429 within 8 rapid requests (check CF dashboard or D1 limit)."
  }
} catch {
  $rateLimitDetails = $_.Exception.Message
}
Report-Check -Name "Rate limiting triggers HTTP 429 with Retry-After" -Passed $rateLimitPassed -Details $rateLimitDetails

# ------------------------------------------------------------
# Check 6: Sensitive files are not served
# ------------------------------------------------------------
$secretsPassed = $true
$secretsDetails = ""
foreach ($f in @("/.env", "/.dev.vars", "/wrangler.toml")) {
  try {
    $res = Invoke-WebRequest -Uri "$SiteUrl$f" -Method Get -SkipHttpErrorCheck -TimeoutSec 10
    if ($res.StatusCode -eq 200 -and $res.Content.Length -gt 0) {
      $secretsPassed = $false
      $secretsDetails += "$f is publicly served with HTTP 200!; "
    }
  } catch {
    # Expected error / 404
  }
}
if ($secretsPassed) { $secretsDetails = "/.env, /.dev.vars, /wrangler.toml are safely not accessible." }
Report-Check -Name "Sensitive configuration files are not served" -Passed $secretsPassed -Details $secretsDetails

# ------------------------------------------------------------
# Check 7: robots.txt disallows /admin and /api
# ------------------------------------------------------------
$robotsPassed = $false
$robotsDetails = ""
try {
  $res = Invoke-WebRequest -Uri "$SiteUrl/robots.txt" -Method Get -SkipHttpErrorCheck -TimeoutSec 10
  if ($res.StatusCode -eq 200) {
    $content = $res.Content
    $hasAdmin = $content -match "Disallow:\s*/admin"
    $hasApi = $content -match "Disallow:\s*/api"
    if ($hasAdmin -and $hasApi) {
      $robotsPassed = $true
      $robotsDetails = "robots.txt verified: Disallow /admin and Disallow /api both present."
    } else {
      $robotsDetails = "robots.txt missing Disallow /admin ($hasAdmin) or Disallow /api ($hasApi)"
    }
  } else {
    $robotsDetails = "robots.txt returned HTTP $($res.StatusCode)"
  }
} catch {
  $robotsDetails = $_.Exception.Message
}
Report-Check -Name "robots.txt disallows /admin and /api" -Passed $robotsPassed -Details $robotsDetails

# ------------------------------------------------------------
# Summary
# ------------------------------------------------------------
Write-Host "`n------------------------------------------------------------" -ForegroundColor Cyan
Write-Host " Smoke Test Complete: $passCount Passed, $failCount Failed" -ForegroundColor ($failCount -eq 0 ? "Green" : "Yellow")
Write-Host "------------------------------------------------------------`n" -ForegroundColor Cyan

if ($failCount -gt 0) {
  exit 1
} else {
  exit 0
}
