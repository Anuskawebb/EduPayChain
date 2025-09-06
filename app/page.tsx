'use client';

import React, { useState, useEffect, useRef } from 'react';
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

// Typing animation component
const TypingAnimation: React.FC<{ text: string; speed?: number }> = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className="inline-block">
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// Scroll animation hook
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible] as const;
};

const LandingPage: React.FC = () => {
  const { isConnected } = useWallet();
  const [featuresRef, featuresVisible] = useScrollAnimation();
  const [howItWorksRef, howItWorksVisible] = useScrollAnimation();
  const [ctaRef, ctaVisible] = useScrollAnimation();

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
        {/* Additional floating elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-300/20 rounded-full blur-xl animate-pulse hidden md:block"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-300/20 rounded-full blur-xl animate-pulse hidden md:block" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-16 h-16 bg-indigo-300/20 rounded-full blur-xl animate-pulse hidden md:block" style={{animationDelay: '4s'}}></div>
        
        <div className="max-w-7xl mx-auto w-full">
          <div className="px-4 sm:px-6 md:px-10 lg:px-14 py-8 sm:py-14 md:py-20 text-center">
            <h1 className="heading-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl mb-4 sm:mb-6">
              <span>EduPayChain</span>
              <br />
              <span className="text-lg sm:text-2xl md:text-4xl subheading-muted font-semibold">
                <TypingAnimation text="Decentralized University Fee Payment" speed={80} />
              </span>
            </h1>

            <p className="subheading-muted text-base sm:text-lg md:text-xl mb-6 sm:mb-10 max-w-3xl mx-auto px-4">
              Revolutionizing education payments with blockchain technology. 
              Pay fees securely, receive NFT certificates, and experience 
              transparent university fee management.
            </p>

            <div className="relative z-[1] flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              {!isConnected ? (
                <Link 
                  href="/student/register"
                  className="btn-cta text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 flex items-center space-x-2 w-full sm:w-auto justify-center"
                >
                  <span>Register as Student</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              ) : (
                <Link 
                  href="/student"
                  className="btn-cta text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 flex items-center space-x-2 w-full sm:w-auto justify-center"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              )}
              
              <Link 
                href="/universities"
                className="btn-ghost text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto text-center"
              >
                View Universities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="heading-display text-3xl md:text-4xl mb-4">
              How It Works
            </h2>
            <p className="subheading-muted text-xl max-w-2xl mx-auto">
              Simple steps to complete your university fee payment and receive your certificate.
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="relative px-8 md:px-0">
              {/* Central line */}
              <div className="timeline-line absolute left-1/2 transform -translate-x-1/2 w-1 h-full rounded-full hidden md:block"></div>
              
              {/* Mobile timeline line */}
              <div className="timeline-line absolute left-8 w-1 h-full rounded-full md:hidden"></div>
              
              {/* Steps */}
              {[
                {
                  step: 1,
                  title: "Connect Wallet",
                  description: "Connect your MetaMask wallet to get started",
                  details: "Install MetaMask browser extension and create your wallet. Connect to Sepolia testnet for testing. Your wallet address will be used to identify you as a student and process all blockchain transactions.",
                  side: "left"
                },
                {
                  step: 2,
                  title: "Register as Student",
                  description: "Complete one-time registration to link your wallet",
                  details: "Register your wallet address on the blockchain to receive the STUDENT_ROLE. This one-time process links your identity to the smart contract and enables you to make fee payments and receive certificates.",
                  side: "right"
                },
                {
                  step: 3,
                  title: "Select University",
                  description: "Choose your university and course from the list",
                  details: "Browse through verified universities and their available courses. Each university sets their own fee structure in ERC-20 tokens. Select the course you want to enroll in and view the payment requirements.",
                  side: "left"
                },
                {
                  step: 4,
                  title: "Pay Fees",
                  description: "Pay your fees using ERC-20 tokens securely",
                  details: "Approve the smart contract to spend your ERC-20 tokens, then execute the payment transaction. Your payment is recorded on-chain with metadata including your name, course, and university. The transaction is transparent and verifiable by anyone.",
                  side: "right"
                },
                {
                  step: 5,
                  title: "Get Certificate",
                  description: "Receive your NFT certificate after verification",
                  details: "Once your payment is verified by the university admin, an NFT certificate is minted to your wallet. This certificate contains your course details, completion date, and is permanently stored on the blockchain. You can view and transfer your certificate anytime.",
                  side: "left"
                }
              ].map((stepData, index) => (
                <div key={stepData.step} className="relative mb-16 group">
                  {/* Step circle - positioned in center initially, moves on group hover */}
                  <div className={`step-number-circle absolute top-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl z-20 shadow-lg left-8 -translate-x-8 md:left-1/2 md:-translate-x-8 ${
                    stepData.side === 'left' 
                      ? 'group-hover:left-0 group-hover:translate-x-2' 
                      : 'group-hover:left-full group-hover:-translate-x-18'
                  }`}>
                    {stepData.step}
                  </div>
                  
                  {/* Content */}
                  <div className={`flex ${stepData.side === 'left' ? 'justify-start' : 'justify-end'} md:${stepData.side === 'left' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-full md:w-2/5 ${stepData.side === 'left' ? 'pl-24 pr-4 md:pr-24 md:pl-0' : 'pr-24 pl-4 md:pl-24 md:pr-0'}`}>
                      <div className="step-card-new p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer relative">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {stepData.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {stepData.description}
                        </p>
                        
                        {/* Hover description card */}
                        <div className={`absolute ${stepData.side === 'left' ? 'left-full ml-4' : 'right-full mr-4'} top-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-30`}>
                          <div className="relative">
                            {/* Arrow pointing to the step */}
                            <div className={`absolute ${stepData.side === 'left' ? '-left-2 top-6' : '-right-2 top-6'} w-0 h-0 ${stepData.side === 'left' ? 'border-t-8 border-b-8 border-r-8' : 'border-t-8 border-b-8 border-l-8'} border-transparent ${stepData.side === 'left' ? 'border-r-white' : 'border-l-white'}`}></div>
                            
                            <h4 className="font-semibold text-gray-900 mb-3">{stepData.title}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {stepData.details}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8 section-wrap">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="heading-display text-3xl md:text-4xl mb-4">
              Why Choose EduPayChain?
            </h2>
            <p className="subheading-muted text-xl max-w-2xl mx-auto">
              Experience the future of education payments with our comprehensive 
              blockchain-based solution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`feature-card p-4 sm:p-6 card-hover transition-all duration-700 ${
                  featuresVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{transitionDelay: `${index * 0.1}s`}}
              >
                <div className="mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="subheading-muted text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 hero-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="heading-display text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="subheading-muted text-lg sm:text-xl mb-6 sm:mb-8">
              Join the future of education payments with EduPayChain.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link 
                href="/student/register"
                className="btn-cta font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg w-full sm:w-auto"
              >
                Start Now
              </Link>
              <Link 
                href="/universities"
                className="btn-ghost font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg w-full sm:w-auto"
              >
                View Universities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-wrap py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <svg className="logo-cap w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="capGradFooter" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5b7cfa" />
                    <stop offset="100%" stopColor="#6c5ce7" />
                  </linearGradient>
                </defs>
                <path d="M24 6L4 14l20 8 20-8-20-8z" fill="url(#capGradFooter)"/>
                <path d="M10 22v6c0 2 7 6 14 6s14-4 14-6v-6l-14 6-14-6z" fill="#e6e9ff"/>
              </svg>
              <span className="text-lg sm:text-xl font-bold text-gray-900">EduPayChain</span>
            </div>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              Decentralized University Fee Payment Platform
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-1 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-600">
              <span>© 2024 EduPayChain</span>
              <span className="hidden sm:inline">•</span>
              <span>Built with Next.js & Ethers.js</span>
              <span className="hidden sm:inline">•</span>
              <span>Powered by Blockchain</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;