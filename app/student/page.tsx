'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useEduPayChain } from '../../hooks/useEduPayChain';
import { uploadToIPFS, generateCertificateMetadata } from '../../lib/ipfs';
import { formatEther, parseEther, type Address } from 'viem';
import { ADMIN_ADDRESS } from '../../lib/config';
import Navigation from '../../components/Navigation';
import { 
  GraduationCap, 
  CreditCard, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  DollarSign,
  Building,
  User,
  BookOpen,
  History,
  Loader,
  Shield
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const {
    isAdmin,
    hasStudentRole,
    tokenAddress,
    getTokenBalance,
    getTokenAllowance,
    getPayment,
    approveTokens,
    payFees,
    getTokensFromFaucet,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  } = useEduPayChain();

  // Mock universities data - in real app, you'd fetch this from contract events or API
  const [universities] = useState([
    {
      name: 'MIT University',
      address: '0x1234567890123456789012345678901234567890' as Address,
      course: 'Computer Science',
      fee: parseEther('0.1')
    },
    {
      name: 'Stanford University', 
      address: '0x2345678901234567890123456789012345678901' as Address,
      course: 'Engineering',
      fee: parseEther('0.15')
    }
  ]);

  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [studentName, setStudentName] = useState('');
  const [course, setCourse] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get user's token balance and allowance
  const { data: tokenBalance } = getTokenBalance(address as Address);
  const { data: tokenAllowance } = getTokenAllowance(address as Address);
  const { data: paymentData } = getPayment(address as Address);

  // Clear messages when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setSuccess('Transaction completed successfully!');
      setLocalError(null);
    }
  }, [isConfirmed]);

  // Handle error display
  useEffect(() => {
    if (error) {
      setLocalError(error.message || 'Transaction failed');
      setSuccess(null);
    }
  }, [error]);

  // Handle university selection
  const handleUniversitySelect = (universityAddress: string) => {
    setSelectedUniversity(universityAddress);
    const university = universities.find(u => u.address === universityAddress);
    if (university) {
      const feeAmount = formatEther(university.fee);
      setPaymentAmount(feeAmount);
      setCourse(university.course);
    } else {
      setPaymentAmount('');
      setCourse('');
    }
  };

  // Get tokens from faucet
  const handleGetTokens = () => {
    setLocalError(null);
    setSuccess(null);
    getTokensFromFaucet();
  };

  // Pay fees with automatic approval
  const handlePayFees = async () => {
    if (!address || !selectedUniversity || !studentName || !course || !paymentAmount) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (parseFloat(paymentAmount) <= 0) {
      setLocalError('Please enter a valid payment amount greater than 0.');
      return;
    }

    setLocalError(null);
    setSuccess(null);

    try {
      if (isAdmin) {
        setLocalError('Admin cannot make student payments. Please use a different wallet address.');
        return;
      }

      const amount = parseEther(paymentAmount);
      
      // Check if user has enough tokens
      if (!tokenBalance || tokenBalance < amount) {
        setLocalError(`Insufficient token balance. You have ${tokenBalance ? formatEther(tokenBalance) : '0'} tokens, but need ${paymentAmount} tokens.`);
        return;
      }
      
      // Check allowance and approve if needed
      if (!tokenAllowance || tokenAllowance < amount) {
        setSuccess('Approving tokens...');
        approveTokens(amount);
        return; // Wait for approval to complete
      }
      
      // Generate metadata and upload to IPFS
      const metadata = generateCertificateMetadata(
        studentName,
        course,
        universities.find(u => u.address === selectedUniversity)?.name || 'Unknown University',
        new Date().toISOString()
      );
      
      setSuccess('Uploading certificate metadata to IPFS...');
      const metadataURI = await uploadToIPFS(metadata);
      
      // Pay fees
      setSuccess('Processing payment...');
      payFees(selectedUniversity as Address, amount, metadataURI);
      
    } catch (error: any) {
      console.error('Error in payment flow:', error);
      setLocalError(error.message || 'Payment failed');
    }
  };

  // Effect to handle approval completion
  useEffect(() => {
    if (isConfirmed && hash && tokenAllowance && selectedUniversity && paymentAmount) {
      const amount = parseEther(paymentAmount);
      if (tokenAllowance >= amount) {
        // Approval completed, now pay fees
        handlePayFees();
      }
    }
  }, [isConfirmed, hash, tokenAllowance]);

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <GraduationCap className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to access the student dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Block admin access
  if (isAdmin) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You are connected with an admin wallet address and cannot access the student dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Please switch to a different wallet address to access student features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show registration prompt if not registered
  if (!hasStudentRole) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Required</h2>
            <p className="text-gray-600 mb-4">
              You need to register as a student first to access the payment dashboard.
            </p>
            <a 
              href="/student/register"
              className="btn-primary inline-flex items-center"
            >
              Register as Student
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Pay your university fees and track your payment status</p>
        </div>

        {/* Error and Success Messages */}
        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {localError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold">Pay Fees</h2>
            </div>

              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => handleUniversitySelect(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a university</option>
                  {universities.length === 0 ? (
                    <option value="" disabled>No universities available</option>
                  ) : (
                    universities.map((university) => (
                      <option key={university.address} value={university.address}>
                        {university.name} - {university.course}
                      </option>
                    ))
                  )}
                </select>
                {universities.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No universities have been added yet. Please contact the admin.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Course name"
                  className="input-field"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (ETH) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  min="0.01"
                  className={`input-field ${!paymentAmount || parseFloat(paymentAmount) <= 0 ? 'border-red-300 focus:border-red-500' : ''}`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Balance: {tokenBalance ? formatEther(tokenBalance) : '0'} tokens
                </div>
              </div>

              {/* Get Tokens Button */}
              <button
                onClick={handleGetTokens}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full mb-3"
              >
                {isPending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Get Tokens (Free)'
                )}
              </button>

              <button
                onClick={handlePayFees}
                disabled={!selectedUniversity || !paymentAmount || parseFloat(paymentAmount) <= 0 || !studentName || isPending || isConfirming}
                className="btn-primary w-full"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    {isPending ? 'Confirming...' : 'Processing...'}
                  </>
                ) : (
                  'Pay Fees'
                )}
              </button>
              
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold">Payment Status</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="status-pending">
                  {paymentData?.status === 1 ? 'Verified' : 
                   paymentData?.status === 2 ? 'Refunded' :
                   paymentData?.amount > 0n ? 'Pending' : 'No Payment'}
                </span>
              </div>

              {paymentData?.university && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">University:</span>
                  <span className="font-medium">{paymentData.university}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">
                  {paymentData?.paidAmount ? formatEther(paymentData.paidAmount) : '0'} ETH
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  {paymentData?.amount ? formatEther(paymentData.amount) : '0'} ETH
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Payment Progress</span>
                  <span>
                    {paymentData?.amount && paymentData?.paidAmount 
                      ? Math.round(Number((paymentData.paidAmount * 100n) / paymentData.amount))
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${paymentData?.amount && paymentData?.paidAmount 
                        ? Math.round(Number((paymentData.paidAmount * 100n) / paymentData.amount))
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Display */}
          {paymentData?.status === 1 && (
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Your Certificate</h2>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="bg-primary-100 rounded-lg p-4 mb-4">
                    <Award className="h-12 w-12 text-primary-600 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Certificate - {studentName}
                  </h3>
                  <p className="text-gray-600">Certificate for {course}</p>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-xs text-gray-500">
                    Certificate verified and issued
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 