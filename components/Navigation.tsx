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
    <nav className="nav-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {/* Gradient graduation cap icon */}
              <svg className="logo-cap" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Home">
                <defs>
                  <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5b7cfa" />
                    <stop offset="100%" stopColor="#6c5ce7" />
                  </linearGradient>
                </defs>
                <path d="M24 6L4 14l20 8 20-8-20-8z" fill="url(#capGrad)"/>
                <path d="M10 22v6c0 2 7 6 14 6s14-4 14-6v-6l-14 6-14-6z" fill="#e6e9ff"/>
                <circle cx="40" cy="23" r="2.5" fill="#6c5ce7"/>
              </svg>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="nav-link transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              href="/student" 
              className="nav-link transition-colors duration-200"
            >
              Student Dashboard
            </Link>
            <Link 
              href="/student/register" 
              className="nav-link transition-colors duration-200"
            >
              Student Registration
            </Link>
            {isAdmin && (
              <Link 
                href="/admin" 
                className="nav-link transition-colors duration-200"
              >
                Admin Dashboard
              </Link>
            )}
            <Link 
              href="/universities" 
              className="nav-link transition-colors duration-200"
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
              className="nav-pill text-xs sm:text-sm disabled:opacity-50"
            >
              {isLoading 
                ? 'Connecting...'
                : isConnected 
                  ? formatAddress(address!) 
                  : 'Connect Wallet'}
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