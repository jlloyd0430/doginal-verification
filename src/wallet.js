// Import necessary functions from DogeLabs and MyDoge integrations
import { getDogeLabsWalletAddress, sendDogeFromDogeLabs } from './dogelabs';
import { getMyDogeWalletAddress, sendDogeFromMyDoge } from './mydoge';

// Constants for wallet types
export const DOGELABS_WALLET = 'dogeLabs';
export const MYDOGE_WALLET = 'myDoge';

// Initialize MyDoge Wallet listener
let myDogeMask = null;

window.addEventListener(
  'doge#initialized',
  () => {
    myDogeMask = window.doge;
  },
  { once: true }
);

// Function to connect to MyDoge Wallet
export const connectMyDogeWallet = async () => {
  if (!myDogeMask || !myDogeMask.isMyDoge) {
    alert('Please install the MyDoge Wallet extension to connect.');
    return null;
  }
  try {
    const connectRes = await myDogeMask.connect();
    console.log('Connect result:', connectRes);
    return connectRes; // Returns the address, balance, and public key
  } catch (error) {
    console.error('Wallet connection failed:', error);
    return null;
  }
};

// Function to get the balance of MyDoge Wallet
export const getMyDogeBalance = async () => {
  try {
    const balanceRes = await myDogeMask.getBalance();
    console.log('Balance result:', balanceRes);
    return balanceRes;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return null;
  }
};

// Function to disconnect MyDoge Wallet
export const disconnectMyDogeWallet = async () => {
  try {
    const disconnectRes = await myDogeMask.disconnect();
    console.log('Disconnect result:', disconnectRes);
    return disconnectRes;
  } catch (error) {
    console.error('Failed to disconnect:', error);
    return null;
  }
};

// Function to connect to DogeLabs Wallet
export const connectDogeLabsWallet = async () => {
  if (typeof window.dogeLabs === 'undefined') {
    alert('Please install the DogeLabs Wallet extension to connect.');
    return null;
  }
  try {
    const accounts = await window.dogeLabs.requestAccounts();
    console.log('DogeLabs accounts:', accounts); // Add this line
    
    if (accounts.length !== 1) {
      throw new Error(`Invalid number of accounts detected (${accounts.length})`);
    }
    
    console.log('DogeLabs Wallet connected:', accounts[0]);
    return { address: accounts[0] }; // Ensure it returns an object with `address` key
  } catch (err) {
    console.error('Failed to connect to DogeLabs Wallet:', err);
    return null;
  }
};


// Function to get the balance of DogeLabs Wallet
export const getDogeLabsBalance = async () => {
  try {
    return await window.dogeLabs.getBalance();
  } catch (error) {
    console.error('Failed to fetch balance from DogeLabs Wallet:', error);
    return null;
  }
};

// Function to disconnect DogeLabs Wallet
export const disconnectDogeLabsWallet = async () => {
  try {
    return await window.dogeLabs.disconnect();
  } catch (error) {
    console.error('Failed to disconnect DogeLabs Wallet:', error);
    return null;
  }
};

// Unified connect wallet function to choose between MyDoge and DogeLabs
export const connectWallet = async (walletProvider) => {
  switch (walletProvider) {
    case DOGELABS_WALLET:
      return await connectDogeLabsWallet();
    case MYDOGE_WALLET:
      return await connectMyDogeWallet();
    default:
      throw new Error(`Unknown wallet provider: ${walletProvider}`);
  }
};

// Function to get the wallet address based on the provider
export async function getWalletAddress(walletProvider) {
  switch (walletProvider) {
    case DOGELABS_WALLET:
      return await connectDogeLabsWallet();
    case MYDOGE_WALLET:
      return await connectMyDogeWallet();
    default:
      return '';
  }
}

// Function to send DOGE using the specified wallet provider
export async function sendDoge(walletProvider, address, dogeAmount) {
  switch (walletProvider) {
    case DOGELABS_WALLET:
      return await sendDogeFromDogeLabs(dogeAmount, address);
    case MYDOGE_WALLET:
      return await sendDogeFromMyDoge(dogeAmount, address);
    default:
      throw new Error(`Sending DOGE not supported for ${walletProvider}`);
  }
}

// Function to get the balance of the connected wallet
export async function getWalletBalance(walletProvider) {
  switch (walletProvider) {
    case DOGELABS_WALLET:
      return await getDogeLabsBalance();
    case MYDOGE_WALLET:
      return await getMyDogeBalance();
    default:
      throw new Error(`Getting balance not supported for ${walletProvider}`);
  }
}

// Function to disconnect the wallet
export const disconnectWallet = async (walletProvider) => {
  switch (walletProvider) {
    case DOGELABS_WALLET:
      return await disconnectDogeLabsWallet();
    case MYDOGE_WALLET:
      return await disconnectMyDogeWallet();
    default:
      throw new Error(`Disconnecting not supported for ${walletProvider}`);
  }
};
