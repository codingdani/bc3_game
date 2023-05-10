import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import CreateGame from './Screens/CreateGame';
import CurrentOpenGames from './Screens/CurrentOpenGames';
import EnterGame from './Screens/EnterGame';
import HomeScreen from './Screens/HomeScreen';
import StartGame from './Screens/StartGame';
import { connectWallet, infuraKey } from "./utils/interact";


function App() {

  const [walletAddress, setWallet] = useState<string>("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("No connection to the network."); //default message
  const [newMessage, setNewMessage] = useState("");


  const connectWalletPressed = async () => {
    const walletResponse: any = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.adress);
  };

  useEffect(() => {

  }, []);

  return (
    <div className="App">
      <button id="connectwalletbtn" className="btn" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
      <HomeScreen></HomeScreen>
    </div>
  );
}

export default App;
