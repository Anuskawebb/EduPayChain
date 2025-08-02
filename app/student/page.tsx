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
  const [certificateMetadata, setCertificateMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasRegisteredThisSession, setHasRegisteredThisSession] = useState(false);
  const [showRegistrationSection, setShowRegistrationSection] = useState(true);

  // Reset registration state when wallet changes
  useEffect(() => {
    setShowRegistrationSection(true);
    setHasRegisteredThisSession(false);
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
      if (!address || !isConnected) return;

      // Add a small delay to prevent interference with registration section
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        // Try to get status from the first available university, or use a default
        let status = null;
        if (universities.length > 0) {
          try {
            status = await contractFunctions.getStatus(address, universities[0].address);
            console.log('Student status from contract:', status);
          } catch (error) {
            console.log('Could not get status from first university, using default unregistered status');
          }
        }
        
        // If no status found, create a default unregistered status
        if (!status) {
          status = {
            isRegistered: false,
            university: '',
            amountPaid: 0n,
            totalAmount: 0n,
            isVerified: false,
            isRefunded: false,
            certificateTokenId: 0n
          };
          console.log('Using default unregistered status');
        }
        
        console.log('Setting payment status:', status);
        setPaymentStatus(status);
      } catch (error) {
        console.error('Error loading student status:', error);
        // Set default unregistered status on error
        const defaultStatus = {
          isRegistered: false,
          university: '',
          amountPaid: 0n,
          totalAmount: 0n,
          isVerified: false,
          isRefunded: false,
          certificateTokenId: 0n
        };
        console.log('Setting default status due to error:', defaultStatus);
        setPaymentStatus(defaultStatus);
      }
    };

    loadStudentStatus();
  }, [address, isConnected, universities]);

  // Register as student if not already registered
  const handleRegisterAsStudent = async () => {
    if (!signer || !address) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Registering as student with signer:', signer);
      await contractFunctions.registerAsStudent(signer);
      setSuccess('Successfully registered as student!');
      setHasRegisteredThisSession(true);
      setShowRegistrationSection(false);
      
      // Reload student status after successful registration
      const loadStudentStatus = async () => {
        if (!address || !isConnected) return;

        try {
          let status = null;
          if (universities.length > 0) {
            try {
              status = await contractFunctions.getStatus(address, universities[0].address);
            } catch (error) {
              console.log('Could not get status from first university');
            }
          }
          
          if (!status) {
            status = {
              isRegistered: true, // Now registered
              university: '',
              amountPaid: 0n,
              totalAmount: 0n,
              isVerified: false,
              isRefunded: false,
              certificateTokenId: 0n
            };
          }
          
          setPaymentStatus(status);
        } catch (error) {
          console.error('Error reloading student status:', error);
        }
      };

      loadStudentStatus();
    } catch (error) {
      console.error('Error registering as student:', error);
      setError(error instanceof Error ? error.message : 'Failed to register as student');
    } finally {
      setIsLoading(false);
    }
  };

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

      // Check if student is registered first
      if (!paymentStatus?.isRegistered) {
        setError('Please register as a student first before paying fees. Click "Register as Student" above.');
        return;
      }

      // Double-check registration with contract
      try {
        const studentAddress = await signer.getAddress();
        console.log('Verifying student registration for address:', studentAddress);
        
        // Try to call a read-only function to check if student exists
        const status = await contractFunctions.getStatus(studentAddress, selectedUniversity);
        console.log('Student status from contract:', status);
      } catch (error) {
        console.log('Student not found in contract, registration may have failed');
        setError('Student registration verification failed. Please try registering again.');
        return;
      }

      await contractFunctions.payFees(selectedUniversity, paymentAmount, studentName, course, signer);
      setSuccess('Payment successful! Waiting for verification.');
      
      // Reload status
      const status = await contractFunctions.getStatus(address, selectedUniversity);
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

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Pay your university fees and track your payment status</p>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <div className="text-sm">
              <strong>Debug Info:</strong>
              <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
              <div>Signer: {signer ? 'Available' : 'Not Available'}</div>
              <div>Address: {address || 'Not Connected'}</div>
              <div>Is Admin: {userIsAdmin ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

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
          {/* Student Registration */}
          {showRegistrationSection && !hasRegisteredThisSession && (
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold">Student Registration</h2>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You need to register as a student before you can pay fees.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 mb-2">
                    Debug: paymentStatus={paymentStatus ? 'exists' : 'null'}, 
                    isRegistered={paymentStatus?.isRegistered ? 'true' : 'false'}, 
                    hasRegisteredThisSession={hasRegisteredThisSession ? 'true' : 'false'},
                    showRegistrationSection={showRegistrationSection ? 'true' : 'false'}
                  </div>
                )}
                <button
                  onClick={handleRegisterAsStudent}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    'Register as Student'
                  )}
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowRegistrationSection(true)}
                      className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Force Show Registration
                    </button>
                    <button
                      onClick={async () => {
                        if (signer) {
                          const address = await signer.getAddress();
                          console.log('Testing registration for:', address);
                          try {
                            const status = await contractFunctions.getStatus(address, universities[0]?.address || '');
                            console.log('Registration test result:', status);
                          } catch (error) {
                            console.log('Registration test error:', error);
                          }
                        }
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Test Registration Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Form */}
          {paymentStatus?.isRegistered && (
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

              <button
                onClick={handlePayFees}
                disabled={!selectedUniversity || !paymentAmount || parseFloat(paymentAmount) <= 0 || !studentName || isLoading}
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold">Payment Status</h2>
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