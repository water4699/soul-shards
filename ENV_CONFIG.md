# Environment Configuration Guide

## Frontend Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```bash
# Contract Addresses for different networks
VITE_CONTRACT_ADDRESS_SEPOLIA=0xYourSepoliaContractAddress
VITE_CONTRACT_ADDRESS_LOCALHOST=0xYourLocalContractAddress

# Wallet Connect Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# FHEVM Configuration
VITE_FHEVM_RELAY_URL=https://relayer.fhevm.network
VITE_FHEVM_GATEWAY_URL=https://gateway.fhevm.network

# Application Settings
VITE_APP_TITLE="Soul Shards - Encrypted Expense Tracker"
VITE_APP_DESCRIPTION="Track your expenses privately with fully homomorphic encryption"
```

## Network Configuration

The application supports multiple networks:
- **Sepolia Testnet**: For testing with FHEVM
- **Localhost**: For development with Hardhat

## Wallet Integration

Supports MetaMask and other Web3 wallets through WalletConnect protocol.

## Security Notes

- Never commit `.env` files to version control
- Use environment-specific contract addresses
- Keep sensitive configuration secure











