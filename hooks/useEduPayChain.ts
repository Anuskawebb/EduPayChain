import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseEther, formatEther, type Address } from 'viem'
import { eduPayChainAbi } from '../lib/abis/edupaychainAbi'
import { erc20Abi } from '../lib/abis/erc20Abi'
import { CONTRACT_ADDRESS, ADMIN_ADDRESS } from '../lib/config'

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

    // Utilities
    formatEther,
    parseEther,
  }
}