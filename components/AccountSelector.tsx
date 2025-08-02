'use client';

import React, { useState, useEffect } from 'react';
import { getAvailableAccounts, switchToAccount } from '../utils/contract';
import { ChevronDown, User, Wallet } from 'lucide-react';

interface AccountSelectorProps {
  onAccountSelect: (address: string) => void;
  currentAddress?: string;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ onAccountSelect, currentAddress }) => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const availableAccounts = await getAvailableAccounts();
      setAccounts(availableAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleAccountSelect = async (account: string) => {
    setIsLoading(true);
    try {
      const accountIndex = accounts.indexOf(account);
      if (accountIndex !== -1) {
        await switchToAccount(accountIndex);
        onAccountSelect(account);
      }
    } catch (error) {
      console.error('Error switching account:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (accounts.length <= 1) {
    return null; // Don't show selector if only one account
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
      >
        <Wallet className="h-4 w-4" />
        <span className="text-sm">
          {currentAddress ? formatAddress(currentAddress) : 'Select Account'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">Available Accounts</div>
            {accounts.map((account, index) => (
              <button
                key={account}
                onClick={() => handleAccountSelect(account)}
                disabled={isLoading}
                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors duration-200 ${
                  currentAddress === account ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{formatAddress(account)}</span>
                  {currentAddress === account && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSelector; 