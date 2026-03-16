param(
  [switch]$SkipEnvBootstrap,
  [switch]$SkipWait
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$script:DockerCommand = $null

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Ensure-File {
  param(
    [string]$Source,
    [string]$Target
  )

  if (-not (Test-Path $Target)) {
    Copy-Item $Source $Target
    Write-Host "Created $Target from example." -ForegroundColor Yellow
  }
}

function Get-RequiredCommand {
  param(
    [string[]]$Names,
    [string]$Label
  )

  foreach ($name in $Names) {
    $command = Get-Command $name -ErrorAction SilentlyContinue
    if ($command) {
      return $command.Source
    }
  }

  throw "$Label is required but was not found on PATH."
}

function Test-PortOpen {
  param([int]$Port)

  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $asyncResult = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    $connected = $asyncResult.AsyncWaitHandle.WaitOne(500, $false) -and $client.Connected

    if ($connected) {
      $client.EndConnect($asyncResult)
    }

    $client.Close()
    return $connected
  } catch {
    return $false
  }
}

function Wait-Port {
  param(
    [int]$Port,
    [int]$TimeoutSeconds = 60
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortOpen -Port $Port) {
      return
    }
    Start-Sleep -Seconds 1
  }

  throw "Timed out waiting for port $Port."
}

function Wait-Http {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  throw "Timed out waiting for $Url."
}

Set-Location $root

$script:DockerCommand = Get-RequiredCommand -Names @("docker", "docker.exe") -Label "Docker"

if (-not $SkipEnvBootstrap) {
  Write-Step "Ensuring local environment files exist"
  Ensure-File -Source (Join-Path $root ".env.example") -Target (Join-Path $root ".env")
  Ensure-File -Source (Join-Path $root "apps\api\.env.example") -Target (Join-Path $root "apps\api\.env")
  Ensure-File -Source (Join-Path $root "apps\web\.env.local.example") -Target (Join-Path $root "apps\web\.env.local")
}

Write-Step "Building and starting the full EventGrid stack with Docker Compose"
& $script:DockerCommand compose up -d --build

if (-not $SkipWait) {
  Write-Step "Waiting for EventGrid services"
  Wait-Port -Port 5432
  Wait-Port -Port 6379
  Wait-Port -Port 8000
  Wait-Port -Port 4000
  Wait-Port -Port 3000
  Wait-Http -Url "http://localhost:8000/health" -TimeoutSeconds 90
  Wait-Http -Url "http://localhost:4000/health" -TimeoutSeconds 120
  Wait-Http -Url "http://localhost:3000/health" -TimeoutSeconds 120
}

Write-Step "EventGrid deployment complete"
Write-Host "Web: http://localhost:3000" -ForegroundColor Green
Write-Host "API: http://localhost:4000/api" -ForegroundColor Green
Write-Host "API health: http://localhost:4000/health" -ForegroundColor Green
Write-Host "AI health: http://localhost:8000/health" -ForegroundColor Green
Write-Host "MinIO console: http://localhost:9001" -ForegroundColor Green
Write-Host ""
Write-Host "Demo sign-in:" -ForegroundColor Cyan
Write-Host "  admin@eventgrid.dev / any password" -ForegroundColor Green
Write-Host "  sales@eventgrid.dev / any password" -ForegroundColor Green
