import { ethers } from 'ethers';
import contractABI from '../contracts/abi.json';

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xd7fddb3352f406e1a45c03100599aac1e9901eab';
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
  const contractSigner = signer || provider;
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, contractSigner);
};

// Connect wallet
export const connectWallet = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      return { signer, address: accounts[0] };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask not found');
  }
};

// Check if user is admin
export const isAdmin = (address: string) => {
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
};

// Contract functions
export const contractFunctions = {
  // Register as student
  registerAsStudent: async (signer: ethers.Signer) => {
    const contract = getContract(signer);
    const tx = await contract.registerAsStudent();
    return await tx.wait();
  },

  // Add university (admin only)
  addUniversity: async (signer: ethers.Signer, name: string, address: string, course: string, fee: string) => {
    const contract = getContract(signer);
    const feeWei = ethers.parseEther(fee);
    const tx = await contract.addUniversity(name, address, course, feeWei);
    return await tx.wait();
  },

  // Remove university (admin only)
  removeUniversity: async (signer: ethers.Signer, address: string) => {
    const contract = getContract(signer);
    const tx = await contract.removeUniversity(address);
    return await tx.wait();
  },

  // Pay fees
  payFees: async (signer: ethers.Signer, universityAddress: string, amount: string) => {
    const contract = getContract(signer);
    const amountWei = ethers.parseEther(amount);
    const tx = await contract.payFees(universityAddress, amountWei);
    return await tx.wait();
  },

  // Verify and release certificate (admin only)
  verifyAndRelease: async (signer: ethers.Signer, studentAddress: string, metadata: string) => {
    const contract = getContract(signer);
    const tx = await contract.verifyAndRelease(studentAddress, metadata);
    return await tx.wait();
  },

  // Refund payment (admin only)
  refund: async (signer: ethers.Signer, studentAddress: string) => {
    const contract = getContract(signer);
    const tx = await contract.refund(studentAddress);
    return await tx.wait();
  },

  // Get payment status
  getStatus: async (studentAddress: string) => {
    const contract = getContract();
    return await contract.getStatus(studentAddress);
  },

  // Get universities
  getUniversities: async () => {
    const contract = getContract();
    return await contract.getUniversities();
  },

  // Get student info
  getStudentInfo: async (studentAddress: string) => {
    const contract = getContract();
    return await contract.getStudentInfo(studentAddress);
  },

  // Mint NFT certificate
  mintCertificate: async (signer: ethers.Signer, to: string, uri: string) => {
    const contract = getContract(signer);
    const tx = await contract.mint(to, uri);
    return await tx.wait();
  },

  // Get token URI
  getTokenURI: async (tokenId: number) => {
    const contract = getContract();
    return await contract.tokenURI(tokenId);
  },

  // Get token counter
  getTokenCounter: async () => {
    const contract = getContract();
    return await contract.tokenCounter();
  },

  // Get balance of tokens
  getBalanceOf: async (address: string) => {
    const contract = getContract();
    return await contract.balanceOf(address);
  },

  // Get owner of token
  getOwnerOf: async (tokenId: number) => {
    const contract = getContract();
    return await contract.ownerOf(tokenId);
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