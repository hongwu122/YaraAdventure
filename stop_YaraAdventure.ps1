param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$gameRoot = [IO.Path]::GetFullPath($PSScriptRoot)
$serverPath = Join-Path $gameRoot 'server.py'
$listeners = @(Get-NetTCPConnection -LocalPort 8768 -State Listen -ErrorAction SilentlyContinue)
$serverIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique)
if (!$serverIds.Count) { Write-Host 'Yara Adventure is already stopped.'; exit 0 }
foreach ($serverId in $serverIds) {
  $serverProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $serverId"
  $command = [string]$serverProcess.CommandLine
  $matchesRoot = $command.IndexOf($serverPath, [StringComparison]::OrdinalIgnoreCase) -ge 0
  if (!$matchesRoot) {
    # The original launcher uses a relative server.py argument. Confirm its project through the health endpoint.
    $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8768/api/health' -TimeoutSec 2
    $matchesRoot = ($health.app -eq 'YaraAdventure' -and $health.root -and ([IO.Path]::GetFullPath([string]$health.root) -eq $gameRoot))
  }
  if (!$matchesRoot -or $serverProcess.Name -notmatch '^(python|pythonw|py)([0-9.]*)?\.exe$') {
    Write-Host 'Port 8768 belongs to another process. It has not been stopped.'; exit 1
  }
  if ($CheckOnly) { Write-Host "Verified Yara server: $serverId" }
  else { Stop-Process -Id $serverId; Write-Host 'Yara Adventure server stopped. Save files are preserved.' }
}
