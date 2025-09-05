'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { contractFunctions, formatEther, isAdmin } from '../../utils/contract';
import { setupNotificationListeners } from '../../utils/notifications';
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

interface University {
  name: string;
  address: string;
  course: string;
  fee: bigint;
}

interface PaymentStatus {
  isRegistered: boolean;
  university: string;
  amountPaid: bigint;
  totalAmount: bigint;
  isVerified: boolean;
  isRefunded: boolean;
  certificateTokenId: bigint;
}

const StudentDashboard: React.FC = () => {
  const { isConnected, signer, address } = useWallet();
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [studentName, setStudentName] = useState('');
  const [course, setCourse] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingTokens, setIsGettingTokens] = useState(false);
  const [certificateMetadata, setCertificateMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);

  // Reset registration state when wallet changes
  useEffect(() => {
    setIsCheckingRegistration(true);
  }, [address]);

  // Check if user is admin
  const userIsAdmin = address ? isAdmin(address) : false;

  // Setup notification listeners
  useEffect(() => {
    setupNotificationListeners();
  }, []);

  // Load universities
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const unis = await contractFunctions.getUniversities();
        setUniversities(unis);
      } catch (error) {
        console.error('Error loading universities:', error);
      }
    };

    if (isConnected) {
      loadUniversities();
    }
  }, [isConnected]);

  // Load student status
  useEffect(() => {
    const loadStudentStatus = async () => {
      if (!address || !isConnected) {
        setIsCheckingRegistration(false);
        return;
      }

      try {
              // Check if student is registered
      const studentInfo = await contractFunctions.getStudentInfo(address);
      console.log('Student registration check:', studentInfo);
      console.log('Student address being checked:', address);
      
      if (!studentInfo.isRegistered) {
        // Student is not registered, show message to register first
        setError('You need to register as a student first. Please visit the registration page or click "Register as Student" below.');
        setIsCheckingRegistration(false);
        return;
      }
      
      // Student is registered, clear any previous errors
      setError(null);

        // Student is registered, now get payment status
        let status = null;
        if (universities.length > 0) {
          try {
            status = await contractFunctions.getStatus(address, universities[0].address);
            console.log('Student status from contract:', status);
          } catch (error) {
            console.log('Could not get status from first university, using default status');
          }
        }
        
        // If no status found, create a default status for registered student
        if (!status) {
          status = {
            isRegistered: true,
            university: '',
            amountPaid: 0n,
            totalAmount: 0n,
            isVerified: false,
            isRefunded: false,
            certificateTokenId: 0n
          };
          console.log('Using default status for registered student');
        }
        
        console.log('Setting payment status:', status);
        setPaymentStatus(status);
      } catch (error) {
        console.error('Error loading student status:', error);
        setError('Error checking registration status. Please try again.');
      } finally {
        setIsCheckingRegistration(false);
      }
    };

    loadStudentStatus();
  }, [address, isConnected, universities]);



  // Load certificate metadata if verified
  useEffect(() => {
    const loadCertificateMetadata = async () => {
      if (paymentStatus?.isVerified && paymentStatus.certificateTokenId > 0n) {
        try {
          const uri = await contractFunctions.getTokenURI(Number(paymentStatus.certificateTokenId));
          const response = await fetch(uri);
          const metadata = await response.json();
          setCertificateMetadata(metadata);
        } catch (error) {
          console.error('Error loading certificate metadata:', error);
        }
      }
    };

    loadCertificateMetadata();
  }, [paymentStatus]);

  // Handle university selection
  const handleUniversitySelect = (universityAddress: string) => {
    setSelectedUniversity(universityAddress);
    const university = universities.find(u => u.address === universityAddress);
    if (university) {
      const feeAmount = formatEther(university.fee);
      setPaymentAmount(feeAmount);
      setCourse(university.course);
      console.log('Selected university fee:', feeAmount, 'ETH');
    } else {
      setPaymentAmount('');
      setCourse('');
    }
  };

  // Pay fees
  const handleRegisterAsStudent = async () => {
    if (!signer || !address) {
      setError('Please connect your wallet first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Registering as student...');
      await contractFunctions.registerAsStudent(signer);
      setSuccess('Successfully registered as student! You can now pay fees.');
      
      // Reload student status
      const studentInfo = await contractFunctions.getStudentInfo(address);
      // Reload payment status for the selected university
      if (selectedUniversity) {
        const status = await contractFunctions.getStatus(address, selectedUniversity);
        setPaymentStatus(status);
      }
    } catch (error: any) {
      console.error('Error registering as student:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to register as student';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetTokens = async () => {
    if (!signer || !address) {
      setError('Please connect your wallet first.');
      return;
    }

    setIsGettingTokens(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Attempting to get tokens...');
      const result = await contractFunctions.getTokens(signer);
      
      if (result.success) {
        setSuccess(`Successfully got ${result.newBalance} ${result.symbol} tokens using ${result.method} function!`);
      } else {
        setError(`Failed to get tokens: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error getting tokens:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to get tokens';
      setError(errorMessage);
    } finally {
      setIsGettingTokens(false);
    }
  };

  const handlePayFees = async () => {
    if (!signer || !address || !selectedUniversity || !studentName || !course) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate payment amount
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if user is admin
      if (userIsAdmin) {
        setError('Admin cannot make student payments. Please use a different wallet address.');
        return;
      }

      console.log('Paying fees with signer:', signer);
      console.log('Payment details:', {
        university: selectedUniversity,
        amount: paymentAmount,
        studentName,
        course
      });

      console.log('Proceeding with payment - registration will be verified by smart contract');

      // Execute the payment transaction
      const paymentTx = await contractFunctions.payFees(selectedUniversity, paymentAmount, studentName, course, signer);
      
      // If we get here, the payment was successful
      console.log('Payment transaction completed successfully:', paymentTx.hash);
      setSuccess('Payment successful! Transaction hash: ' + paymentTx.hash.substring(0, 10) + '...');
      
      // Try to reload status, but don't fail the whole operation if this fails
      try {
        const status = await contractFunctions.getStatus(address, selectedUniversity);
        setPaymentStatus(status);
        console.log('Status reloaded successfully:', status);
      } catch (statusError) {
        console.warn('Failed to reload status after payment, but payment was successful:', statusError);
        // Don't show this as an error to the user since the payment succeeded
      }
    } catch (error: any) {
      console.error('Error paying fees:', error);
      
      // Check if this is a user cancellation
      if (error?.message?.includes('cancelled by user') || 
          error?.message?.includes('user rejected') || 
          error?.message?.includes('User denied')) {
        setError('Transaction was cancelled by user');
      } else {
        // Check if the transaction was actually sent but failed
        if (error?.hash) {
          setError(`Payment transaction failed. Hash: ${error.hash.substring(0, 10)}... Check MetaMask for details.`);
        } else {
          const errorMessage = error?.message || error?.toString() || 'Failed to pay fees';
          setError(errorMessage);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!paymentStatus) return null;

    if (paymentStatus.isRefunded) {
      return <span className="status-refunded">Refunded</span>;
    } else if (paymentStatus.isVerified) {
      return <span className="status-verified">Verified</span>;
    } else if (paymentStatus.amountPaid > 0n) {
      return <span className="status-paid">Partially Paid</span>;
    } else {
      return <span className="status-pending">Pending</span>;
    }
  };

  const getPaymentProgress = () => {
    if (!paymentStatus || !paymentStatus.totalAmount || paymentStatus.totalAmount === 0n) return 0;
    if (!paymentStatus.amountPaid) return 0;
    return Number((paymentStatus.amountPaid * 100n) / paymentStatus.totalAmount);
  };

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
  if (userIsAdmin) {
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

  // Show loading while checking registration
  if (isCheckingRegistration) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="h-8 w-8 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Registration</h2>
            <p className="text-gray-600">Please wait while we verify your student registration...</p>
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
          <h1 className="heading-display text-3xl font-bold mb-2">Student Dashboard</h1>
          <p className="subheading-muted">Pay your university fees and track your payment status</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Registration Section */}
        {error && error.includes('register as a student') && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>You need to register as a student first to pay fees.</span>
              </div>
              <button
                onClick={handleRegisterAsStudent}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Register as Student'
                )}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="feature-card p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Pay Fees</h2>
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
                {(!paymentAmount || parseFloat(paymentAmount) <= 0) && (
                  <p className="text-sm text-red-500 mt-1">
                    Please enter a valid amount greater than 0
                  </p>
                )}
                {selectedUniversity && paymentAmount && parseFloat(paymentAmount) > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Amount is valid
                  </p>
                )}
              </div>

              {/* Get Tokens Button */}
              <button
                onClick={handleGetTokens}
                disabled={isGettingTokens}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full mb-3"
              >
                {isGettingTokens ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Get Tokens (Free)'
                )}
              </button>

              <button
                onClick={handlePayFees}
                disabled={!selectedUniversity || !paymentAmount || parseFloat(paymentAmount) <= 0 || !studentName || isLoading}
                className="btn-cta w-full"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Pay Fees'
                )}
              </button>
              
            </div>
          </div>

          {/* Payment Status */}
          <div className="feature-card p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Status</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                {getStatusBadge() || <span className="status-pending">No Payment</span>}
              </div>

              {paymentStatus?.university && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">University:</span>
                  <span className="font-medium">{paymentStatus.university}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">
                  {paymentStatus && paymentStatus.amountPaid ? formatEther(paymentStatus.amountPaid) : '0'} ETH
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  {paymentStatus && paymentStatus.totalAmount ? formatEther(paymentStatus.totalAmount) : '0'} ETH
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Payment Progress</span>
                  <span>{getPaymentProgress()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getPaymentProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Display */}
          {paymentStatus?.isVerified && certificateMetadata && (
            <div className="feature-card p-6 lg:col-span-2">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Your Certificate</h2>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="bg-primary-100 rounded-lg p-4 mb-4">
                    <Award className="h-12 w-12 text-primary-600 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {certificateMetadata.name}
                  </h3>
                  <p className="text-gray-600">{certificateMetadata.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {certificateMetadata.attributes?.map((attr: any, index: number) => (
                    <div key={index}>
                      <span className="text-gray-500">{attr.trait_type}:</span>
                      <span className="font-medium ml-2">{attr.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <span className="text-xs text-gray-500">
                    Token ID: {paymentStatus.certificateTokenId.toString()}
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