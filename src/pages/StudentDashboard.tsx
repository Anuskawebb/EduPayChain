import React, { useState, useEffect } from 'react';
import { User, Send, RefreshCw, ExternalLink } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { DUMMY_UNIVERSITIES, formatAddress, getEtherscanUrl, PaymentStatus } from '../utils/contract';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

interface PaymentInfo {
  student: string;
  university: string;
  amount: string;
  status: number;
}

const StudentDashboard: React.FC = () => {
  const { isConnected, account, checkNetwork } = useWallet();
  const { contract, tokenAddress } = useContract();
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (contract && account) {
      fetchPaymentInfo();
    }
  }, [contract, account]);

  const fetchPaymentInfo = async () => {
    if (!contract || !account) return;

    setIsRefreshing(true);
    try {
      const payment = await contract.payments(account);
      
      // Check if payment exists (university is not zero address)
      if (payment.university === '0x0000000000000000000000000000000000000000') {
        setPaymentInfo(null);
        setPaymentStatus('');
        return;
      }
      
      const status = await contract.getStatus(account);
      
      setPaymentInfo({
        student: payment.student,
        university: payment.university,
        amount: ethers.formatEther(payment.amount),
        status: payment.status
      });
      setPaymentStatus(status);
    } catch (error) {
      console.error('Error fetching payment info:', error);
      setPaymentInfo(null);
      setPaymentStatus('');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePayFees = async () => {
    if (!contract || !account || !selectedUniversity || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) return;

    setIsLoading(true);
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.payFees(selectedUniversity, amountWei);
      
      toast.loading('Processing payment...', { id: 'payment' });
      const receipt = await tx.wait();
      
      toast.success(
        <div className="flex flex-col space-y-1">
          <span>Payment successful!</span>
          <a 
            href={getEtherscanUrl(receipt.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
          >
            <span>View transaction</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>,
        { id: 'payment', duration: 8000 }
      );

      // Reset form and refresh data
      setAmount('');
      setSelectedUniversity('');
      await fetchPaymentInfo();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.reason || 'Payment failed', { id: 'payment' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
          <User className="h-16 w-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-white/80">
            Please connect your MetaMask wallet to access the student dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <User className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Student Dashboard</h1>
          <p className="text-white/80">Make fee payments and track your transaction status</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Make Payment</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Select University
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none"
                >
                  <option value="" className="bg-gray-800">Select a university...</option>
                  {DUMMY_UNIVERSITIES.map((uni) => (
                    <option key={uni.address} value={uni.address} className="bg-gray-800">
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none"
                />
              </div>

              {tokenAddress && (
                <div className="bg-blue-600/20 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    <span className="font-medium">Token Contract:</span> {formatAddress(tokenAddress)}
                  </p>
                </div>
              )}

              <button
                onClick={handlePayFees}
                disabled={isLoading || !selectedUniversity || !amount}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Pay Fees</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Payment Status</h2>
              <button
                onClick={fetchPaymentInfo}
                disabled={isRefreshing}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {paymentInfo && paymentInfo.university !== '0x0000000000000000000000000000000000000000' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Status:</span>
                  <StatusBadge status={PaymentStatus[paymentInfo.status as keyof typeof PaymentStatus]} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Amount:</span>
                  <span className="text-white font-medium">{paymentInfo.amount} ETH</span>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <span className="text-white/80">University:</span>
                  <span className="text-white font-mono text-sm">{formatAddress(paymentInfo.university)}</span>
                </div>

                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <p className="text-white/90 text-sm">
                    {paymentStatus === 'Pending' && 'Your payment is awaiting verification by the university.'}
                    {paymentStatus === 'Verified' && 'Your payment has been verified and released to the university.'}
                    {paymentStatus === 'Refunded' && 'Your payment has been refunded back to your account.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">No payment found for your account.</p>
                <p className="text-white/40 text-sm mt-2">Make your first payment to see status here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;