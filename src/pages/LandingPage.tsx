import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Shield, 
  Coins, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Search,
  ExternalLink,
  Calendar,
  MapPin,
  Bell,
  PieChart,
  Wallet,
  Users,
  CreditCard,
  Zap,
  Twitter,
  Github,
  Mail,
  Phone
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { formatAddress, getEtherscanUrl, PaymentStatus } from '../utils/contract';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';

const LandingPage: React.FC = () => {
  const { isConnected, account } = useWallet();
  const { contract, tokenAddress } = useContract();
  const [searchAddress, setSearchAddress] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userPayment, setUserPayment] = useState<any>(null);

  // Mock data for upcoming deadlines
  const upcomingDeadlines = [
    {
      university: 'Harvard University',
      dueDate: '2025-02-15',
      amount: '2.5',
      address: '0x742d35Cc6634C0532925a3b8D39865Ea0543c82A'
    },
    {
      university: 'MIT',
      dueDate: '2025-02-20',
      amount: '3.0',
      address: '0x8ba1f109551bD432803012645Bac136c22C57154'
    },
    {
      university: 'Stanford University',
      dueDate: '2025-02-25',
      amount: '2.8',
      address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5'
    }
  ];

  // Mock university data with enhanced info
  const universities = [
    {
      name: 'Harvard University',
      city: 'Cambridge',
      country: 'USA',
      logo: '🏛️',
      address: '0x742d35Cc6634C0532925a3b8D39865Ea0543c82A',
      students: '23,000',
      acceptedTokens: 'EDU, USDC, DAI'
    },
    {
      name: 'MIT',
      city: 'Cambridge',
      country: 'USA',
      logo: '🔬',
      address: '0x8ba1f109551bD432803012645Bac136c22C57154',
      students: '11,500',
      acceptedTokens: 'EDU, USDC'
    },
    {
      name: 'Stanford University',
      city: 'Stanford',
      country: 'USA',
      logo: '🌲',
      address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
      students: '17,000',
      acceptedTokens: 'EDU, USDC, DAI'
    },
    {
      name: 'University of Oxford',
      city: 'Oxford',
      country: 'UK',
      logo: '🎓',
      address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
      students: '24,500',
      acceptedTokens: 'EDU, USDC'
    }
  ];

  // Mock announcements
  const announcements = [
    {
      title: 'Payment Deadline Reminder',
      message: 'Spring semester fee payments are due by February 15th, 2025',
      type: 'warning'
    },
    {
      title: 'New University Partnership',
      message: 'Cambridge University has joined EduPayChain platform',
      type: 'info'
    },
    {
      title: 'Late Fee Notice',
      message: 'Late payment penalties (5%) will apply starting February 16th',
      type: 'error'
    }
  ];

  // Mock payment statistics
  const paymentStats = {
    verified: 70,
    pending: 20,
    refunded: 10
  };

  useEffect(() => {
    if (contract && account && isConnected) {
      fetchUserPayment();
    }
  }, [contract, account, isConnected]);

  const fetchUserPayment = async () => {
    if (!contract || !account) return;

    try {
      const payment = await contract.payments(account);
      if (payment.university !== '0x0000000000000000000000000000000000000000') {
        const status = await contract.getStatus(account);
        setUserPayment({
          university: payment.university,
          amount: ethers.formatEther(payment.amount),
          status: payment.status,
          statusText: status
        });
      }
    } catch (error) {
      console.error('Error fetching user payment:', error);
    }
  };

  const handleSearchStatus = async () => {
    if (!contract || !searchAddress) {
      toast.error('Please enter a wallet address');
      return;
    }

    setIsSearching(true);
    try {
      const status = await contract.getStatus(searchAddress);
      setSearchStatus(status);
      toast.success('Status retrieved successfully');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to retrieve status');
      setSearchStatus('');
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-8">
              <GraduationCap className="h-16 w-16 text-blue-400 mx-auto mb-6" />
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EduPayChain
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
                The future of university fee payments. Pay securely with digital tokens on the blockchain,
                with complete transparency and administrative control.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/student"
                className="group flex items-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Student Dashboard</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/admin"
                className="group flex items-center space-x-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Shield className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-white/70 text-sm">Students</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <GraduationCap className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">200+</div>
              <div className="text-white/70 text-sm">Universities</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <CreditCard className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">$2.5M</div>
              <div className="text-white/70 text-sm">Processed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-white/70 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="px-4 py-12 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Fee Deadlines */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-blue-400" />
                  <span>Upcoming Fee Deadlines</span>
                </h2>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-6 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{deadline.university}</h3>
                        <div className="flex items-center space-x-4 text-sm text-white/70">
                          <span>Due: {formatDate(deadline.dueDate)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            getDaysUntil(deadline.dueDate) <= 7 
                              ? 'bg-red-500/20 text-red-200' 
                              : 'bg-yellow-500/20 text-yellow-200'
                          }`}>
                            {getDaysUntil(deadline.dueDate)} days left
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{deadline.amount} ETH</div>
                        <Link
                          to="/student"
                          className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors mt-2"
                        >
                          <span>Pay Now</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* University Cards */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <GraduationCap className="h-6 w-6 text-purple-400" />
                  <span>Partner Universities</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {universities.map((uni, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 transform hover:scale-105 cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{uni.logo}</div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-1">{uni.name}</h3>
                          <div className="flex items-center space-x-1 text-white/70 text-sm mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{uni.city}, {uni.country}</span>
                          </div>
                          <div className="text-white/60 text-sm mb-3">
                            {uni.students} students
                          </div>
                          <div className="text-xs text-white/50">
                            Accepts: {uni.acceptedTokens}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-8 text-center">How EduPayChain Works</h2>
                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    { icon: Wallet, title: 'Connect Wallet', desc: 'Link your digital wallet to get started' },
                    { icon: GraduationCap, title: 'Choose University', desc: 'Select your institution from our partners' },
                    { icon: Coins, title: 'Pay in Tokens', desc: 'Make secure payments using digital tokens' },
                    { icon: CheckCircle, title: 'Get Verified', desc: 'Admin verifies and releases your payment' }
                  ].map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <step.icon className="h-8 w-8 text-blue-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                      <p className="text-white/70 text-sm">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Search Status */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Check Payment Status</span>
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    placeholder="Enter wallet address..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none text-sm"
                  />
                  <button
                    onClick={handleSearchStatus}
                    disabled={isSearching || !searchAddress}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    {isSearching ? 'Searching...' : 'Search Status'}
                  </button>
                  {searchStatus && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <StatusBadge status={searchStatus} />
                    </div>
                  )}
                </div>
              </div>

              {/* My Payments */}
              {isConnected && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>My Payments</span>
                  </h3>
                  {userPayment ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Amount:</span>
                        <span className="text-white font-medium">{userPayment.amount} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">University:</span>
                        <span className="text-white text-sm">{formatAddress(userPayment.university)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Status:</span>
                        <StatusBadge status={PaymentStatus[userPayment.status as keyof typeof PaymentStatus]} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm">No payments found for your account.</p>
                  )}
                </div>
              )}

              {/* Token Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Coins className="h-5 w-5" />
                  <span>Token Information</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-white/70 text-sm">Token Name:</span>
                    <div className="text-white font-medium">EduPay Token (EDU)</div>
                  </div>
                  {tokenAddress && (
                    <>
                      <div>
                        <span className="text-white/70 text-sm">Contract Address:</span>
                        <div className="text-white font-mono text-sm">{formatAddress(tokenAddress)}</div>
                      </div>
                      <a
                        href={`https://sepolia.etherscan.io/address/${tokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <span>View on Etherscan</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Statistics */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Payment Statistics</span>
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-200">Verified</span>
                      <span className="text-white">{paymentStats.verified}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${paymentStats.verified}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-200">Pending</span>
                      <span className="text-white">{paymentStats.pending}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${paymentStats.pending}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-200">Refunded</span>
                      <span className="text-white">{paymentStats.refunded}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${paymentStats.refunded}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Announcements</span>
                </h3>
                <div className="space-y-4">
                  {announcements.map((announcement, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      announcement.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                      announcement.type === 'error' ? 'bg-red-500/10 border-red-500' :
                      'bg-blue-500/10 border-blue-500'
                    }`}>
                      <h4 className="text-white font-medium text-sm mb-1">{announcement.title}</h4>
                      <p className="text-white/70 text-xs">{announcement.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Having issues with payments or need assistance? Our support team is here to help.
                </p>
                <div className="space-y-2">
                  <a href="mailto:support@edupaychain.xyz" className="flex items-center space-x-2 text-blue-300 hover:text-blue-200 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>support@edupaychain.xyz</span>
                  </a>
                  <a href="tel:+1-555-0123" className="flex items-center space-x-2 text-blue-300 hover:text-blue-200 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>+1 (555) 012-3456</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <GraduationCap className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">EduPayChain</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="https://twitter.com/edupaychain" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com/edupaychain" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm">© 2025 EduPayChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;