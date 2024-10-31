let myDogeMask = null;

// Initialize the MyDoge Wallet listener
window.addEventListener(
  'doge#initialized',
  () => {
    myDogeMask = window.doge;
  },
  { once: true }
);

export const connectMyDogeWallet = async () => {
  if (!myDogeMask || !myDogeMask.isMyDoge) {
    alert("Please install the MyDoge Wallet extension to connect.");
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

export const getBalance = async () => {
  try {
    const balanceRes = await myDogeMask.getBalance();
    console.log('Balance result:', balanceRes);
    return balanceRes;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return null;
  }
};

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
