// Script to find token details
// Run this in browser console

async function findTokenDetails() {
  console.log('=== Finding Token Details ===');
  
  try {
    // Contract address from your app
    const CONTRACT_ADDRESS = '0xc237d6594ff60f422bfd4bf46ff4d88775cac075';
    
    // Basic ABI to get token address
    const basicABI = [
      'function token() external view returns (address)'
    ];
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, basicABI, provider);
    
    // Get token address
    const tokenAddress = await contract.token();
    console.log('Token Address:', tokenAddress);
    
    // Get token details
    const tokenContract = new ethers.Contract(tokenAddress, [
      'function name() external view returns (string)',
      'function symbol() external view returns (string)',
      'function decimals() external view returns (uint8)',
      'function totalSupply() external view returns (uint256)'
    ], provider);
    
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const totalSupply = await tokenContract.totalSupply();
    
    console.log('Token Details:');
    console.log('- Name:', name);
    console.log('- Symbol:', symbol);
    console.log('- Decimals:', decimals);
    console.log('- Total Supply:', ethers.formatUnits(totalSupply, decimals));
    console.log('- Contract Address:', tokenAddress);
    
    // Check if token has faucet functions
    const faucetABI = [
      'function faucet() external',
      'function getTokens() external',
      'function mint(address to, uint256 amount) external',
      'function requestTokens() external'
    ];
    
    const faucetContract = new ethers.Contract(tokenAddress, faucetABI, provider);
    
    console.log('\nChecking for faucet functions...');
    
    // Try to call faucet functions (read-only to check if they exist)
    try {
      await faucetContract.faucet.staticCall();
      console.log('✅ faucet() function exists');
    } catch (e) {
      console.log('❌ faucet() function does not exist');
    }
    
    try {
      await faucetContract.getTokens.staticCall();
      console.log('✅ getTokens() function exists');
    } catch (e) {
      console.log('❌ getTokens() function does not exist');
    }
    
    try {
      await faucetContract.mint.staticCall('0x0000000000000000000000000000000000000000', 0);
      console.log('✅ mint() function exists');
    } catch (e) {
      console.log('❌ mint() function does not exist');
    }
    
    try {
      await faucetContract.requestTokens.staticCall();
      console.log('✅ requestTokens() function exists');
    } catch (e) {
      console.log('❌ requestTokens() function does not exist');
    }
    
    return {
      tokenAddress,
      name,
      symbol,
      decimals,
      totalSupply: ethers.formatUnits(totalSupply, decimals)
    };
    
  } catch (error) {
    console.error('Error finding token details:', error);
  }
}

// Export function
window.findTokenDetails = findTokenDetails;
console.log('Run: findTokenDetails() to get token information'); 