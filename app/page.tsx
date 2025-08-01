'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '../contexts/WalletContext';
import Navigation from '../components/Navigation';
import { 
  GraduationCap, 
  Shield, 
  CreditCard, 
  Award, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isConnected } = useWallet();

  const features = [
    {
      icon: <CreditCard className="h-8 w-8 text-primary-600" />,
      title: 'ERC-20 Token Payments',
      description: 'Secure fee payments using ERC-20 tokens with on-chain verification and transparency.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'On-Chain Verification',
      description: 'All payments and verifications are recorded on the blockchain for complete transparency.'
    },
    {
      icon: <Award className="h-8 w-8 text-primary-600" />,
      title: 'NFT Certificates',
      description: 'Receive unique NFT certificates after payment verification, stored securely on the blockchain.'
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: 'University Management',
      description: 'Admin-controlled university registration with customizable courses and fee structures.'
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-600" />,
      title: 'Real-time Notifications',
      description: 'Instant notifications via EPNS/Push Protocol for payment updates and certificate issuance.'
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-primary-600" />,
      title: 'Decentralized Education',
      description: 'Revolutionizing education payments with blockchain technology and smart contracts.'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">EduPayChain</span>
              <br />
              <span className="text-2xl md:text-4xl text-gray-600">
                Decentralized University Fee Payment
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionizing education payments with blockchain technology. 
              Pay fees securely, receive NFT certificates, and experience 
              transparent university fee management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isConnected ? (
                <Link 
                  href="/student"
                  className="btn-primary text-lg px-8 py-3 flex items-center space-x-2"
                >
                  <span>Register as Student</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <Link 
                  href="/student"
                  className="btn-primary text-lg px-8 py-3 flex items-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              
              <Link 
                href="/universities"
                className="btn-secondary text-lg px-8 py-3"
              >
                View Universities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EduPayChain?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of education payments with our comprehensive 
              blockchain-based solution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 card-hover"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to complete your university fee payment and receive your certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h3>
              <p className="text-gray-600">Connect your MetaMask wallet to get started</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select University</h3>
              <p className="text-gray-600">Choose your university and course from the list</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pay Fees</h3>
              <p className="text-gray-600">Pay your fees using ERC-20 tokens securely</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Certificate</h3>
              <p className="text-gray-600">Receive your NFT certificate after verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join the future of education payments with EduPayChain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/student"
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Start Now
            </Link>
            <Link 
              href="/universities"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              View Universities
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">EduPayChain</span>
            </div>
            <p className="text-gray-400 mb-4">
              Decentralized University Fee Payment Platform
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 EduPayChain</span>
              <span>•</span>
              <span>Built with Next.js & Ethers.js</span>
              <span>•</span>
              <span>Powered by Blockchain</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 