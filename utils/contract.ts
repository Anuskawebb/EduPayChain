import { ethers } from 'ethers';
import contractABI from '../contracts/abi.json';

// TypeScript declaration for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xc237d6594ff60f422bfd4bf46ff4d88775cac075';
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '0x92f6D0Aed727EaFCDbdd020899415E72DAb93A0d';

// Initialize provider
const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/your-project-id');
};

// Initialize contract
export const getContract = (signer?: ethers.Signer) => {
  const provider = getProvider();
  // For read-only operations, use provider. For transactions, signer is required
  const contractSigner = signer || provider;
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, contractSigner);
};

// Initialize contract with signer (for transactions)
export const getContractWithSigner = (signer: ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
};

// Connect wallet with forced account selection
export const connectWallet = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // First, clear any existing permissions to force account selection
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
      } catch (error) {
        console.log('Permission request failed, continuing...');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request accounts - this will show the account selection dialog
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // If multiple accounts, let user choose
      let selectedAccount = accounts[0];
      
      if (accounts.length > 1) {
        // Force account selection by requesting permissions again
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
          // Get the updated accounts after user selection
          const updatedAccounts = await provider.listAccounts();
          selectedAccount = updatedAccounts[0];
        } catch (error) {
          console.log('Account selection cancelled');
        }
      }

      const signer = await provider.getSigner();
      return { signer, address: selectedAccount };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask not found');
  }
};

// Get all available accounts
export const getAvailableAccounts = async (): Promise<string[]> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });
      return accounts || [];
    } catch (error) {
      console.error('Error getting available accounts:', error);
      return [];
    }
  }
  return [];
};

// Switch to a specific account
export const switchToAccount = async (accountIndex: number): Promise<string> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await getAvailableAccounts();
      if (accountIndex >= 0 && accountIndex < accounts.length) {
        // Request the specific account
        const selectedAccount = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (selectedAccount && selectedAccount.length > 0) {
          return selectedAccount[0];
        } else {
          throw new Error('No account selected');
        }
      } else {
        throw new Error('Invalid account index');
      }
    } catch (error) {
      console.error('Error switching account:', error);
      if (error instanceof Error) {
        throw new Error(`Account switching failed: ${error.message}`);
      } else {
        throw new Error('Account switching failed: Unknown error');
      }
    }
  } else {
    throw new Error('MetaMask not found');
  }
};

// Force account selection dialog
export const forceAccountSelection = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Request accounts - this will show the account selection dialog
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        return accounts[0];
      } else {
        throw new Error('No accounts available');
      }
    } catch (error) {
      console.error('Error forcing account selection:', error);
      // Provide more specific error message
      if (error instanceof Error) {
        throw new Error(`Account selection failed: ${error.message}`);
      } else {
        throw new Error('Account selection failed: Unknown error');
      }
    }
  } else {
    throw new Error('MetaMask not found');
  }
};

// Check if user is admin
export const isAdmin = (address: string) => {
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
};

// Track known university addresses (since we can't enumerate mapping keys)
let knownUniversityAddresses: string[] = [];

// Initialize known addresses from localStorage
const initializeKnownAddresses = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('edupaychain_known_universities');
      if (stored) {
        knownUniversityAddresses = JSON.parse(stored);
        console.log('Known university addresses loaded:', knownUniversityAddresses);
      }
    } catch (error) {
      console.error('Error loading known university addresses:', error);
      knownUniversityAddresses = [];
    }
  }
};

// Save known addresses to localStorage
const saveKnownAddresses = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('edupaychain_known_universities', JSON.stringify(knownUniversityAddresses));
      console.log('Known university addresses saved');
    } catch (error) {
      console.error('Error saving known university addresses:', error);
    }
  }
};

// Initialize on module load
initializeKnownAddresses();

// Utility function to clear known university addresses (for testing)
export const clearKnownUniversities = () => {
  knownUniversityAddresses = [];
  if (typeof window !== 'undefined') {
    localStorage.removeItem('edupaychain_known_universities');
  }
  console.log('Known university addresses cleared');
};

// Utility function to get known university addresses (for debugging)
export const getKnownUniversityAddresses = () => {
  return knownUniversityAddresses;
};

// Debug function to log current state
export const debugUniversitiesState = async () => {
  console.log('=== Universities Debug Info ===');
  console.log('Known university addresses:', knownUniversityAddresses);
  console.log('localStorage content:', localStorage.getItem('edupaychain_known_universities'));
  console.log('=== End Debug Info ===');
};

// Test function to add a sample university address
export const testAddUniversity = async () => {
  const testAddress = '0x1234567890123456789012345678901234567890';
  if (!knownUniversityAddresses.includes(testAddress)) {
    knownUniversityAddresses.push(testAddress);
    saveKnownAddresses();
    console.log('Test university address added:', testAddress);
  }
  return testAddress;
};

// Contract functions with error handling
export const contractFunctions = {
  // Student registration
  registerAsStudent: async (signer?: ethers.Signer) => {
    try {
      if (!signer) {
        throw new Error('Signer is required for transactions');
      }

      const contract = getContractWithSigner(signer);
      // Check if function exists in ABI
      if (contract.registerAsStudent) {
        return await contract.registerAsStudent();
      } else {
        console.warn('registerAsStudent function not found in contract ABI');
        throw new Error('Smart contract function not available');
      }
    } catch (error) {
      console.error('Error registering student:', error);
      throw error;
    }
  },

  // Add university (admin only)
  addUniversity: async (name: string, address: string, course: string, fee: string, signer?: ethers.Signer) => {
    try {
      // Check if we're on the correct network
      if (typeof window !== 'undefined' && window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'; // Sepolia
        const expectedChainIdHex = '0x' + parseInt(expectedChainId).toString(16);
        
        if (chainId !== expectedChainIdHex) {
          throw new Error(`Please switch to Sepolia testnet. Current network: ${chainId}, Expected: ${expectedChainIdHex}`);
        }
      }

      if (!signer) {
        throw new Error('Signer is required for transactions');
      }

      const contract = getContractWithSigner(signer);
      if (contract.addUniversity) {
        // The ABI expects: (university: address, name: string, course: string, fee: uint256)
        const tx = await contract.addUniversity(address, name, course, ethers.parseEther(fee));
        
        // Add to known addresses if not already present
        if (!knownUniversityAddresses.includes(address)) {
          knownUniversityAddresses.push(address);
          saveKnownAddresses();
          console.log('University address added to known addresses:', address);
        }
        
        return tx;
      } else {
        console.warn('addUniversity function not found in contract ABI');
        throw new Error('Smart contract function not available');
      }
    } catch (error) {
      console.error('Error adding university:', error);
      throw error;
    }
  },

  // Remove university (admin only)
  removeUniversity: async (address: string, signer?: ethers.Signer) => {
    try {
      if (!signer) {
        throw new Error('Signer is required for transactions');
      }

      const contract = getContractWithSigner(signer);
      if (contract.removeUniversity) {
        const tx = await contract.removeUniversity(address);
        
        // Remove from known addresses
        const index = knownUniversityAddresses.indexOf(address);
        if (index > -1) {
          knownUniversityAddresses.splice(index, 1);
          saveKnownAddresses();
          console.log('University address removed from known addresses:', address);
        }
        
        return tx;
      } else {
        console.warn('removeUniversity function not found in contract ABI');
        throw new Error('Smart contract function not available');
      }
    } catch (error) {
      console.error('Error removing university:', error);
      throw error;
    }
  },

  // Pay fees
  payFees: async (university: string, amount: string, studentName: string, course: string, signer?: ethers.Signer) => {
    try {
      // Check if we're on the correct network
      if (typeof window !== 'undefined' && window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'; // Sepolia
        const expectedChainIdHex = '0x' + parseInt(expectedChainId).toString(16);
        
        if (chainId !== expectedChainIdHex) {
          throw new Error(`Please switch to Sepolia testnet. Current network: ${chainId}, Expected: ${expectedChainIdHex}`);
        }
      }

      if (!signer) {
        throw new Error('Signer is required for transactions');
      }

      const contract = getContractWithSigner(signer);
      
      // Check if student is registered first
      try {
        const studentAddress = await signer.getAddress();
        console.log('Checking if student is registered:', studentAddress);
        
        // Try to get student status to check if registered
        if (contract.payments) {
          const paymentData = await contract.payments(studentAddress);
          console.log('Student payment data:', paymentData);
        }
      } catch (error) {
        console.log('Student not found in payments mapping, may need to register first');
      }
      
      if (contract.payFees) {
        // Generate metadata URI for the payment
        const metadataURI = generateCertificateMetadata(studentName, course, university, new Date().toISOString());
        
        console.log('Calling payFees with parameters:', {
          university,
          amount: ethers.parseEther(amount),
          metadataURI
        });
        
        // Call the actual smart contract function
        return await contract.payFees(university, ethers.parseEther(amount), metadataURI);
      } else {
        console.warn('payFees function not found in contract ABI');
        throw new Error('Smart contract function not available');
      }
    } catch (error) {
      console.error('Error paying fees:', error);
      
      // Try to extract more specific error information
      if (error && typeof error === 'object') {
        console.log('Full error object:', error);
        
        if ('reason' in error && error.reason) {
          throw new Error(`Payment failed: ${error.reason}`);
        } else if ('message' in error && error.message) {
          throw new Error(`Payment failed: ${error.message}`);
        } else if ('data' in error && error.data) {
          // Try to decode the error data
          console.log('Error data:', error.data);
          throw new Error(`Payment failed: Contract error (check console for details)`);
        } else if ('error' in error && error.error && typeof error.error === 'object' && 'message' in error.error) {
          console.log('Nested error:', error.error);
          throw new Error(`Payment failed: ${(error.error as any).message || 'Unknown contract error'}`);
        }
      }
      
      // If we can't extract specific error, provide helpful guidance
      throw new Error('Payment failed. Please check: 1) You are registered as a student, 2) University is approved, 3) Amount is correct, 4) You have sufficient ETH balance.');
    }
  },

  // Verify and release certificate
  verifyAndRelease: async (student: string, university: string, signer?: ethers.Signer) => {
    try {
      if (!signer) {
        throw new Error('Signer is required for transactions');
      }

      const contract = getContractWithSigner(signer);
      if (contract.verifyAndRelease) {
        return await contract.verifyAndRelease(student);
      } else {
        console.warn('verifyAndRelease function not found in contract ABI');
        throw new Error('Smart contract function not available');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  // Refund payment
  refund: async (student: string, university: string, signer?: ethers.Signer) => {
    try {
      if (!signer) {
        throw new Error('Signer is required for transactions');
      }

      const contract = getContractWithSigner(signer);
      if (contract.refund) {
        return await contract.refund(student);
      } else {
        console.warn('refund function not found in contract ABI');
        throw new Error('Smart contract function not available');
      }
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  },

  // Get payment status
  getStatus: async (student: string, university: string) => {
    try {
      const contract = getContract();
      if (contract.payments) {
        // Get payment data from the payments mapping
        const paymentData = await contract.payments(student);
        
        // Convert the payment data to the expected format
        return {
          isRegistered: true, // Assume registered if we can get payment data
          university: paymentData.university,
          amountPaid: paymentData.paidAmount,
          totalAmount: paymentData.amount,
          isVerified: paymentData.status === 1, // Assuming 1 = Verified
          isRefunded: paymentData.status === 2, // Assuming 2 = Refunded
          certificateTokenId: 0n // This would need to be fetched separately
        };
      } else if (contract.getStatus) {
        // Fallback to getStatus if payments mapping doesn't exist
        const statusString = await contract.getStatus(student);
        return {
          isRegistered: true,
          university: university,
          amountPaid: 0n,
          totalAmount: 0n,
          isVerified: statusString === 'Verified',
          isRefunded: statusString === 'Refunded',
          certificateTokenId: 0n
        };
      } else {
        console.warn('Neither payments mapping nor getStatus function found in contract ABI');
        // Return default status
        return {
          isRegistered: false,
          university: '',
          amountPaid: 0n,
          totalAmount: 0n,
          isVerified: false,
          isRefunded: false,
          certificateTokenId: 0n
        };
      }
    } catch (error) {
      console.error('Error getting status:', error);
      // Return default status on error
      return {
        isRegistered: false,
        university: '',
        amountPaid: 0n,
        totalAmount: 0n,
        isVerified: false,
        isRefunded: false,
        certificateTokenId: 0n
      };
    }
  },

  // Get universities list
  getUniversities: async () => {
    try {
      const contract = getContract();
      if (contract.universities) {
        // Get universities from known addresses
        const universities = [];
        
        for (const address of knownUniversityAddresses) {
          try {
            const universityData = await contract.universities(address);
            
            // Check if university is approved
            if (universityData.isApproved) {
              universities.push({
                name: universityData.name,
                address: address,
                course: universityData.course,
                fee: universityData.fee
              });
            }
          } catch (error) {
            console.warn(`Error fetching university data for ${address}:`, error);
            // Continue with other universities
          }
        }
        
        console.log('Universities fetched from smart contract:', universities);
        return universities;
      } else {
        console.warn('universities mapping not found in contract ABI');
        return [];
      }
    } catch (error) {
      console.error('Error getting universities:', error);
      return [];
    }
  },

  // Refresh universities from contract (for future use)
  refreshUniversitiesFromContract: async () => {
    try {
      const contract = getContract();
      if (contract.universities) {
        // This would be implemented when we have a way to enumerate mapping keys
        console.log('Refresh universities from contract - not implemented yet');
        return await contractFunctions.getUniversities();
      }
    } catch (error) {
      console.error('Error refreshing universities from contract:', error);
      return [];
    }
  },

  // Get student info
  getStudentInfo: async (student: string) => {
    try {
      const contract = getContract();
      if (contract.hasRole) {
        // Check if the student has the STUDENT_ROLE
        const STUDENT_ROLE = await contract.STUDENT_ROLE();
        const isRegistered = await contract.hasRole(STUDENT_ROLE, student);
        return { isRegistered, registrationDate: Date.now() };
      } else {
        console.warn('hasRole function not found in contract ABI');
        return { isRegistered: true, registrationDate: Date.now() };
      }
    } catch (error) {
      console.error('Error getting student info:', error);
      return { isRegistered: true, registrationDate: Date.now() };
    }
  },

  // Mint certificate NFT
  mintCertificate: async (to: string, uri: string) => {
    try {
      const contract = getContract();
      if (contract.certificateNFT) {
        // Get the certificate NFT contract address
        const nftContractAddress = await contract.certificateNFT();
        const provider = getProvider();
        const nftContract = new ethers.Contract(nftContractAddress, contractABI, provider);
        return await nftContract.mint(to, uri);
      } else {
        console.warn('certificateNFT function not found in contract ABI');
        return { hash: '0xmock_hash_mint' };
      }
    } catch (error) {
      console.error('Error minting certificate:', error);
      throw error;
    }
  },

  // Get token URI
  getTokenURI: async (tokenId: number) => {
    try {
      const contract = getContract();
      if (contract.certificateNFT) {
        // Get the certificate NFT contract address
        const nftContractAddress = await contract.certificateNFT();
        const provider = getProvider();
        const nftContract = new ethers.Contract(nftContractAddress, contractABI, provider);
        return await nftContract.tokenURI(tokenId);
      } else {
        console.warn('certificateNFT function not found in contract ABI');
        return 'https://example.com/metadata.json';
      }
    } catch (error) {
      console.error('Error getting token URI:', error);
      return 'https://example.com/metadata.json';
    }
  },

  // Get token counter
  getTokenCounter: async () => {
    try {
      const contract = getContract();
      if (contract.certificateNFT) {
        // Get the certificate NFT contract address
        const nftContractAddress = await contract.certificateNFT();
        const provider = getProvider();
        const nftContract = new ethers.Contract(nftContractAddress, contractABI, provider);
        return await nftContract.tokenCounter();
      } else {
        console.warn('certificateNFT function not found in contract ABI');
        return 1;
      }
    } catch (error) {
      console.error('Error getting token counter:', error);
      return 1;
    }
  },

  // Get balance of tokens
  getBalanceOf: async (owner: string) => {
    try {
      const contract = getContract();
      if (contract.certificateNFT) {
        // Get the certificate NFT contract address
        const nftContractAddress = await contract.certificateNFT();
        const provider = getProvider();
        const nftContract = new ethers.Contract(nftContractAddress, contractABI, provider);
        return await nftContract.balanceOf(owner);
      } else {
        console.warn('certificateNFT function not found in contract ABI');
        return 0;
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  },

  // Get owner of token
  getOwnerOf: async (tokenId: number) => {
    try {
      const contract = getContract();
      if (contract.certificateNFT) {
        // Get the certificate NFT contract address
        const nftContractAddress = await contract.certificateNFT();
        const provider = getProvider();
        const nftContract = new ethers.Contract(nftContractAddress, contractABI, provider);
        return await nftContract.ownerOf(tokenId);
      } else {
        console.warn('certificateNFT function not found in contract ABI');
        return '0x0000000000000000000000000000000000000000';
      }
    } catch (error) {
      console.error('Error getting owner:', error);
      return '0x0000000000000000000000000000000000000000';
    }
  }
};

// Event listeners
export const setupEventListeners = (contract: ethers.Contract, callback: (event: any) => void) => {
  contract.on('PaymentMade', callback);
  contract.on('PaymentVerified', callback);
  contract.on('PaymentRefunded', callback);
  contract.on('CertificateIssued', callback);
  contract.on('StudentRegistered', callback);
  contract.on('UniversityAdded', callback);
  contract.on('UniversityRemoved', callback);
};

// Setup university event listeners
export const setupUniversityEventListeners = (callback: () => void) => {
  try {
    const contract = getContract();
    
    // Listen for UniversityAdded events
    contract.on('UniversityAdded', (university: string, name: string, course: string, fee: bigint) => {
      console.log('UniversityAdded event:', { university, name, course, fee });
      
      // Add to known addresses if not already present
      if (!knownUniversityAddresses.includes(university)) {
        knownUniversityAddresses.push(university);
        saveKnownAddresses();
        console.log('University address added from event:', university);
      }
      
      // Trigger callback to refresh UI
      callback();
    });
    
    // Listen for UniversityRemoved events
    contract.on('UniversityRemoved', (university: string) => {
      console.log('UniversityRemoved event:', university);
      
      // Remove from known addresses
      const index = knownUniversityAddresses.indexOf(university);
      if (index > -1) {
        knownUniversityAddresses.splice(index, 1);
        saveKnownAddresses();
        console.log('University address removed from event:', university);
      }
      
      // Trigger callback to refresh UI
      callback();
    });
    
    console.log('University event listeners setup complete');
  } catch (error) {
    console.error('Error setting up university event listeners:', error);
  }
};

// Format ether values
export const formatEther = (value: bigint) => {
  return ethers.formatEther(value);
};

// Parse ether values
export const parseEther = (value: string) => {
  return ethers.parseEther(value);
};

// Generate metadata URI for certificates
export const generateCertificateMetadata = (studentName: string, course: string, university: string, date: string) => {
  return JSON.stringify({
    name: `Certificate - ${studentName}`,
    description: `Certificate for ${studentName} in ${course} at ${university}`,
    image: "https://ipfs.io/ipfs/QmYourCertificateImageHash",
    attributes: [
      {
        trait_type: "Student Name",
        value: studentName
      },
      {
        trait_type: "Course",
        value: course
      },
      {
        trait_type: "University",
        value: university
      },
      {
        trait_type: "Issue Date",
        value: date
      }
    ]
  });
}; 