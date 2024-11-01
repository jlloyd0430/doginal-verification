import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connectWallet, DOGELABS_WALLET, MYDOGE_WALLET } from '../wallet';
import './Dashboard.css'; // Import the new CSS file

const Dashboard = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [discordID, setDiscordID] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        })
        .catch((error) => console.error("Failed to fetch Discord user info:", error));
    }
  }, []);

  const handleWalletConnect = async (selectedWalletProvider) => {
    setWalletProvider(selectedWalletProvider);
    try {
      const walletInfo = await connectWallet(selectedWalletProvider);
      if (walletInfo) {
        setWalletAddress(walletInfo);
        logUserData(walletInfo);
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const logUserData = async (walletAddress) => {
    if (!discordID) {
      console.error("Discord ID not set. Please log in.");
      return;
    }

    try {
      await axios.post('https://doginal-verification-be.onrender.com/api/users/log-user-data', {
        discordID,
        walletAddress,
      });
      console.log('User data logged successfully');
    } catch (error) {
      console.error('Error logging user data:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Connect Your Wallet</h1>
      {discordID ? (
        !walletAddress ? (
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
              </div>
            )}
          </div>
        ) : (
          <div>
            <p>Connected Wallet: {walletAddress}</p>
          </div>
        )
      ) : (
        <p>Please log in with Discord first.</p>
      )}
    </div>
  );
};

export default Dashboard;
