import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connectWallet, DOGELABS_WALLET, MYDOGE_WALLET } from '../wallet';
import './Dashboard.css';

const Dashboard = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [discordID, setDiscordID] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileVerification, setMobileVerification] = useState(false);
  const [randomAmount, setRandomAmount] = useState(null);
  const [timer, setTimer] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tempAddress, setTempAddress] = useState(''); // Temporary address for mobile verification

  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.replace("#", "?")).get('access_token');

    if (token) {
      fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setDiscordID(data.id);
          console.log("Discord ID fetched:", data.id);
        })
        .catch((error) => console.error("Failed to fetch Discord user info:", error));
    }
  }, []);

  const handleWalletConnect = async (selectedWalletProvider) => {
    setWalletProvider(selectedWalletProvider);
    try {
      console.log(`Attempting to connect to ${selectedWalletProvider} wallet...`);
      const walletInfo = await connectWallet(selectedWalletProvider);
      console.log('Wallet connection info:', walletInfo);
      if (walletInfo && walletInfo.address) {
        setWalletAddress(walletInfo.address);
        await logUserData(walletInfo.address, selectedWalletProvider);
      } else {
        console.error("Wallet connection failed or address is missing.");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const logUserData = async (address, provider) => {
    if (!discordID) {
      console.error("Discord ID not set. Please log in.");
      return;
    }

    try {
      const response = await axios.post('https://doginal-verification-be.onrender.com/api/users/log-user-data', {
        discordID,
        walletAddress: address,
        provider,
      });
      if (response.status === 200) {
        console.log('User data logged successfully');
      } else {
        console.error(`Failed to log user data. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error logging user data:', error);
    }
  };

  const handleMobileVerification = () => {
    console.log("Initiating mobile verification");
    setMobileVerification(true);
  };

  const startVerificationProcess = async () => {
    const randomAmount = parseFloat((Math.random() * 0.01).toFixed(4)); // Generate random amount between 0.00001 - 0.01 DOGE
    setRandomAmount(randomAmount);
    setTimer(Date.now() + 30 * 60 * 1000); // Set timer to 30 minutes from current time
    setIsVerifying(true);

    console.log(`Mobile verification started. Requesting ${randomAmount} DOGE to be sent to ${tempAddress}`);
    alert(`Please send exactly ${randomAmount} DOGE from your wallet (${tempAddress}) to the same address within the next 30 minutes.`);

    validateTransaction(tempAddress, randomAmount);
  };

  const validateTransaction = async (address, amount) => {
    console.log(`Starting transaction validation for address: ${address} with amount: ${amount}`);
    const interval = setInterval(async () => {
      try {
        const result = await axios.get(`https://svc.blockdaemon.com/universal/v1/dogecoin/mainnet/account/${address}/utxo`, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.REACT_APP_BLOCKDAEMON_API_KEY,
          },
        });

        const transactions = result.data.data;
        console.log(`Transactions fetched from Blockdaemon for ${address}:`, transactions);

        for (const tx of transactions) {
          if (tx.value === amount * 100000000 && tx.mined.confirmations >= process.env.REACT_APP_TX_CONFIRMATIONS) {
            clearInterval(interval);
            console.log(`Transaction confirmed for ${address} with TX ID: ${tx.mined.tx_id}`);
            alert('Wallet verified successfully!');
            setWalletAddress(address); // Set the verified address to walletAddress
            await logUserData(address, 'mobile'); // Log only after verification
            setIsVerifying(false);
            setMobileVerification(false);
            return;
          }
        }

        if (Date.now() > timer) {
          clearInterval(interval);
          console.warn('Verification timed out for address:', address);
          alert('Verification timed out. Please try again.');
          setIsVerifying(false);
          setMobileVerification(false);
        }
      } catch (error) {
        console.error('Error validating transaction:', error);
      }
    }, 10000); // Check every 10 seconds
  };

  return (
    <div className="dashboard-container">
      <h1>Connect Your Wallet</h1>
      {discordID ? (
        walletAddress ? (
          <div>
            <p>Connected Wallet: {walletAddress}</p>
          </div>
        ) : (
          <div className="wallet-button-group">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="wallet-button">
              Select Wallet
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => handleWalletConnect(MYDOGE_WALLET)} className="dropdown-item">
                  Connect MyDoge Wallet
                </button>
                <button onClick={() => handleWalletConnect(DOGELABS_WALLET)} className="dropdown-item">
                  Connect DogeLabs Wallet
                </button>
                <button onClick={handleMobileVerification} className="dropdown-item">
                  Mobile Verification
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        <p>Please log in with Discord first.</p>
      )}

      {mobileVerification && (
        <div className="mobile-verification">
          <h2>Mobile Verification</h2>
          <p>Enter your wallet address for verification:</p>
          <input
            type="text"
            placeholder="Enter wallet address"
            value={tempAddress}
            onChange={(e) => setTempAddress(e.target.value)}
          />
          <button onClick={startVerificationProcess}>Verify</button>
        </div>
      )}

      {isVerifying && (
        <div>
          <p>Please send exactly {randomAmount} DOGE to your wallet ({tempAddress}) within the next 30 minutes.</p>
          <p>Waiting for transaction confirmation...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
