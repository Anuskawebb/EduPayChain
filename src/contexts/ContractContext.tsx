import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../utils/contract';

interface ContractContextType {
  contract: ethers.Contract | null;
  isAdmin: boolean;
  adminAddress: string | null;
  tokenAddress: string | null;
  checkAdmin: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const { provider, signer, account, isConnected } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAddress, setAdminAddress] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);

  useEffect(() => {
    if (provider && signer && isConnected) {
      initializeContract();
    } else {
      setContract(null);
      setIsAdmin(false);
      setAdminAddress(null);
      setTokenAddress(null);
    }
  }, [provider, signer, isConnected]);

  useEffect(() => {
    if (contract && account) {
      checkAdmin();
    }
  }, [contract, account]);

  const initializeContract = async () => {
    try {
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);
      
      // Get token address
      const token = await contractInstance.token();
      setTokenAddress(token);
    } catch (error) {
      console.error('Error initializing contract:', error);
    }
  };

  const checkAdmin = async () => {
    if (!contract || !account) return;

    try {
      const admin = await contract.admin();
      setAdminAddress(admin);
      setIsAdmin(admin.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminAddress(null);
    }
  };

  const refreshAdminStatus = async () => {
    await checkAdmin();
  };

  const value: ContractContextType = {
    contract,
    isAdmin,
    adminAddress,
    tokenAddress,
    checkAdmin,
    refreshAdminStatus,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};