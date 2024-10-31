import React from 'react';
import './DiscordLogin.css'; // Import the new CSS file

const DiscordLogin = () => {
  const discordLoginUrl = `${process.env.REACT_APP_DISCORD_AUTH_URL}?client_id=${process.env.REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REACT_APP_DISCORD_REDIRECT_URI)}&response_type=token&scope=identify`;

  return (
    <div className="login-container">
      <h2>Log in with Discord</h2>
      <a href={discordLoginUrl} className="login-button">Login with Discord</a>
    </div>
  );
};

export default DiscordLogin;
