# PowerShell script to set Hardhat environment variables
# This script sets the required variables for deployment

Write-Host "Setting Hardhat environment variables..." -ForegroundColor Cyan

# Set INFURA_API_KEY
$infuraKey = "b18fb7e6ca7045ac83c41157ab93f990"
Write-Host "Setting INFURA_API_KEY..." -ForegroundColor Yellow
$env:INFURA_API_KEY = $infuraKey

# Set MNEMONIC for deployment
$mnemonic = "test test test test test test test test test test test junk"
Write-Host "Setting MNEMONIC..." -ForegroundColor Yellow
$env:MNEMONIC = $mnemonic

# Set ETHERSCAN_API_KEY for contract verification
$etherscanKey = "DNXBYCTQ2Q9J1P7K3R8F5V6W2X4Z7C8B9N1M2L3K4J5H6G7F8D9S0A1"
Write-Host "Setting ETHERSCAN_API_KEY..." -ForegroundColor Yellow
$env:ETHERSCAN_API_KEY = $etherscanKey

Write-Host "`nAll environment variables set successfully!" -ForegroundColor Green
Write-Host "`nVariables set. You can now deploy using:" -ForegroundColor Green
Write-Host "  npx hardhat deploy --network sepolia" -ForegroundColor Yellow
Write-Host "`nOr use the deploy script:" -ForegroundColor Green
Write-Host "  .\scripts\deploy-sepolia.ps1" -ForegroundColor Yellow

