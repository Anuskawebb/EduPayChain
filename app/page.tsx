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
      icon: <CreditCard className="h-8 w-8 text-blue-500" />,
      title: 'ERC-20 Token Payments',
      description: 'Secure fee payments using ERC-20 tokens with on-chain verification and transparency.'
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: 'On-Chain Verification',
      description: 'All payments and verifications are recorded on the blockchain for complete transparency.'
    },
    {
      icon: <Award className="h-8 w-8 text-orange-500" />,
      title: 'NFT Certificates',
      description: 'Receive unique NFT certificates after payment verification, stored securely on the blockchain.'
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: 'University Management',
      description: 'Admin-controlled university registration with customizable courses and fee structures.'
    },
    {
      icon: <Zap className="h-8 w-8 text-pink-500" />,
      title: 'Real-time Notifications',
      description: 'Instant notifications via EPNS/Push Protocol for payment updates and certificate issuance.'
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-indigo-500" />,
      title: 'Decentralized Education',
      description: 'Revolutionizing education payments with blockchain technology and smart contracts.'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 hero-pattern overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="px-6 sm:px-10 md:px-14 py-14 md:py-20 text-center">
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

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="step-card animate-slide-in-left" style={{animationDelay: '0.1s'}}>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="step-badge step-badge-hover rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h3>
                    <p className="subheading-muted">Connect your MetaMask wallet to get started</p>
                    <div className="step-expanded">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Install MetaMask browser extension and create your wallet. Connect to Sepolia testnet for testing. 
                        Your wallet address will be used to identify you as a student and process all blockchain transactions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="step-card animate-slide-in-left" style={{animationDelay: '0.2s'}}>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="step-badge step-badge-hover rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Register as Student</h3>
                    <p className="subheading-muted">Complete one-time registration to link your wallet</p>
                    <div className="step-expanded">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Register your wallet address on the blockchain to receive the STUDENT_ROLE. This one-time process 
                        links your identity to the smart contract and enables you to make fee payments and receive certificates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="step-card animate-slide-in-left" style={{animationDelay: '0.3s'}}>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="step-badge step-badge-hover rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select University</h3>
                    <p className="subheading-muted">Choose your university and course from the list</p>
                    <div className="step-expanded">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Browse through verified universities and their available courses. Each university sets their own 
                        fee structure in ERC-20 tokens. Select the course you want to enroll in and view the payment requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="step-card animate-slide-in-left" style={{animationDelay: '0.4s'}}>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="step-badge step-badge-hover rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Pay Fees</h3>
                    <p className="subheading-muted">Pay your fees using ERC-20 tokens securely</p>
                    <div className="step-expanded">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Approve the smart contract to spend your ERC-20 tokens, then execute the payment transaction. 
                        Your payment is recorded on-chain with metadata including your name, course, and university. 
                        The transaction is transparent and verifiable by anyone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="step-card animate-slide-in-left" style={{animationDelay: '0.5s'}}>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="step-badge step-badge-hover rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                      5
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Certificate</h3>
                    <p className="subheading-muted">Receive your NFT certificate after verification</p>
                    <div className="step-expanded">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Once your payment is verified by the university admin, an NFT certificate is minted to your wallet. 
                        This certificate contains your course details, completion date, and is permanently stored on the blockchain. 
                        You can view and transfer your certificate anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-wrap">
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
                className="feature-card p-6 card-hover animate-fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 hero-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-display text-3xl md:text-4xl text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="subheading-muted text-xl mb-8">
            Join the future of education payments with EduPayChain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/student/register"
              className="btn-cta font-semibold py-3 px-8 rounded-lg"
            >
              Start Now
            </Link>
            <Link 
              href="/universities"
              className="btn-ghost font-semibold py-3 px-8 rounded-lg"
            >
              View Universities
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-wrap py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <svg className="logo-cap" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="capGradFooter" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5b7cfa" />
                    <stop offset="100%" stopColor="#6c5ce7" />
                  </linearGradient>
                </defs>
                <path d="M24 6L4 14l20 8 20-8-20-8z" fill="url(#capGradFooter)"/>
                <path d="M10 22v6c0 2 7 6 14 6s14-4 14-6v-6l-14 6-14-6z" fill="#e6e9ff"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">EduPayChain</span>
            </div>
            <p className="text-gray-600 mb-4">
              Decentralized University Fee Payment Platform
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
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