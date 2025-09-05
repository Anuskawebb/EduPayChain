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
      <section className="relative min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="hero-surface hero-pattern px-6 sm:px-10 md:px-14 py-14 md:py-20 text-center overflow-hidden">
            <h1 className="heading-display text-4xl md:text-6xl lg:text-7xl mb-6">
              <span>EduPayChain</span>
              <br />
              <span className="text-2xl md:text-4xl subheading-muted font-semibold">
                Decentralized University Fee Payment
              </span>
            </h1>

            <p className="subheading-muted text-lg md:text-xl mb-10 max-w-3xl mx-auto">
              Revolutionizing education payments with blockchain technology. 
              Pay fees securely, receive NFT certificates, and experience 
              transparent university fee management.
            </p>

            <div className="relative z-[1] flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isConnected ? (
                <Link 
                  href="/student/register"
                  className="btn-cta text-lg px-8 py-3 flex items-center space-x-2"
                >
                  <span>Register as Student</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <Link 
                  href="/student"
                  className="btn-cta text-lg px-8 py-3 flex items-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              
              <Link 
                href="/universities"
                className="btn-ghost text-lg px-8 py-3"
              >
                View Universities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-display text-3xl md:text-4xl mb-4">
              Why Choose EduPayChain?
            </h2>
            <p className="subheading-muted text-xl max-w-2xl mx-auto">
              Experience the future of education payments with our comprehensive 
              blockchain-based solution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm card-hover"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="subheading-muted">
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
            <h2 className="heading-display text-3xl md:text-4xl mb-4">
              How It Works
            </h2>
            <p className="subheading-muted text-xl max-w-2xl mx-auto">
              Simple steps to complete your university fee payment and receive your certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h3>
              <p className="subheading-muted">Connect your MetaMask wallet to get started</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Register as Student</h3>
              <p className="subheading-muted">Complete one-time registration to link your wallet</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select University</h3>
              <p className="subheading-muted">Choose your university and course from the list</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pay Fees</h3>
              <p className="subheading-muted">Pay your fees using ERC-20 tokens securely</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                5
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Certificate</h3>
              <p className="subheading-muted">Receive your NFT certificate after verification</p>
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
              href="/student/register"
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