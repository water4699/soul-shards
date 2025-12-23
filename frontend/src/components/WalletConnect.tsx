import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const WalletConnect = () => {
  const { isConnected, isConnecting } = useAccount();

  if (isConnecting) {
    return <div className="text-sm text-muted-foreground">Connecting wallet...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <ConnectButton
        chainStatus="icon"
        showBalance={false}
      />
      {isConnected && (
        <span className="text-xs text-green-600 font-medium">✓ Connected</span>
      )}
    </div>
  );
};

export default WalletConnect;

