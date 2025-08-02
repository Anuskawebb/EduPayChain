'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { contractFunctions, formatEther, isAdmin, debugUniversitiesState, testAddUniversity, setupUniversityEventListeners } from '../../utils/contract';
import Navigation from '../../components/Navigation';
import { 
  GraduationCap, 
  Building, 
  BookOpen, 
  DollarSign, 
  MapPin, 
  Loader,
  Plus,
  RefreshCw
} from 'lucide-react';

interface University {
  name: string;
  address: string;
  course: string;
  fee: bigint;
}

const UniversitiesPage: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if user is admin
  const userIsAdmin = address ? isAdmin(address) : false;

  // Manual refresh function
  const handleRefresh = async () => {
    if (!isConnected) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Debug the current state
      await debugUniversitiesState();
      
      const unis = await contractFunctions.getUniversities();
      setUniversities(unis);
      
      console.log('Universities after refresh:', unis);
    } catch (error) {
      console.error('Error refreshing universities:', error);
      setError('Failed to refresh universities');
    } finally {
      setIsLoading(false);
    }
  };

  // Load universities
  useEffect(() => {
    const loadUniversities = async () => {
      if (!isConnected) return;

      try {
        setIsLoading(true);
        
        // Debug the current state
        await debugUniversitiesState();
        
        const unis = await contractFunctions.getUniversities();
        setUniversities(unis);
        
        console.log('Universities loaded:', unis);
      } catch (error) {
        console.error('Error loading universities:', error);
        setError('Failed to load universities');
      } finally {
        setIsLoading(false);
      }
    };

    loadUniversities();

    // Setup smart contract event listeners
    setupUniversityEventListeners(loadUniversities);

    // Listen for custom event when universities are updated
    const handleUniversitiesUpdated = () => {
      loadUniversities();
    };

    window.addEventListener('universitiesUpdated', handleUniversitiesUpdated);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('universitiesUpdated', handleUniversitiesUpdated);
    };
  }, [isConnected, refreshKey]);

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <GraduationCap className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to view universities.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Universities</h1>
            <p className="text-gray-600">Browse approved universities and their course offerings</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="btn-secondary flex items-center"
              title="Refresh universities list"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            {userIsAdmin && (
              <button
                onClick={testAddUniversity}
                className="btn-primary flex items-center"
                title="Add test university"
              >
                <Plus className="h-4 w-4 mr-2" />
                Test Add
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading universities...</span>
          </div>
        )}

        {/* Universities Grid */}
        {!isLoading && (
          <div>
            {universities.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Universities Available</h3>
                <p className="text-gray-500 mb-4">
                  No universities have been added to the system yet.
                </p>
                {userIsAdmin && (
                  <p className="text-sm text-gray-400">
                    Use the Admin Dashboard to add universities.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {universities.map((university, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6 card-hover"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <Building className="h-8 w-8 text-primary-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {university.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {university.address.slice(0, 6)}...{university.address.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>{university.course}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="font-medium text-primary-600">
                          {formatEther(university.fee)} ETH
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Blockchain Verified</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Course Duration: 4 Years
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && universities.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Universities Found</h3>
            <p className="text-gray-600">
              {userIsAdmin 
                ? 'Add universities through the admin dashboard to get started.'
                : 'No universities have been added yet. Please check back later.'
              }
            </p>
            {userIsAdmin && (
              <div className="mt-4">
                <a 
                  href="/admin"
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add University
                </a>
              </div>
            )}
          </div>
        )}

        {/* Stats Section */}
        {universities.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {universities.length}
                </div>
                <div className="text-sm text-gray-600">Total Universities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {universities.length}
                </div>
                <div className="text-sm text-gray-600">Active Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {universities.reduce((total, uni) => total + uni.fee, BigInt(0)).toString()}
                </div>
                <div className="text-sm text-gray-600">Total Fees (Wei)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitiesPage; 