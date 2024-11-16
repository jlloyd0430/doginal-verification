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
      const walletInfo = await connectWallet(selectedWalletProvider);
      if (walletInfo?.address) {
        setWalletAddress(walletInfo.address);
        await logUserData(walletInfo.address, selectedWalletProvider);
        setVerificationMessage("Wallet Connected Successfully!");
      } else {
        setVerificationMessage("Wallet connection failed. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setVerificationMessage("Error connecting to wallet.");
    }
  };

  const logUserData = async (address, provider) => {
    if (!discordID) {
      console.error("Discord ID not set. Please log in.");
      return;
    }
    try {
      await axios.post('https://doginal-verification-be.onrender.com/api/users/log-user-data', {
        discordID,
        walletAddress: address,
        provider,
      });
      console.log('User data logged successfully');
    } catch (error) {
      console.error('Error logging user data:', error);
    }
  };

  const handleMobileVerification = () => {
    setMobileVerification(true);
    setVerificationMessage('');
  };

  const startVerificationProcess = async () => {
    if (!tempAddress) {
      alert('Please enter a valid wallet address.');
      return;
    }

    const amount = parseFloat((Math.random() * 0.9 + 0.1).toFixed(1)); // Random between 0.1 and 1.0 DOGE
    setRandomAmount(amount);
    setIsVerifying(true);

    try {
      const response = await axios.post('https://doginal-verification-be.onrender.com/api/users/validate-transaction', {
        walletAddress: tempAddress,
        amount,
      });

      if (response.data.success) {
        setVerificationMessage("Wallet Verified Successfully!");
        setWalletAddress(tempAddress);
      } else {
        setVerificationMessage("Transaction validation failed. Try again.");
      }
    } catch (error) {
      console.error('Error during transaction validation:', error);
      setVerificationMessage("An error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
      setMobileVerification(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
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
                Send <b>{randomAmount} DOGE</b>{" "}
                <FaCopy onClick={() => copyToClipboard(randomAmount)} className="copy-icon" />
              </p>
              <p>to address: {tempAddress}</p>
            </div>
          )}
        </div>
      )}

      {isVerifying && <p>Verifying transaction...</p>}
      {verificationMessage && <p>{verificationMessage}</p>}
    </div>
  );
};

export default Dashboard;
