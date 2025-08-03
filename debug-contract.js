const { ethers } = require('ethers');

// Load the ABI
const abi = require('./contracts/abi.json');

// Contract address (you'll need to update this)
const CONTRACT_ADDRESS = '0xC237D6594ff60F422BFd4Bf46fF4d88775cAC075';

// Provider (you'll need to update this with your RPC URL)
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID');

async function debugContract() {
  try {
    console.log('=== CONTRACT ABI DEBUG ===');
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    
    // Check if contract exists
    console.log('Contract address:', contract.target);
    
    // Get all function names from ABI
    const functions = abi.filter(item => item.type === 'function');
    console.log('\nFunctions in ABI:');
    functions.forEach(func => {
      console.log(`- ${func.name}(${func.inputs.map(input => `${input.type} ${input.name}`).join(', ')})`);
    });
    
    // Check specific functions
    const payFeesFunction = functions.find(f => f.name === 'payFees');
    if (payFeesFunction) {
      console.log('\npayFees function found in ABI:');
      console.log('Inputs:', payFeesFunction.inputs);
      console.log('Function signature:', `${payFeesFunction.name}(${payFeesFunction.inputs.map(input => input.type).join(',')})`);
      
      // Calculate function selector
      const signature = `${payFeesFunction.name}(${payFeesFunction.inputs.map(input => input.type).join(',')})`;
      const selector = ethers.id(signature).slice(0, 10);
      console.log('Function selector:', selector);
    } else {
      console.log('\npayFees function NOT found in ABI!');
    }
    
    // Check if contract has the function
    try {
      const hasPayFees = contract.payFees;
      console.log('\nContract has payFees function:', !!hasPayFees);
      
      if (hasPayFees) {
        console.log('payFees function fragment:', contract.interface.getFunction('payFees'));
      }
    } catch (error) {
      console.log('\nError checking contract function:', error.message);
    }
    
    // Check for custom errors
    const errors = abi.filter(item => item.type === 'error');
    console.log('\nCustom errors in ABI:');
    errors.forEach(error => {
      console.log(`- ${error.name}(${error.inputs.map(input => `${input.type} ${input.name}`).join(', ')})`);
    });
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugContract(); 