'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../../contexts/WalletContext';
import { contractFunctions, isAdmin } from '../../../utils/contract';
import { setupNotificationListeners } from '../../../utils/notifications';
import Navigation from '../../../components/Navigation';
import { 
  GraduationCap, 
  User, 
  CheckCircle, 
  XCircle,
  Loader,
  Shield,
  AlertCircle,
  ArrowRight,
  Wallet
} from 'lucide-react';

const StudentRegistration: React.FC = () => {
  const router = useRouter();
  const { isConnected, signer, address, connect } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  const [step, setStep] = useState<'enter-address' | 'connect-wallet' | 'register'>('enter-address');
  const [addressesMatch, setAddressesMatch] = useState(false);

  // Setup notification listeners
  useEffect(() => {
    setupNotificationListeners();
  }, []);

  // Monitor address changes
  useEffect(() => {
    if (address && step === 'register') {
      console.log('Address changed to:', address);
      console.log('Manual address:', manualWalletAddress);
      const match = address.toLowerCase() === manualWalletAddress.toLowerCase();
      console.log('Addresses match:', match);
      setAddressesMatch(match);
    }
  }, [address, step, manualWalletAddress]);

  // Check if user is admin
  const userIsAdmin = address ? isAdmin(address) : false;

  // Handle manual address entry
  const handleAddressSubmit = () => {
    if (!manualWalletAddress || manualWalletAddress.length < 42) {
      setError('Please enter a valid wallet address');
      return;
    }
    
    // Check if it's a valid Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualWalletAddress)) {
      setError('Please enter a valid Ethereum wallet address');
      return;
    }

    setError(null);
    setStep('connect-wallet');
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      console.log('Connecting wallet...');
      console.log('Expected address:', manualWalletAddress);
      await connect();
      console.log('Wallet connected successfully');
      
      // Wait a moment for the wallet context to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Connected address after delay:', address);
      setStep('register');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  // Register as student
  const handleRegisterAsStudent = async () => {
    if (!signer || !address) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('=== Registration Debug Info ===');
      console.log('Manual wallet address:', manualWalletAddress);
      console.log('Connected address:', address);
      console.log('Addresses match:', address?.toLowerCase() === manualWalletAddress.toLowerCase());
      console.log('Registering as student with signer:', signer);
      
      await contractFunctions.registerAsStudent(signer);
      console.log('Registration successful!');
      setSuccess('Successfully registered as student! Redirecting to dashboard...');
      
      // Redirect to student dashboard after successful registration
      setTimeout(() => {
        console.log('Redirecting to student dashboard...');
        router.push('/student');
      }, 2000);
    } catch (error) {
      console.error('Error registering as student:', error);
      setError(error instanceof Error ? error.message : 'Failed to register as student');
    } finally {
      setIsLoading(false);
    }
  };

  // Block admin access
  if (userIsAdmin && step === 'register') {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You are connected with an admin wallet address and cannot register as a student.
            </p>
            <p className="text-sm text-gray-500">
              Please switch to a different wallet address to register as a student.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Registration</h1>
          <p className="text-gray-600">Register as a student to access the payment dashboard</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'enter-address' || step === 'connect-wallet' || step === 'register' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'enter-address' || step === 'connect-wallet' || step === 'register' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="text-sm font-medium">Enter Address</span>
            </div>
            <div className={`w-8 h-1 ${step === 'connect-wallet' || step === 'register' ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step === 'connect-wallet' || step === 'register' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'connect-wallet' || step === 'register' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm font-medium">Connect Wallet</span>
            </div>
            <div className={`w-8 h-1 ${step === 'register' ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${step === 'register' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'register' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="text-sm font-medium">Register</span>
            </div>
          </div>
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
          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <User className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-2xl font-semibold">Register as Student</h2>
            </div>

            <div className="space-y-6">
              {/* Step 1: Enter Wallet Address */}
              {step === 'enter-address' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800 mb-1">Step 1: Enter Your Wallet Address</h3>
                        <p className="text-sm text-blue-700">
                          Please enter the wallet address you want to register as a student. 
                          This should be the address you'll use to pay fees.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualWalletAddress}
                      onChange={(e) => setManualWalletAddress(e.target.value)}
                      placeholder="0x..."
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the Ethereum wallet address you want to register
                    </p>
                  </div>

                  <button
                    onClick={handleAddressSubmit}
                    disabled={!manualWalletAddress || manualWalletAddress.length < 42}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              )}

              {/* Step 2: Connect Wallet */}
              {step === 'connect-wallet' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Wallet className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800 mb-1">Step 2: Connect Your Wallet</h3>
                        <p className="text-sm text-blue-700">
                          Now connect the wallet with address: {manualWalletAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Address
                    </label>
                    <input
                      type="text"
                      value={manualWalletAddress}
                      readOnly
                      className="input-field bg-gray-50"
                    />
                  </div>

                                     <button
                     onClick={handleConnectWallet}
                     className="btn-primary w-full flex items-center justify-center"
                   >
                     <Wallet className="h-4 w-4 mr-2" />
                     Connect Wallet
                   </button>
                   
                   {/* Debug button */}
                   {process.env.NODE_ENV === 'development' && (
                     <div className="space-y-2">
                       <button
                         onClick={() => {
                           console.log('=== Debug Info ===');
                           console.log('Manual address:', manualWalletAddress);
                           console.log('Connected address:', address);
                           console.log('Is connected:', isConnected);
                           console.log('Current step:', step);
                         }}
                         className="w-full px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                       >
                         Debug Info
                       </button>
                       <button
                         onClick={() => {
                           console.log('Force refreshing page...');
                           window.location.reload();
                         }}
                         className="w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                       >
                         Force Refresh
                       </button>
                     </div>
                   )}
                </div>
              )}

              {/* Step 3: Register */}
              {step === 'register' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800 mb-1">Step 3: Complete Registration</h3>
                        <p className="text-sm text-blue-700">
                          Your wallet is connected. Now complete the registration process.
                        </p>
                      </div>
                    </div>
                  </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Connected Address
                     </label>
                     <input
                       type="text"
                       value={address || ''}
                       readOnly
                       className="input-field bg-gray-50"
                     />
                     <p className={`text-xs mt-1 ${addressesMatch ? 'text-green-600' : 'text-red-600'}`}>
                       {addressesMatch ? '✓ Address matches' : '⚠ Address does not match'}
                     </p>
                     {!addressesMatch && (
                       <button
                         onClick={() => {
                           console.log('Refreshing address comparison...');
                           const match = address?.toLowerCase() === manualWalletAddress.toLowerCase();
                           setAddressesMatch(match);
                           console.log('Manual address:', manualWalletAddress);
                           console.log('Connected address:', address);
                           console.log('Match result:', match);
                         }}
                         className="mt-2 w-full px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                       >
                         Refresh Address Check
                       </button>
                     )}
                   </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Network
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Sepolia Testnet</span>
                    </div>
                  </div>

                                     <button
                     onClick={handleRegisterAsStudent}
                     disabled={isLoading || !addressesMatch}
                     className="btn-primary w-full flex items-center justify-center"
                   >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Registering...
                      </>
                    ) : (
                      <>
                        Register as Student
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <GraduationCap className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-2xl font-semibold">Registration Process</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Enter Wallet Address</h3>
                  <p className="text-sm text-gray-600">
                    Provide the Ethereum wallet address you want to register as a student.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Connect Wallet</h3>
                  <p className="text-sm text-gray-600">
                    Connect the same wallet address using MetaMask or your preferred wallet.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Complete Registration</h3>
                  <p className="text-sm text-gray-600">
                    Submit the registration transaction to link your wallet to the student role.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-sm font-medium">4</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Access Dashboard</h3>
                  <p className="text-sm text-gray-600">
                    Once registered, you'll be redirected to the student dashboard to pay fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Important Notes:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Make sure you enter the correct wallet address</li>
                <li>• Connect the same wallet address you entered</li>
                <li>• Ensure you're connected to Sepolia testnet</li>
                <li>• Registration requires a small gas fee</li>
                <li>• This is a one-time process per wallet address</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration; 