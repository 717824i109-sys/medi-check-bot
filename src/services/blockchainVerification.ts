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
  batchNumber: string,
  medicineName?: string
): Promise<BlockchainVerification> {
  try {
    // Use real database verification via edge function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return { isVerified: false };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/verify-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ 
        batchNumber,
        medicineName 
      }),
    });

    if (!response.ok) {
      console.error('Verification API error:', response.status);
      return { isVerified: false };
    }

    const data = await response.json();
    
    return {
      isVerified: data.isVerified,
      timestamp: data.timestamp,
      manufacturer: data.manufacturer,
      transactionHash: data.source || 'Database Verified',
    };
  } catch (error) {
    console.error('Batch verification error:', error);
    return { isVerified: false };
  }
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
