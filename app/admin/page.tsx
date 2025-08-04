'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useEduPayChain } from '../../hooks/useEduPayChain';
import { formatEther, type Address } from 'viem';
import Navigation from '../../components/Navigation';
import { 
  Shield, 
  Building, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Award,
  RefreshCw,
  Loader,
  GraduationCap,
  DollarSign
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const {
    isAdmin,
    addUniversity,
    removeUniversity,
    verifyAndRelease,
    refund,
    eventLogs,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    formatEther
  } = useEduPayChain();

  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // University form state
  const [universityName, setUniversityName] = useState('');
  const [universityAddress, setUniversityAddress] = useState('');
  const [universityCourse, setUniversityCourse] = useState('');
  const [universityFee, setUniversityFee] = useState('');

  // Certificate form state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentName, setStudentName] = useState('');
  const [certificateCourse, setCertificateCourse] = useState('');
  const [certificateUniversity, setCertificateUniversity] = useState('');

  // Handle transaction completion
  useEffect(() => {
    if (isConfirmed) {
      setSuccess('Transaction completed successfully!');
      setLocalError(null);
      // Reset forms
      setUniversityName('');
      setUniversityAddress('');
      setUniversityCourse('');
      setUniversityFee('');
      setSelectedStudent('');
      setStudentName('');
      setCertificateCourse('');
      setCertificateUniversity('');
    }
  }, [isConfirmed]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setLocalError(error.message || 'Transaction failed');
      setSuccess(null);
    }
  }, [error]);

  // Add university
  const handleAddUniversity = () => {
    if (!universityName || !universityAddress || !universityCourse || !universityFee) {
      setLocalError('Please fill in all fields');
      return;
    }

    setLocalError(null);
    setSuccess(null);
    addUniversity(universityAddress as Address, universityName, universityCourse, universityFee);
  };

  // Remove university
  const handleRemoveUniversity = (universityAddr: string) => {
    setLocalError(null);
    setSuccess(null);
    removeUniversity(universityAddr as Address);
  };

  // Verify and release certificate
  const handleVerifyAndRelease = () => {
    if (!selectedStudent) {
      setLocalError('Please select a student');
      return;
    }

    setLocalError(null);
    setSuccess(null);
    verifyAndRelease(selectedStudent as Address);
  };

  // Refund payment
  const handleRefund = (studentAddress: string) => {
    setLocalError(null);
    setSuccess(null);
    refund(studentAddress as Address);
  };

  // Check if user is admin
  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to access the admin dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage universities, verify payments, and issue certificates</p>
          

        </div>

        {/* Event Logs Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <RefreshCw className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold">Recent Events</h2>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {eventLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No events detected yet. Events will appear here in real-time.
              </p>
            ) : (
              eventLogs.slice(-10).reverse().map((event, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === 'UniversityAdded' ? 'bg-green-100 text-green-800' :
                        event.type === 'UniversityRemoved' ? 'bg-red-100 text-red-800' :
                        event.type === 'PaymentMade' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'PaymentVerified' ? 'bg-purple-100 text-purple-800' :
                        event.type === 'CertificateIssued' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.type}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.type === 'UniversityAdded' && `University "${event.name}" added`}
                        {event.type === 'UniversityRemoved' && `University removed`}
                        {event.type === 'PaymentMade' && `Payment of ${formatEther(event.amount)} ETH made`}
                        {event.type === 'PaymentVerified' && `Payment of ${formatEther(event.amount)} ETH verified`}
                        {event.type === 'CertificateIssued' && `Certificate #${event.tokenId.toString()} issued`}
                      </p>
                      {event.university && (
                        <p className="text-xs text-gray-400">
                          {event.university.slice(0, 6)}...{event.university.slice(-4)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
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
          {/* Add University Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold">Add University</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University Name
                </label>
                <input
                  type="text"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  placeholder="Enter university name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University Address
                </label>
                <input
                  type="text"
                  value={universityAddress}
                  onChange={(e) => setUniversityAddress(e.target.value)}
                  placeholder="0x..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <input
                  type="text"
                  value={universityCourse}
                  onChange={(e) => setUniversityCourse(e.target.value)}
                  placeholder="Enter course name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee (ETH)
                </label>
                <input
                  type="number"
                  value={universityFee}
                  onChange={(e) => setUniversityFee(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  className="input-field"
                />
              </div>

              <button
                onClick={handleAddUniversity}
                disabled={!universityName || !universityAddress || !universityCourse || !universityFee || isPending || isConfirming}
                className="btn-primary w-full"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    {isPending ? 'Confirming...' : 'Processing...'}
                  </>
                ) : (
                  'Add University'
                )}
              </button>
            </div>
          </div>

          {/* Universities List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold">Universities</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-500 text-center py-4">
                Universities will appear here after being added. Check the Universities page to view all added universities.
              </p>
            </div>
          </div>

          {/* Verify and Release Certificate */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold">Verify & Issue Certificate</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Address
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a student</option>
                  <option value="0x1234567890123456789012345678901234567890">
                    0x1234...7890 - Sample Student
                  </option>
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
                  placeholder="Enter student name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <input
                  type="text"
                  value={certificateCourse}
                  onChange={(e) => setCertificateCourse(e.target.value)}
                  placeholder="Enter course name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University
                </label>
                <input
                  type="text"
                  value={certificateUniversity}
                  onChange={(e) => setCertificateUniversity(e.target.value)}
                  placeholder="Enter university name"
                  className="input-field"
                />
              </div>

              <button
                onClick={handleVerifyAndRelease}
                disabled={!selectedStudent || isPending || isConfirming}
                className="btn-success w-full"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    {isPending ? 'Confirming...' : 'Processing...'}
                  </>
                ) : (
                  'Verify & Issue Certificate'
                )}
              </button>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold">Payment Records</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-500 text-center py-4">
                Payment records will appear here when students make payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 