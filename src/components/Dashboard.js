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
  const [connectedWallets, setConnectedWallets] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.replace('#', '?')).get('access_token');

    if (token) {
      axios
        .get('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setDiscordID(response.data.id);
          fetchConnectedWallets(response.data.id); // Fetch previously connected wallets
        })
        .catch((error) => {
          console.error('Failed to fetch Discord user info:', error);
          setVerificationMessage('Failed to fetch Discord user info.');
        });
    }
  }, []);

  const fetchConnectedWallets = async (discordID) => {
    try {
      const response = await axios.get(
        `https://doginal-verification-be.onrender.com/api/users/${discordID}`
      );
      setConnectedWallets(response.data.walletAddresses || []);
    } catch (error) {
      console.error('Error fetching connected wallets:', error.response?.data || error.message);
    }
  };

  const handleWalletConnect = async (selectedWalletProvider) => {
    setWalletProvider(selectedWalletProvider);
    try {
      const walletInfo = await connectWallet(selectedWalletProvider);
      if (walletInfo?.address) {
        setWalletAddress(walletInfo.address);
        await logUserData(walletInfo.address, selectedWalletProvider);
        setVerificationMessage('Wallet Connected Successfully!');
        fetchConnectedWallets(discordID); // Refresh connected wallets
      } else {
        setVerificationMessage('Wallet connection failed. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setVerificationMessage('Error connecting to wallet.');
    }
  };

  const logUserData = async (address, provider) => {
    if (!discordID) {
      console.error('Discord ID not set. Please log in.');
      setVerificationMessage('Error: Discord not connected.');
      return;
    }

    try {
      await axios.post('https://doginal-verification-be.onrender.com/api/users/log-user-data', {
        discordID,
        walletAddress: address,
        provider,
      });
    } catch (error) {
      console.error('Error logging user data:', error.response?.data || error.message);
    }
  };

  const handleMobileVerification = () => {
    setMobileVerification(true);
    setVerificationMessage('');
  };
  
const startVerificationProcess = async () => {
  if (!/^[Dd][a-zA-Z0-9]{33}$/.test(tempAddress)) {
    setVerificationMessage('Invalid wallet address format.');
    return;
  }

  const amount = parseFloat((Math.random() * 0.9 + 0.1).toFixed(1));
  setRandomAmount(amount);
  setIsVerifying(true);

  // Save state to localStorage
  localStorage.setItem('verificationState', JSON.stringify({ walletAddress: tempAddress, amount }));

  try {
    const response = await axios.post(
      'https://doginal-verification-be.onrender.com/api/users/validate-transaction',
      { walletAddress: tempAddress.trim(), amount }
    );

    if (response.data.success) {
      setVerificationMessage('Wallet Verified Successfully!');
      setWalletAddress(tempAddress);
      await logUserData(tempAddress.trim(), 'Mobile Verification');
      fetchConnectedWallets(discordID); // Refresh connected wallets
    } else {
      setVerificationMessage('Verification failed. Please try again.');
    }
  } catch (error) {
    setVerificationMessage(error.response?.data?.error || 'An error occurred. Please try again.');
  } finally {
    setIsVerifying(false);
    setMobileVerification(false);
  }
};

// Restore state on load
useEffect(() => {
  const savedState = localStorage.getItem('verificationState');
  if (savedState) {
    const { walletAddress, amount } = JSON.parse(savedState);
    setTempAddress(walletAddress);
    setRandomAmount(amount);
    setIsVerifying(true);

    // Automatically resume validation
    axios
      .post('https://doginal-verification-be.onrender.com/api/users/validate-transaction', {
        walletAddress,
        amount,
      })
      .then((response) => {
        if (response.data.success) {
          setVerificationMessage('Wallet Verified Successfully!');
          setWalletAddress(walletAddress);
          logUserData(walletAddress, 'Mobile Verification');
          fetchConnectedWallets(discordID);
        } else {
          setVerificationMessage('Verification failed. Please try again.');
        }
      })
      .catch((error) => {
        setVerificationMessage(error.response?.data?.error || 'An error occurred. Please try again.');
      })
      .finally(() => {
        setIsVerifying(false);
        localStorage.removeItem('verificationState');
      });
  }
}, []);


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getIcon = (provider) => {
    switch (provider.toLowerCase()) {
      case 'mydoge':
        return <img src={myDogeIcon} alt="MyDoge" className="wallet-icon" />;
      case 'dogelabs':
        return <img src={dogeLabsIcon} alt="DogeLabs" className="wallet-icon" />;
      case 'mobile':
        return <FaMobileAlt className="wallet-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Connect Your Wallet</h1>
      {discordID ? (
        <>
          <div className="connected-wallets-container">
            <h2>Previously Connected Wallets</h2>
            {connectedWallets.length > 0 ? (
              connectedWallets.map((wallet, index) => (
                <div className="wallet-box" key={index}>
                  <div className="wallet-details">
                    {getIcon(wallet.provider)}
                    <div>
                      <p>
                        <strong>Provider:</strong> {wallet.provider}
                      </p>
                      <p>
                        <strong>Address:</strong> {wallet.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No wallets connected yet.</p>
            )}
          </div>

          <div className="wallet-button-group">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="wallet-button"
            >
              Select Wallet
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button
                  onClick={() => handleWalletConnect(MYDOGE_WALLET)}
                  className="dropdown-item"
                >
                  <img src={myDogeIcon} alt="MyDoge Icon" className="wallet-icon" /> MyDoge Wallet
                </button>
                <button
                  onClick={() => handleWalletConnect(DOGELABS_WALLET)}
                  className="dropdown-item"
                >
                  <img src={dogeLabsIcon} alt="DogeLabs Icon" className="wallet-icon" /> DogeLabs Wallet
                </button>
                <button
                  onClick={handleMobileVerification}
                  className="dropdown-item"
                >
                  <FaMobileAlt className="wallet-icon" /> Mobile Verification
                </button>
              </div>
            )}
          </div>
        </>
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
            autoComplete="off"
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
