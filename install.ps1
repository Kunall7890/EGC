$ErrorActionPreference = "Stop"

$RootDir = $PSScriptRoot

Write-Host "EGC install"

# Node.js version check
try {
    $nodeVersion = node -e "process.stdout.write(process.versions.node.split('.')[0])"
    if ([int]$nodeVersion -lt 18) {
        Write-Error "Node.js >= 18 is required (found: $(node --version))"
        exit 1
    }
    Write-Host "  node $(node --version)"
} catch {
    Write-Error "Node.js not found. Install from https://nodejs.org"
    exit 1
}

# Root dependencies
Write-Host "  installing root dependencies..."
Set-Location -Path $RootDir
npm install --silent

# egc-guardian
Write-Host "  building egc-guardian..."
$GuardianDir = Join-Path $RootDir "mcp\servers\egc-guardian"
if (-Not (Test-Path $GuardianDir)) {
    Write-Error "Not found: $GuardianDir"
    exit 1
}
Set-Location -Path $GuardianDir
npm install --silent
npm run build

# egc-memory
Write-Host "  building egc-memory..."
$MemoryDir = Join-Path $RootDir "mcp\servers\egc-memory"
if (-Not (Test-Path $MemoryDir)) {
    Write-Error "Not found: $MemoryDir"
    exit 1
}
Set-Location -Path $MemoryDir
npm install --silent
npm run build

# Initialize database
Write-Host "  initializing database..."
Set-Location -Path $RootDir
node scripts\egc.js init

# Write harness config template
$GuardianBuild = Join-Path $RootDir "mcp\servers\egc-guardian\build\index.js"
$MemoryBuild = Join-Path $RootDir "mcp\servers\egc-memory\build\index.js"

$mcpConfig = @{
    mcpServers = @{
        "egc-guardian" = @{
            command = "node"
            args = @($GuardianBuild)
        }
        "egc-memory" = @{
            command = "node"
            args = @($MemoryBuild)
        }
    }
} | ConvertTo-Json -Depth 4

$mcpConfig | Out-File -FilePath (Join-Path $RootDir ".mcp.egc.json") -Encoding utf8
Write-Host "  harness config written to .mcp.egc.json"

# Final validation
node scripts\egc.js doctor

Write-Host ""
Write-Host "Installation complete."
Write-Host ""
Write-Host "To add EGC to your harness, merge .mcp.egc.json into your harness MCP config."
Write-Host "Run 'egc --help' for available commands."
