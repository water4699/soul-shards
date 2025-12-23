# PowerShell script for batch deployment across networks
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("localhost", "sepolia", "mainnet")]
    [string]$Network = "localhost",

    [Parameter(Mandatory=$false)]
    [switch]$Verify
)

Write-Host "🔧 Batch Deployment Script for Soul Shards" -ForegroundColor Cyan
Write-Host "Network: $Network" -ForegroundColor Yellow
Write-Host "Verify: $($Verify.ToBool())" -ForegroundColor Yellow
Write-Host ""

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Green
$env:INFURA_API_KEY = "b18fb7e6ca7045ac83c41157ab93f990"
$env:MNEMONIC = "test test test test test test test test test test test junk"
$env:ETHERSCAN_API_KEY = "DNXBYCTQ2Q9J1P7K3R8F5V6W2X4Z7C8B9N1M2L3K4J5H6G7F8D9S0A1"

# Deploy contract
Write-Host "🚀 Deploying contract to $Network..." -ForegroundColor Green
if ($Network -eq "localhost") {
    npm run deploy:local
} else {
    npx hardhat deploy --network $Network
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

# Verify contract if requested
if ($Verify) {
    Write-Host "🔍 Verifying contract on $Network..." -ForegroundColor Green
    if ($Network -eq "sepolia") {
        npm run verify:sepolia
    } elseif ($Network -eq "mainnet") {
        npm run verify:mainnet
    }
}

Write-Host "✅ Batch deployment completed successfully!" -ForegroundColor Green
