'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useEduPayChain } from '../../../hooks/useEduPayChain';
import { ADMIN_ADDRESS } from '../../../lib/config';
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
  const { address, isConnected } = useAccount();
  const { 
    isAdmin, 
    hasStudentRole, 
    registerAsStudent, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error 
  } = useEduPayChain();
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle registration completion
  useEffect(() => {
    if (isConfirmed) {
      setSuccess('Successfully registered as student! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/student');
      }, 2000);
    }
  }, [isConfirmed, router]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setLocalError(error.message || 'Registration failed');
      setSuccess(null);
    }
  }, [error]);

  const handleRegisterAsStudent = () => {
    setLocalError(null);
    setSuccess(null);
    registerAsStudent();
  };

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

  // If already registered, redirect to dashboard
  if (hasStudentRole) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Registered</h2>
            <p className="text-gray-600 mb-4">
              You are already registered as a student.
            </p>
            <a 
              href="/student"
              className="btn-primary inline-flex items-center"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Wallet className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to register as a student.</p>
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

        {/* Error/Success Messages */}
        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            {localError}
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Student Registration</h3>
                    <p className="text-sm text-blue-700">
                      Register your wallet address as a student to access the payment dashboard.
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
                disabled={isPending || isConfirming}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    {isPending ? 'Confirming...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    Register as Student
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
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
                  <h3 className="text-sm font-medium text-gray-900">Connect Wallet</h3>
                  <p className="text-sm text-gray-600">
                    Connect your MetaMask wallet to the application.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Register as Student</h3>
                  <p className="text-sm text-gray-600">
                    Submit the registration transaction to link your wallet to the student role.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-sm font-medium">3</span>
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
                <li>• Make sure your wallet is connected to Sepolia testnet</li>
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