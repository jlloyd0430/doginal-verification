import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connectWallet, DOGELABS_WALLET, MYDOGE_WALLET } from '../wallet';
import './Dashboard.css';
import myDogeIcon from '../assets/mydoge-icon.svg';
import dogeLabsIcon from '../assets/dogelabs.svg';
import { FaMobileAlt, FaCopy } from 'react-icons/fa';

const Dashboard = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [discordID, setDiscordID] = useState('');
  const [walletProvider, setWalletProvider] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileVerification, setMobileVerification] = useState(false);
  const [randomAmount, setRandomAmount] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  // Fetch Discord user data via OAuth
  useEffect(() => {
    try {
      const hash = window.location.hash;
      const token = new URLSearchParams(hash.replace('#', '?')).get('access_token');

      if (token) {
        console.log('Access token retrieved:', token);
        fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Discord API error: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            setDiscordID(data.id);
            console.log('Discord ID fetched:', data.id);
          })
          .catch((error) => {
            console.error('Error fetching Discord user info:', error);
          });
      } else {
        console.warn('No access token found in URL.');
      }
    } catch (error) {
      console.error('Error handling OAuth redirect:', error);
    }
  }, []);

  // Handle wallet connection
  const handleWalletConnect = async (selectedWalletProvider) => {
    setWalletProvider(selectedWalletProvider);
    try {
      const walletInfo = await connectWallet(selectedWalletProvider);
      if (walletInfo?.address) {
        setWalletAddress(walletInfo.address);
        await logUserData(walletInfo.address, selectedWalletProvider);
        setVerificationMessage('Wallet Connected Successfully!');
      } else {
        setVerificationMessage('Wallet connection failed. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setVerificationMessage('Error connecting to wallet.');
    }
  };

  // Log user data to the backend
  const logUserData = async (address, provider) => {
    if (!discordID) {
      console.error('Discord ID not set. Please log in.');
      setVerificationMessage('Error: Discord not connected.');
      return;
    }

    try {
      const response = await axios.post('https://doginal-verification-be.onrender.com/api/users/log-user-data', {
        discordID,
        walletAddress: address,
        provider,
      });
      console.log('User data logged successfully:', response.data);
      setVerificationMessage('Wallet Connected Successfully!');
    } catch (error) {
      console.error('Error logging user data:', error.response?.data || error.message);
      setVerificationMessage('Failed to log wallet. Try again.');
    }
  };

  // Start mobile verification process
  const handleMobileVerification = () => {
    setMobileVerification(true);
    setVerificationMessage('');
  };

  // Validate transaction on the backend
  const startVerificationProcess = async () => {
    if (!tempAddress || tempAddress.trim() === '') {
      setVerificationMessage('Wallet address is missing or invalid.');
      console.error('Wallet address is missing or invalid.');
      return;
    }

    const amount = parseFloat((Math.random() * 0.9 + 0.1).toFixed(1)); // Random between 0.1 and 1.0 DOGE
    if (isNaN(amount)) {
      setVerificationMessage('Failed to generate a valid amount. Please try again.');
      console.error('Generated amount is invalid:', amount);
      return;
    }

    console.log('Sending payload:', { walletAddress: tempAddress, amount });

    setRandomAmount(amount);
    setIsVerifying(true);

    try {
      const response = await axios.post('https://doginal-verification-be.onrender.com/api/users/validate-transaction', {
        walletAddress: tempAddress,
        amount,
      });

      console.log('Validation response:', response.data);

      if (response.data.success) {
        setVerificationMessage('Wallet Verified Successfully!');
        setWalletAddress(tempAddress); // Update walletAddress
        setMobileVerification(false); // Close mobile verification UI
      } else {
        setVerificationMessage('Transaction validation failed. Try again.');
        console.error('Transaction validation failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error during transaction validation:', error.response?.data || error.message);
      setVerificationMessage(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="dashboard-container">
      <h1>Connect Your Wallet</h1>
      {discordID ? (
        walletAddress ? (
          <div>
            <p>Connected Wallet: {walletAddress}</p>
            {verificationMessage && <p>{verificationMessage}</p>}
          </div>
        ) : (
          <div className="wallet-button-group">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="wallet-button">
              Select Wallet
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => handleWalletConnect(MYDOGE_WALLET)} className="dropdown-item">
                  <img src={myDogeIcon} alt="MyDoge Icon" className="wallet-icon" /> MyDoge Wallet
                </button>
                <button onClick={() => handleWalletConnect(DOGELABS_WALLET)} className="dropdown-item">
                  <img src={dogeLabsIcon} alt="DogeLabs Icon" className="wallet-icon" /> DogeLabs Wallet
                </button>
                <button onClick={handleMobileVerification} className="dropdown-item">
                  <FaMobileAlt className="wallet-icon" /> Mobile Verification
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
          {randomAmount && (
            <div>
              <p>
                Send <b>{randomAmount} DOGE</b>{' '}
                <FaCopy onClick={() => copyToClipboard(randomAmount)} className="copy-icon" />
              </p>
              <p>to address: {tempAddress}</p>
            </div>
          )}
        </div>
      )}

      {isVerifying && <p>Verifying transaction... Please wait.</p>}
      {verificationMessage && <p>{verificationMessage}</p>}
    </div>
  );
};

export default Dashboard;
