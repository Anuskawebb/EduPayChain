'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '../contexts/WalletContext';
import AccountSelector from './AccountSelector';
import { forceAccountSelection } from '../utils/contract';
import { Wallet, GraduationCap, Users, Settings, Menu, X, RefreshCw } from 'lucide-react';

const Navigation: React.FC = () => {
  const { isConnected, address, isAdmin, connect, disconnect, isLoading } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleWalletAction = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  const handleSwitchAccount = async () => {
    setIsSwitchingAccount(true);
    try {
      await forceAccountSelection();
      // Refresh the page to update the wallet context
      window.location.reload();
    } catch (error) {
      console.error('Error switching account:', error);
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleAccountSelect = (newAddress: string) => {
    // The wallet context will automatically update when the account changes
    console.log('Account selected:', newAddress);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold gradient-text">EduPayChain</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              href="/student" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              Student Dashboard
            </Link>
            <Link 
              href="/student/register" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              Student Registration
            </Link>
            {isAdmin && (
              <Link 
                href="/admin" 
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                Admin Dashboard
              </Link>
            )}
            <Link 
              href="/universities" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              Universities
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-end">
            {isConnected && (
              <AccountSelector 
                onAccountSelect={handleAccountSelect}
                currentAddress={address || undefined}
              />
            )}
            
            {isConnected && (
              <button
                onClick={handleSwitchAccount}
                disabled={isSwitchingAccount}
                className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 text-xs sm:text-sm"
                title="Force account selection"
              >
                <RefreshCw className={`h-4 w-4 ${isSwitchingAccount ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap hidden xs:inline">Switch Account</span>
                <span className="whitespace-nowrap xs:hidden">Switch</span>
              </button>
            )}
            
            <button
              onClick={handleWalletAction}
              disabled={isLoading}
              className="flex items-center space-x-1 sm:space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 text-xs sm:text-sm"
            >
              <Wallet className="h-4 w-4" />
              <span className="whitespace-nowrap">
                {isLoading 
                  ? 'Connecting...' 
                  : isConnected 
                    ? formatAddress(address!) 
                    : 'Connect Wallet'
                }
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/student" 
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Student Dashboard
              </Link>
              <Link 
                href="/student/register" 
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Student Registration
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <Link 
                href="/universities" 
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Universities
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;