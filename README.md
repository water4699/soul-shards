# Soul Shards - Encrypted Private Expense Log

A privacy-preserving expense tracking application using Fully Homomorphic Encryption (FHE) on the blockchain. Record your expenses anonymously with encrypted data and analyze spending patterns without revealing amounts.

## 🔗 Links

- **📹 Demo Video**: [Watch on GitHub](https://github.com/SuzanneMacDonald/soul-shards-id/blob/main/soul-shards.mp4)
- **🌐 Live Demo**: [View on Vercel](https://soul-shards-tan.vercel.app/)

## Features

### 🔐 **Privacy-First Design**
- **Fully Homomorphic Encryption**: All expense data encrypted on-chain using FHEVM
- **Anonymous Analysis**: Statistical insights without exposing individual amounts
- **Zero-Knowledge Proofs**: Mathematical verification without data disclosure

### 📊 **Advanced Analytics**
- **Category-Emotion Correlation**: Analyze spending patterns and emotional states
- **Expense Pressure Trends**: Track spending levels over time
- **Statistical Correlation**: Pearson coefficient calculation for behavioral insights
- **Batch Operations**: Efficient multi-entry submissions

### 🛡️ **Security Features**
- **Encrypted Storage**: All data remains encrypted throughout analysis
- **Access Control**: User-specific decryption permissions
- **Input Validation**: Comprehensive client and contract-side validation

- **Encrypted Data Storage**: All expense data is encrypted using FHE before being stored on-chain
- **Anonymous Analysis**: Analyze spending patterns without revealing specific amounts
- **Category-Emotion Correlation**: Identify which expense categories most affect your emotions
- **Expense Pressure Trends**: Track expense pressure trends over time
- **Decrypt on Demand**: Decrypt and view your entries when needed

## Project Structure

```
soul-shards/
├── contracts/              # Smart contracts
│   └── EncryptedPrivateExpenseLog.sol
├── deploy/                 # Deployment scripts
│   └── 001_deploy_EncryptedPrivateExpenseLog.ts
├── test/                   # Test scripts
│   ├── EncryptedPrivateExpenseLog.ts
│   └── EncryptedPrivateExpenseLogSepolia.ts
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── fhevm/          # FHEVM utilities
│   │   └── lib/            # Utility libraries
│   └── public/            # Static assets
└── scripts/                # Utility scripts
```

## Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- Hardhat node with FHEVM support (for local development)
- Rainbow wallet browser extension

## Installation

### 1. Install Contract Dependencies

```bash
cd soul-shards
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Configuration

### Contract Configuration

Create a `.env` file in the root directory:

```env
MNEMONIC=your mnemonic phrase
INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
ETHERSCAN_API_KEY=your etherscan api key (optional)
```

### Frontend Configuration

Create a `.env.local` file in the `frontend` directory:

```env
VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
VITE_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
VITE_WALLET_CONNECT_PROJECT_ID=ef3325a718834a2b1b4134d3f520933d
```

## Development

### 1. Start Local Hardhat Node with FHEVM

```bash
npx hardhat node
```

### 2. Deploy Contract Locally

In a new terminal:

```bash
npm run deploy:local
```

Copy the deployed contract address and add it to `frontend/.env.local` as `VITE_CONTRACT_ADDRESS`.

### 3. Run Tests

```bash
# Local tests
npm test

# Sepolia testnet tests
npm run test:sepolia
```

### 4. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:8080`.

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button in the top right corner and connect using Rainbow wallet
2. **Add Expense Entry**: Fill in the expense form with:
   - Category (1-5)
   - Level (1-10)
   - Emotion correlation (1-5)
3. **View History**: View your encrypted expense entries
4. **Decrypt Entries**: Click "Decrypt" on any entry to view the decrypted data
5. **Analyze**: View analysis charts showing:
   - Category-emotion correlation
   - Expense pressure trends

## Smart Contract

### EncryptedPrivateExpenseLog.sol

The main smart contract that stores encrypted expense data.

**Key Functions:**
- `addEntry(uint256 date, bytes32 encryptedCategoryHandle, bytes32 encryptedLevelHandle, bytes32 encryptedEmotionHandle)`: Add a new encrypted expense entry
- `getEntry(address user, uint256 date)`: Get encrypted entry handles for a specific date
- `getEntryCount(address user)`: Get total number of entries for a user
- `getEntryDatesInRange(address user, uint256 startDate, uint256 endDate)`: Get all entry dates in a range

## Deployment

### Local Network

```bash
npm run deploy:local
```

### Sepolia Testnet

```bash
npm run deploy:sepolia
```

## Testing

The project includes comprehensive tests for both local and Sepolia networks:

- `test/EncryptedPrivateExpenseLog.ts`: Local network tests
- `test/EncryptedPrivateExpenseLogSepolia.ts`: Sepolia testnet tests

## License

MIT

