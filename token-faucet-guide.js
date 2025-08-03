// Comprehensive Token Faucet Guide
// Run this in browser console

async function comprehensiveTokenGuide() {
  console.log('=== COMPREHENSIVE TOKEN FAUCET GUIDE ===');
  
  try {
    // Step 1: Find your token details
    const CONTRACT_ADDRESS = '0xc237d6594ff60f422bfd4bf46ff4d88775cac075';
    const basicABI = ['function token() external view returns (address)'];
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, basicABI, provider);
    const tokenAddress = await contract.token();
    
    console.log('🔍 STEP 1: Your Token Details');
    console.log('Token Address:', tokenAddress);
    console.log('Main Contract:', CONTRACT_ADDRESS);
    
    // Get token info
    const tokenContract = new ethers.Contract(tokenAddress, [
      'function name() external view returns (string)',
      'function symbol() external view returns (string)',
      'function decimals() external view returns (uint8)'
    ], provider);
    
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    
    console.log('Token Name:', name);
    console.log('Token Symbol:', symbol);
    console.log('Token Decimals:', decimals);
    
    // Step 2: Check current balance
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const currentAccount = accounts[0];
    
    const balance = await tokenContract.balanceOf(currentAccount);
    console.log('\n💰 STEP 2: Your Current Balance');
    console.log('Your Address:', currentAccount);
    console.log('Your Balance:', ethers.formatUnits(balance, decimals), symbol);
    
    // Step 3: Try built-in faucet
    console.log('\n🚰 STEP 3: Trying Built-in Faucet');
    console.log('Attempting to call faucet functions...');
    
    const signer = await provider.getSigner();
    const faucetContract = new ethers.Contract(tokenAddress, [
      'function faucet() external',
      'function getTokens() external',
      'function mint(address to, uint256 amount) external',
      'function requestTokens() external'
    ], signer);
    
    let faucetSuccess = false;
    
    // Try faucet()
    try {
      console.log('Trying faucet()...');
      const tx = await faucetContract.faucet();
      await tx.wait();
      console.log('✅ faucet() successful!');
      faucetSuccess = true;
    } catch (e) {
      console.log('❌ faucet() failed:', e.message);
    }
    
    // Try getTokens()
    if (!faucetSuccess) {
      try {
        console.log('Trying getTokens()...');
        const tx = await faucetContract.getTokens();
        await tx.wait();
        console.log('✅ getTokens() successful!');
        faucetSuccess = true;
      } catch (e) {
        console.log('❌ getTokens() failed:', e.message);
      }
    }
    
    // Try mint() (if you have permission)
    if (!faucetSuccess) {
      try {
        console.log('Trying mint()...');
        const mintAmount = ethers.parseUnits('1.0', decimals);
        const tx = await faucetContract.mint(currentAccount, mintAmount);
        await tx.wait();
        console.log('✅ mint() successful!');
        faucetSuccess = true;
      } catch (e) {
        console.log('❌ mint() failed:', e.message);
      }
    }
    
    // Check new balance
    const newBalance = await tokenContract.balanceOf(currentAccount);
    console.log('\n📊 STEP 4: Updated Balance');
    console.log('New Balance:', ethers.formatUnits(newBalance, decimals), symbol);
    
    if (faucetSuccess) {
      console.log('\n🎉 SUCCESS! You now have tokens!');
    } else {
      console.log('\n❌ No built-in faucet found. Try external faucets:');
      console.log('\n🌐 EXTERNAL FAUCET OPTIONS:');
      console.log('1. Alchemy Sepolia Faucet: https://sepoliafaucet.com/');
      console.log('2. Infura Sepolia Faucet: https://www.infura.io/faucet/sepolia');
      console.log('3. Chainlink Faucet: https://faucets.chain.link/sepolia');
      console.log('4. Sepolia Faucet: https://sepoliafaucet.com/');
      
      console.log('\n📝 MANUAL TOKEN TRANSFER:');
      console.log('If this is a custom token, you may need to:');
      console.log('1. Ask the admin/developer for tokens');
      console.log('2. Check if there\'s a separate faucet for this specific token');
      console.log('3. Look up the token on Sepolia Explorer:', `https://sepolia.etherscan.io/token/${tokenAddress}`);
    }
    
    return {
      tokenAddress,
      name,
      symbol,
      decimals,
      oldBalance: ethers.formatUnits(balance, decimals),
      newBalance: ethers.formatUnits(newBalance, decimals),
      success: faucetSuccess
    };
    
  } catch (error) {
    console.error('Error in comprehensive guide:', error);
  }
}

// Quick faucet function
async function quickFaucet() {
  console.log('🚰 Quick Faucet Attempt...');
  const result = await comprehensiveTokenGuide();
  return result;
}

// Export functions
window.comprehensiveTokenGuide = comprehensiveTokenGuide;
window.quickFaucet = quickFaucet;

console.log('Available functions:');
console.log('- comprehensiveTokenGuide() - Full guide with all options');
console.log('- quickFaucet() - Quick faucet attempt'); 