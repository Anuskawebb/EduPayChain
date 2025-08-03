// Debug script for payment flow
// Run this in browser console to test payment functionality

async function debugPaymentFlow() {
  console.log('=== Payment Flow Debug ===');
  
  try {
    // Check if MetaMask is connected
    if (!window.ethereum) {
      console.error('MetaMask not found');
      return;
    }
    
    // Get current account
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      console.error('No accounts connected');
      return;
    }
    
    const currentAccount = accounts[0];
    console.log('Current account:', currentAccount);
    
    // Check network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current network:', chainId);
    
    // Import ethers if not available
    if (typeof ethers === 'undefined') {
      console.error('Ethers not available. Please make sure the page is loaded.');
      return;
    }
    
    // Get contract instance
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Contract address and ABI (you'll need to import these)
    const CONTRACT_ADDRESS = '0xc237d6594ff60f422bfd4bf46ff4d88775cac075';
    
    // Basic ABI for testing
    const basicABI = [
      'function token() external view returns (address)',
      'function payments(address) external view returns (tuple(address university, uint256 amount, uint256 paidAmount, uint8 status))',
      'function payFees(address university, uint256 amount, string memory metadataURI) external'
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, basicABI, signer);
    
    // Check token address
    const tokenAddress = await contract.token();
    console.log('Token address:', tokenAddress);
    
    // Check current payment status
    try {
      const paymentData = await contract.payments(currentAccount);
      console.log('Current payment data:', {
        university: paymentData.university,
        amount: paymentData.amount.toString(),
        paidAmount: paymentData.paidAmount.toString(),
        status: paymentData.status
      });
    } catch (error) {
      console.log('No payment data found or error:', error.message);
    }
    
    // Check token allowance
    const tokenContract = new ethers.Contract(tokenAddress, [
      'function allowance(address owner, address spender) external view returns (uint256)',
      'function balanceOf(address owner) external view returns (uint256)'
    ], signer);
    
    const allowance = await tokenContract.allowance(currentAccount, CONTRACT_ADDRESS);
    const balance = await tokenContract.balanceOf(currentAccount);
    
    console.log('Token allowance:', allowance.toString());
    console.log('Token balance:', balance.toString());
    
    console.log('=== Debug Complete ===');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Function to test a small payment
async function testPayment() {
  console.log('=== Testing Payment ===');
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const CONTRACT_ADDRESS = '0xc237d6594ff60f422bfd4bf46ff4d88775cac075';
    const basicABI = [
      'function token() external view returns (address)',
      'function payFees(address university, uint256 amount, string memory metadataURI) external'
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, basicABI, signer);
    const tokenAddress = await contract.token();
    
    // Test parameters
    const testUniversity = '0x92f6D0Aed727EaFCDbdd020899415E72DAb93A0d'; // Admin address as test
    const testAmount = ethers.parseEther('0.001'); // Small amount
    const testMetadata = JSON.stringify({
      name: 'Test Certificate',
      description: 'Test payment',
      date: new Date().toISOString()
    });
    
    console.log('Test parameters:', {
      university: testUniversity,
      amount: testAmount.toString(),
      metadata: testMetadata
    });
    
    // Try the payment
    const tx = await contract.payFees(testUniversity, testAmount, testMetadata);
    console.log('Payment transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Payment confirmed in block:', receipt.blockNumber);
    
  } catch (error) {
    console.error('Test payment error:', error);
  }
}

// Function to test token approval specifically
async function testTokenApproval() {
  console.log('=== Testing Token Approval ===');
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const CONTRACT_ADDRESS = '0xc237d6594ff60f422bfd4bf46ff4d88775cac075';
    const basicABI = [
      'function token() external view returns (address)'
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, basicABI, signer);
    const tokenAddress = await contract.token();
    
    console.log('Token address:', tokenAddress);
    console.log('Contract address:', CONTRACT_ADDRESS);
    
    const tokenContract = new ethers.Contract(tokenAddress, [
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function allowance(address owner, address spender) external view returns (uint256)',
      'function balanceOf(address owner) external view returns (uint256)',
      'function name() external view returns (string)',
      'function symbol() external view returns (string)',
      'function decimals() external view returns (uint8)'
    ], signer);
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const currentAccount = accounts[0];
    
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const balance = await tokenContract.balanceOf(currentAccount);
    const allowance = await tokenContract.allowance(currentAccount, CONTRACT_ADDRESS);
    
    console.log('Token details:', { name, symbol, decimals });
    console.log('Current balance:', ethers.formatUnits(balance, decimals));
    console.log('Current allowance:', ethers.formatUnits(allowance, decimals));
    
    // Test approval
    const testAmount = ethers.parseUnits('0.01', decimals);
    console.log('Testing approval for amount:', ethers.formatUnits(testAmount, decimals));
    
    const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, testAmount);
    console.log('Approval transaction sent:', approveTx.hash);
    
    const receipt = await approveTx.wait();
    console.log('Approval confirmed in block:', receipt.blockNumber);
    
    // Check new allowance
    const newAllowance = await tokenContract.allowance(currentAccount, CONTRACT_ADDRESS);
    console.log('New allowance:', ethers.formatUnits(newAllowance, decimals));
    
  } catch (error) {
    console.error('Token approval test error:', error);
  }
}

// Export functions for use in console
window.debugPaymentFlow = debugPaymentFlow;
window.testPayment = testPayment;
window.testTokenApproval = testTokenApproval;

console.log('Debug functions available:');
console.log('- debugPaymentFlow() - Check current state');
console.log('- testPayment() - Test a small payment');
console.log('- testTokenApproval() - Test token approval specifically'); 