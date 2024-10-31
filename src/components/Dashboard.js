import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connectMyDogeWallet } from '../wallet';
import './Dashboard.css'; // Import the new CSS file

const Dashboard = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [discordID, setDiscordID] = useState(null);

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

  const handleWalletConnect = async () => {
    const walletInfo = await connectMyDogeWallet();
    if (walletInfo) {
      setWalletAddress(walletInfo.address);
      logUserData(walletInfo.address);
    }
  };

  const logUserData = async (walletAddress) => {
    if (!discordID) {
      console.error("Discord ID not set. Please log in.");
      return;
    }
  
    try {
      await axios.post('http://localhost:5000/api/users/log-user-data', {
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
      <h1>Connect Your MyDoge Wallet</h1>
      {discordID ? (
        !walletAddress ? (
          <button onClick={handleWalletConnect} className="wallet-button">Connect MyDoge Wallet</button>
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
