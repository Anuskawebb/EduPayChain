import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useWatchContractEvent } from 'wagmi'
import { parseEther, formatEther, type Address } from 'viem'
import { eduPayChainAbi } from '../lib/abis/edupaychainAbi'
import { erc20Abi } from '../lib/abis/erc20Abi'
import { CONTRACT_ADDRESS, ADMIN_ADDRESS } from '../lib/config'
import { useState, useEffect } from 'react'

export interface University {
  name: string
  address: Address
  course: string
  fee: bigint
}

export interface PaymentData {
  student: Address
  university: Address
  amount: bigint
  paidAmount: bigint
  status: number
  metadataURI: string
}

export const useEduPayChain = () => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })
  
  // State for tracking events
  const [universities, setUniversities] = useState<University[]>([])
  const [eventLogs, setEventLogs] = useState<any[]>([])

  // Check if user is admin
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()

  // Get token address
  const { data: tokenAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: eduPayChainAbi,
    functionName: 'token',
  })

  // Get student role hash
  const { data: studentRole } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: eduPayChainAbi,
    functionName: 'STUDENT_ROLE',
  })

  // Check if user has student role
  const { data: hasStudentRole } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: eduPayChainAbi,
    functionName: 'hasRole',
    args: studentRole && address ? [studentRole, address] : undefined,
  })

  // Get university data
  const getUniversity = (universityAddress: Address) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: eduPayChainAbi,
      functionName: 'universities',
      args: [universityAddress],
    })
  }

  // Get payment data
  const getPayment = (studentAddress: Address) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: eduPayChainAbi,
      functionName: 'payments',
      args: [studentAddress],
    })
  }

  // Get student status
  const getStatus = (studentAddress: Address) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: eduPayChainAbi,
      functionName: 'getStatus',
      args: [studentAddress],
    })
  }

  // Get token balance
  const getTokenBalance = (userAddress: Address) => {
    return useReadContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [userAddress],
      query: {
        enabled: !!tokenAddress,
      },
    })
  }

  // Get token allowance
  const getTokenAllowance = (userAddress: Address) => {
    return useReadContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [userAddress, CONTRACT_ADDRESS],
      query: {
        enabled: !!tokenAddress,
      },
    })
  }

  // Register as student
  const registerAsStudent = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: eduPayChainAbi,
      functionName: 'registerAsStudent',
    })
  }

  // Add university (admin only)
  const addUniversity = (universityAddress: Address, name: string, course: string, fee: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: eduPayChainAbi,
      functionName: 'addUniversity',
      args: [universityAddress, name, course, parseEther(fee)],
    })
  }

  // Remove university (admin only)
  const removeUniversity = (universityAddress: Address) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: eduPayChainAbi,
      functionName: 'removeUniversity',
      args: [universityAddress],
    })
  }

  // Approve tokens
  const approveTokens = (amount: bigint) => {
    if (!tokenAddress) return
    writeContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, amount],
    })
  }

  // Pay fees
  const payFees = (universityAddress: Address, amount: bigint, metadataURI: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: eduPayChainAbi,
      functionName: 'payFees',
      args: [universityAddress, amount, metadataURI],
    })
  }

  // Verify and release (admin only)
  const verifyAndRelease = (studentAddress: Address) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: eduPayChainAbi,
      functionName: 'verifyAndRelease',
      args: [studentAddress],
    })
  }

  // Refund (admin only)
  const refund = (studentAddress: Address) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: eduPayChainAbi,
      functionName: 'refund',
      args: [studentAddress],
    })
  }

  // Get tokens from faucet
  const getTokensFromFaucet = () => {
    if (!tokenAddress) return
    writeContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'faucet',
    })
  }

  // Watch for UniversityAdded events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: eduPayChainAbi,
    eventName: 'UniversityAdded',
    onLogs(logs) {
      console.log('UniversityAdded event detected:', logs)
      logs.forEach((log) => {
        const { university, name } = log.args as { university: Address; name: string }
        setEventLogs(prev => [...prev, {
          type: 'UniversityAdded',
          university,
          name,
          timestamp: new Date(),
          blockNumber: log.blockNumber
        }])
        
        // Refresh university data when new university is added
        refreshUniversityData(university)
      })
    },
  })

  // Watch for UniversityRemoved events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: eduPayChainAbi,
    eventName: 'UniversityRemoved',
    onLogs(logs) {
      console.log('UniversityRemoved event detected:', logs)
      logs.forEach((log) => {
        const { university } = log.args as { university: Address }
        setEventLogs(prev => [...prev, {
          type: 'UniversityRemoved',
          university,
          timestamp: new Date(),
          blockNumber: log.blockNumber
        }])
        
        // Remove university from local state
        setUniversities(prev => prev.filter(uni => uni.address !== university))
      })
    },
  })

  // Watch for PaymentMade events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: eduPayChainAbi,
    eventName: 'PaymentMade',
    onLogs(logs) {
      console.log('PaymentMade event detected:', logs)
      logs.forEach((log) => {
        const { student, university, amount } = log.args as { 
          student: Address; 
          university: Address; 
          amount: bigint 
        }
        setEventLogs(prev => [...prev, {
          type: 'PaymentMade',
          student,
          university,
          amount,
          timestamp: new Date(),
          blockNumber: log.blockNumber
        }])
      })
    },
  })

  // Watch for PaymentVerified events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: eduPayChainAbi,
    eventName: 'PaymentVerified',
    onLogs(logs) {
      console.log('PaymentVerified event detected:', logs)
      logs.forEach((log) => {
        const { student, university, amount } = log.args as { 
          student: Address; 
          university: Address; 
          amount: bigint 
        }
        setEventLogs(prev => [...prev, {
          type: 'PaymentVerified',
          student,
          university,
          amount,
          timestamp: new Date(),
          blockNumber: log.blockNumber
        }])
      })
    },
  })

  // Watch for CertificateIssued events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: eduPayChainAbi,
    eventName: 'CertificateIssued',
    onLogs(logs) {
      console.log('CertificateIssued event detected:', logs)
      logs.forEach((log) => {
        const { student, tokenId, uri } = log.args as { 
          student: Address; 
          tokenId: bigint; 
          uri: string 
        }
        setEventLogs(prev => [...prev, {
          type: 'CertificateIssued',
          student,
          tokenId,
          uri,
          timestamp: new Date(),
          blockNumber: log.blockNumber
        }])
      })
    },
  })

  // Function to refresh university data
  const refreshUniversityData = async (universityAddress: Address) => {
    try {
      // This would typically fetch university data from the contract
      // For now, we'll just log that we should refresh
      console.log('Should refresh university data for:', universityAddress)
    } catch (error) {
      console.error('Error refreshing university data:', error)
    }
  }

  // Function to get all universities (you'll need to implement this based on your contract)
  const getAllUniversities = async (): Promise<University[]> => {
    // This is a placeholder - you'll need to implement based on your contract's structure
    // You might need to track university addresses separately or use events to build the list
    return universities
  }

  return {
    // State
    address,
    isAdmin,
    hasStudentRole,
    tokenAddress,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    universities,
    eventLogs,

    // Read functions
    getUniversity,
    getPayment,
    getStatus,
    getTokenBalance,
    getTokenAllowance,

    // Write functions
    registerAsStudent,
    addUniversity,
    removeUniversity,
    approveTokens,
    payFees,
    verifyAndRelease,
    refund,
    getTokensFromFaucet,

    // Event functions
    getAllUniversities,
    refreshUniversityData,

    // Utilities
    formatEther,
    parseEther,
  }
}