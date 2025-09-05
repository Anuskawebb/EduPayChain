'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { contractFunctions, formatEther, generateCertificateMetadata, debugUniversitiesState } from '../../utils/contract';
import { setupNotificationListeners } from '../../utils/notifications';
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

interface University {
  name: string;
  address: string;
  course: string;
  fee: bigint;
}

interface StudentInfo {
  address: string;
  isRegistered: boolean;
  university: string;
  amountPaid: bigint;
  totalAmount: bigint;
  isVerified: boolean;
  isRefunded: boolean;
  certificateTokenId: bigint;
}

const AdminDashboard: React.FC = () => {
  const { isConnected, signer, address, isAdmin } = useWallet();
  const [universities, setUniversities] = useState<University[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Setup notification listeners
  useEffect(() => {
    setupNotificationListeners();
  }, []);

  // Load universities and students
  useEffect(() => {
    const loadData = async () => {
      if (!isConnected || !isAdmin) return;

      try {
        const unis = await contractFunctions.getUniversities();
        setUniversities(unis);
        
        // Start with empty students list - no mock data
        setStudents([]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [isConnected, isAdmin]);

  // Add university
  const handleAddUniversity = async () => {
    if (!signer || !universityName || !universityAddress || !universityCourse || !universityFee) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tx = await contractFunctions.addUniversity(
        universityName,
        universityAddress,
        universityCourse,
        universityFee,
        signer
      );
      
      setSuccess(`University added successfully! Transaction hash: ${tx.hash}. You can now view it in the Universities section.`);
      
      // Reset form
      setUniversityName('');
      setUniversityAddress('');
      setUniversityCourse('');
      setUniversityFee('');
      
      // Debug the current state
      await debugUniversitiesState();
      
      // Reload universities
      const unis = await contractFunctions.getUniversities();
      setUniversities(unis);
      
      console.log('Universities after adding:', unis);
      
      // Dispatch custom event to notify other pages
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('universitiesUpdated'));
      }
    } catch (error) {
      console.error('Error adding university:', error);
      setError(error instanceof Error ? error.message : 'Failed to add university');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove university
  const handleRemoveUniversity = async (universityAddress: string) => {
    if (!signer) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await contractFunctions.removeUniversity(universityAddress, signer);
      setSuccess('University removed successfully! The change will be reflected in the Universities section.');
      
      // Debug the current state
      await debugUniversitiesState();
      
      // Reload universities
      const unis = await contractFunctions.getUniversities();
      setUniversities(unis);
      
      console.log('Universities after removing:', unis);
      
      // Dispatch custom event to notify other pages
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('universitiesUpdated'));
      }
    } catch (error) {
      console.error('Error removing university:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove university');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify and release certificate
  const handleVerifyAndRelease = async () => {
    if (!signer || !selectedStudent || !studentName || !certificateCourse || !certificateUniversity) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await contractFunctions.verifyAndRelease(selectedStudent, certificateUniversity, signer);
      setSuccess('Payment verified and certificate issued successfully!');
      
      // Reset form
      setSelectedStudent('');
      setStudentName('');
      setCertificateCourse('');
      setCertificateUniversity('');
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Refund payment
  const handleRefund = async (studentAddress: string) => {
    if (!signer) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // For demo purposes, we'll use a default university address
      const defaultUniversity = '0x1234567890123456789012345678901234567890';
      await contractFunctions.refund(studentAddress, defaultUniversity, signer);
      setSuccess('Payment refunded successfully!');
    } catch (error) {
      console.error('Error refunding payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to refund payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin
  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-16 w-16 text-blue-500 mx-auto mb-4" />
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
          <h1 className="heading-display text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="subheading-muted">Manage universities, verify payments, and issue certificates</p>
          

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
          {/* Add University Form */}
          <div className="feature-card p-6">
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 text-gray-900">Add University</h2>
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
                disabled={!universityName || !universityAddress || !universityCourse || !universityFee || isLoading}
                className="btn-cta w-full"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Add University'
                )}
              </button>
            </div>
          </div>

          {/* Universities List */}
          <div className="feature-card p-6">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Universities</h2>
            </div>

            <div className="space-y-4">
              {universities.map((university, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{university.name}</h3>
                      <p className="text-sm text-gray-600">{university.course}</p>
                      <p className="text-sm text-gray-500">{university.address}</p>
                      <p className="text-sm font-medium text-blue-500">
                        {formatEther(university.fee)} ETH
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveUniversity(university.address)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {universities.length === 0 && (
                <p className="text-gray-500 text-center py-4">No universities added yet.</p>
              )}
            </div>
          </div>

          {/* Verify and Release Certificate */}
          <div className="feature-card p-6">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Verify & Issue Certificate</h2>
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
                  {students.map((student, index) => (
                    <option key={index} value={student.address}>
                      {student.address.slice(0, 6)}...{student.address.slice(-4)} - {student.university}
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
                disabled={!selectedStudent || !studentName || !certificateCourse || !certificateUniversity || isLoading}
                className="btn-success w-full"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Verify & Issue Certificate'
                )}
              </button>
            </div>
          </div>

          {/* Students List */}
          <div className="feature-card p-6">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Records</h2>
            </div>

            <div className="space-y-4">
              {students.map((student, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.address.slice(0, 6)}...{student.address.slice(-4)}
                      </p>
                      <p className="text-sm text-gray-600">{student.university}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-500">
                        {formatEther(student.amountPaid)} / {formatEther(student.totalAmount)} ETH
                      </p>
                      {student.isVerified ? (
                        <span className="status-verified">Verified</span>
                      ) : student.isRefunded ? (
                        <span className="status-refunded">Refunded</span>
                      ) : (
                        <span className="status-pending">Pending</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!student.isVerified && !student.isRefunded && (
                      <button
                        onClick={() => handleRefund(student.address)}
                        disabled={isLoading}
                        className="btn-danger text-xs px-2 py-1"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {students.length === 0 && (
                <p className="text-gray-500 text-center py-4">No payment records found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 