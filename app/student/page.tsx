'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { contractFunctions, formatEther } from '../../utils/contract';
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
  Loader
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
  const [isRegistered, setIsRegistered] = useState(false);
  const [certificateMetadata, setCertificateMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      if (!address || !isConnected) return;

      try {
        const status = await contractFunctions.getStatus(address);
        setPaymentStatus(status);
        setIsRegistered(status.isRegistered);
      } catch (error) {
        console.error('Error loading student status:', error);
      }
    };

    loadStudentStatus();
  }, [address, isConnected]);

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
      setPaymentAmount(formatEther(university.fee));
      setCourse(university.course);
    }
  };

  // Register as student
  const handleRegister = async () => {
    if (!signer) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await contractFunctions.registerAsStudent(signer);
      setIsRegistered(true);
      setSuccess('Successfully registered as student!');
    } catch (error) {
      console.error('Error registering:', error);
      setError(error instanceof Error ? error.message : 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  // Pay fees
  const handlePayFees = async () => {
    if (!signer || !selectedUniversity || !paymentAmount) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await contractFunctions.payFees(signer, selectedUniversity, paymentAmount);
      setSuccess('Payment successful! Waiting for verification.');
      
      // Reload status
      const status = await contractFunctions.getStatus(address!);
      setPaymentStatus(status);
    } catch (error) {
      console.error('Error paying fees:', error);
      setError(error instanceof Error ? error.message : 'Failed to pay fees');
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
    if (!paymentStatus || paymentStatus.totalAmount === 0n) return 0;
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

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Manage your university fee payments and certificates</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Section */}
          {!isRegistered && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Register as Student</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Register as a student to start making fee payments.
              </p>
              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Register as Student'
                )}
              </button>
            </div>
          )}

          {/* Payment Form */}
          {isRegistered && (
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
                    {universities.map((university) => (
                      <option key={university.address} value={university.address}>
                        {university.name} - {university.course}
                      </option>
                    ))}
                  </select>
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
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    className="input-field"
                  />
                </div>

                <button
                  onClick={handlePayFees}
                  disabled={!selectedUniversity || !paymentAmount || isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    'Pay Fees'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Payment Status */}
          {paymentStatus && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Payment Status</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge()}
                </div>

                {paymentStatus.university && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">University:</span>
                    <span className="font-medium">{paymentStatus.university}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium">
                    {formatEther(paymentStatus.amountPaid)} ETH
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">
                    {formatEther(paymentStatus.totalAmount)} ETH
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
          )}

          {/* Certificate Display */}
          {paymentStatus?.isVerified && certificateMetadata && (
            <div className="bg-white rounded-xl shadow-lg p-6">
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