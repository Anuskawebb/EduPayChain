import React, { useState } from 'react';
import { Shield, Users, Plus, Minus, RefreshCw, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { formatAddress, getEtherscanUrl, PaymentStatus } from '../utils/contract';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

interface StudentPayment {
  student: string;
  university: string;
  amount: string;
  status: number;
  statusText: string;
}

const AdminDashboard: React.FC = () => {
  const { isConnected, account, checkNetwork } = useWallet();
  const { contract, isAdmin, adminAddress } = useContract();
  const [studentAddress, setStudentAddress] = useState('');
  const [universityAddress, setUniversityAddress] = useState('');
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [studentPayment, setStudentPayment] = useState<StudentPayment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string>('');

  const fetchStudentPayment = async () => {
    if (!contract || !studentAddress) {
      toast.error('Please enter a student address');
      return;
    }

    setIsLoading(true);
    try {
      const payment = await contract.payments(studentAddress);
      const status = await contract.getStatus(studentAddress);
      
      if (payment.university === '0x0000000000000000000000000000000000000000') {
        setStudentPayment(null);
        toast.info('No payment found for this address');
      } else {
        setStudentPayment({
          student: payment.student,
          university: payment.university,
          amount: ethers.formatEther(payment.amount),
          status: payment.status,
          statusText: status
        });
      }
    } catch (error) {
      console.error('Error fetching student payment:', error);
      toast.error('Failed to fetch payment information');
      setStudentPayment(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRelease = async () => {
    if (!contract || !studentAddress) return;

    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) return;

    setLoadingAction('verify');
    try {
      const tx = await contract.verifyAndRelease(studentAddress);
      toast.loading('Verifying and releasing payment...', { id: 'verify' });
      
      const receipt = await tx.wait();
      toast.success('Payment verified and released successfully!', { id: 'verify' });
      
      await fetchStudentPayment();
    } catch (error: any) {
      console.error('Verify error:', error);
      toast.error(error.reason || 'Failed to verify payment', { id: 'verify' });
    } finally {
      setLoadingAction('');
    }
  };

  const handleRefund = async () => {
    if (!contract || !studentAddress) return;

    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) return;

    setLoadingAction('refund');
    try {
      const tx = await contract.refund(studentAddress);
      toast.loading('Processing refund...', { id: 'refund' });
      
      const receipt = await tx.wait();
      toast.success('Payment refunded successfully!', { id: 'refund' });
      
      await fetchStudentPayment();
    } catch (error: any) {
      console.error('Refund error:', error);
      toast.error(error.reason || 'Failed to process refund', { id: 'refund' });
    } finally {
      setLoadingAction('');
    }
  };

  const handleAddUniversity = async () => {
    if (!contract || !universityAddress) {
      toast.error('Please enter a university address');
      return;
    }

    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) return;

    setLoadingAction('addUni');
    try {
      const tx = await contract.addUniversity(universityAddress);
      toast.loading('Adding university...', { id: 'addUni' });
      
      const receipt = await tx.wait();
      toast.success('University added successfully!', { id: 'addUni' });
      
      setUniversityAddress('');
    } catch (error: any) {
      console.error('Add university error:', error);
      toast.error(error.reason || 'Failed to add university', { id: 'addUni' });
    } finally {
      setLoadingAction('');
    }
  };

  const handleRemoveUniversity = async () => {
    if (!contract || !universityAddress) {
      toast.error('Please enter a university address');
      return;
    }

    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) return;

    setLoadingAction('removeUni');
    try {
      const tx = await contract.removeUniversity(universityAddress);
      toast.loading('Removing university...', { id: 'removeUni' });
      
      const receipt = await tx.wait();
      toast.success('University removed successfully!', { id: 'removeUni' });
      
      setUniversityAddress('');
    } catch (error: any) {
      console.error('Remove university error:', error);
      toast.error(error.reason || 'Failed to remove university', { id: 'removeUni' });
    } finally {
      setLoadingAction('');
    }
  };

  const handleChangeAdmin = async () => {
    if (!contract || !newAdminAddress) {
      toast.error('Please enter a new admin address');
      return;
    }

    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) return;

    setLoadingAction('changeAdmin');
    try {
      const tx = await contract.changeAdmin(newAdminAddress);
      toast.loading('Changing admin...', { id: 'changeAdmin' });
      
      const receipt = await tx.wait();
      toast.success('Admin changed successfully!', { id: 'changeAdmin' });
      
      setNewAdminAddress('');
    } catch (error: any) {
      console.error('Change admin error:', error);
      toast.error(error.reason || 'Failed to change admin', { id: 'changeAdmin' });
    } finally {
      setLoadingAction('');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
          <Shield className="h-16 w-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-white/80">
            Please connect your MetaMask wallet to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/80 mb-4">
            Only the contract admin can access this dashboard.
          </p>
          {adminAddress && (
            <p className="text-white/60 text-sm">
              Current admin: {formatAddress(adminAddress)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/80">Manage payments, universities, and system administration</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Student Payment Management */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Student Payment Management</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Student Address
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none"
                  />
                  <button
                    onClick={fetchStudentPayment}
                    disabled={isLoading}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {studentPayment && (
                <div className="bg-white/5 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Status:</span>
                    <StatusBadge status={PaymentStatus[studentPayment.status as keyof typeof PaymentStatus]} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Amount:</span>
                    <span className="text-white font-medium">{studentPayment.amount} ETH</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="text-white/80">University:</span>
                    <span className="text-white font-mono text-sm">{formatAddress(studentPayment.university)}</span>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleVerifyAndRelease}
                      disabled={loadingAction === 'verify' || studentPayment.status !== 0}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {loadingAction === 'verify' ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Verify</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleRefund}
                      disabled={loadingAction === 'refund' || studentPayment.status !== 0}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {loadingAction === 'refund' ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Refund</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* University Management */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <span>System Management</span>
            </h2>
            
            <div className="space-y-8">
              {/* University Management */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">University Management</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={universityAddress}
                    onChange={(e) => setUniversityAddress(e.target.value)}
                    placeholder="University address (0x...)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none"
                  />
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddUniversity}
                      disabled={loadingAction === 'addUni' || !universityAddress}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {loadingAction === 'addUni' ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleRemoveUniversity}
                      disabled={loadingAction === 'removeUni' || !universityAddress}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {loadingAction === 'removeUni' ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <Minus className="h-4 w-4" />
                          <span>Remove</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Management */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Admin Management</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newAdminAddress}
                    onChange={(e) => setNewAdminAddress(e.target.value)}
                    placeholder="New admin address (0x...)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none"
                  />
                  
                  <button
                    onClick={handleChangeAdmin}
                    disabled={loadingAction === 'changeAdmin' || !newAdminAddress}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {loadingAction === 'changeAdmin' ? (
                      <LoadingSpinner size="sm" text="" />
                    ) : (
                      <>
                        <Settings className="h-4 w-4" />
                        <span>Change Admin</span>
                      </>
                    )}
                  </button>
                  
                  <div className="bg-yellow-600/20 rounded-lg p-4">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ Changing admin will transfer all administrative privileges to the new address.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;