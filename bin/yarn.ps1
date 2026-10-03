param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$YarnArguments
)

$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$nodeDirectory = Join-Path $env:ProgramFiles 'nodejs'
$corepackCommand = Join-Path $nodeDirectory 'corepack.cmd'
if (-not (Test-Path -LiteralPath $corepackCommand)) {
  throw 'Node.js and Corepack are required. See README.md.'
}

$env:PATH = "$nodeDirectory;$env:PATH"
$dockerDirectories = @(
  (Join-Path $env:LOCALAPPDATA 'Programs/DockerDesktop/resources/bin'),
  (Join-Path $env:ProgramFiles 'Docker/Docker/resources/bin')
)
foreach ($dockerDirectory in $dockerDirectories) {
  if (Test-Path -LiteralPath $dockerDirectory) {
    $env:PATH = "$dockerDirectory;$env:PATH"
    break
  }
}
$env:COREPACK_HOME = Join-Path $projectDirectory '.cache/corepack'
New-Item -ItemType Directory -Force -Path $env:COREPACK_HOME | Out-Null
# Keep the cached Yarn CLI in CommonJS scope inside this ESM project.
Set-Content -LiteralPath (Join-Path $env:COREPACK_HOME 'package.json') -Value '{"type":"commonjs"}'
Push-Location $projectDirectory
$previousNodeOptions = $env:NODE_OPTIONS
try {
  if ($YarnArguments.Count -gt 0 -and ($YarnArguments[0] -like 'wp-*' -or $YarnArguments[0] -eq 'doctor' -or $YarnArguments[0] -eq 'update:wp-config')) {
    $dnsModulePath = ([System.Uri](Join-Path $PSScriptRoot 'wp-dns.mjs')).AbsoluteUri
    $env:NODE_OPTIONS = "$previousNodeOptions --import `"$dnsModulePath`""
  }
  & $corepackCommand yarn @YarnArguments
  $yarnExitCode = $LASTEXITCODE
} finally {
  $env:NODE_OPTIONS = $previousNodeOptions
  Pop-Location
}
exit $yarnExitCode
