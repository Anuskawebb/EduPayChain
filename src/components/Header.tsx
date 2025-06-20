import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, User, Shield, Wallet } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { formatAddress } from '../utils/contract';
import WalletButton from './WalletButton';

const Header: React.FC = () => {
  const location = useLocation();
  const { account, isConnected } = useWallet();
  const { isAdmin } = useContract();

  const navItems = [
    { path: '/', label: 'Home', icon: GraduationCap },
    { path: '/student', label: 'Student', icon: User },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors">
            <GraduationCap className="h-8 w-8" />
            <span className="text-xl font-bold">EduPayChain</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Wallet Section */}
          <div className="flex items-center space-x-4">
            {isConnected && account && (
              <div className="hidden sm:flex items-center space-x-2 text-white/90 text-sm">
                <Wallet className="h-4 w-4" />
                <span>{formatAddress(account)}</span>
                {isAdmin && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
            )}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;