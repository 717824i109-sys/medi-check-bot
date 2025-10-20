import { ethers } from 'ethers';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Smart contract ABI for batch verification
const CONTRACT_ABI = [
  "function verifyBatch(string batchNumber) public view returns (bool, uint256, string)",
  "function registerBatch(string batchNumber, string medicineName, address manufacturer) public",
];

// Sepolia testnet contract address (example - replace with actual deployed contract)
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder

export interface BlockchainVerification {
  isVerified: boolean;
  timestamp?: number;
  manufacturer?: string;
  transactionHash?: string;
}

export async function verifyBatchOnBlockchain(
  batchNumber: string
): Promise<BlockchainVerification> {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      console.warn('MetaMask not installed, skipping blockchain verification');
      return { isVerified: false };
    }

    // Connect to Sepolia testnet
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Verify batch on-chain
    const [isVerified, timestamp, manufacturer] = await contract.verifyBatch(batchNumber);

    return {
      isVerified,
      timestamp: timestamp ? Number(timestamp) : undefined,
      manufacturer: manufacturer || undefined,
    };
  } catch (error) {
    console.error('Blockchain verification error:', error);
    // Fallback: simulate verification for demo purposes
    return simulateBlockchainVerification(batchNumber);
  }
}

// Simulated blockchain verification for demo (when MetaMask not available)
function simulateBlockchainVerification(batchNumber: string): BlockchainVerification {
  // Simulate some batches as verified
  const verifiedBatches = ['LOT12345', 'BATCH-2024-001', 'MFG123456'];
  
  const isVerified = verifiedBatches.some(batch => 
    batchNumber.toUpperCase().includes(batch)
  );

  return {
    isVerified,
    timestamp: isVerified ? Date.now() - 86400000 : undefined, // 1 day ago
    manufacturer: isVerified ? 'Verified Manufacturer' : undefined,
  };
}

export async function connectWallet(): Promise<string | null> {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Wallet connection error:', error);
    return null;
  }
}
