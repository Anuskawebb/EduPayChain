import React from 'react';
import { Wallet, Loader2 } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const WalletButton: React.FC = () => {
  const { isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

  if (isConnecting) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600/50 text-white rounded-lg cursor-not-allowed"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Connecting...</span>
      </button>
    );
  }

  if (isConnected) {
    return (
      <button
        onClick={disconnectWallet}
        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Disconnect</span>
      </button>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">Connect Wallet</span>
    </button>
  );
};

export default WalletButton;