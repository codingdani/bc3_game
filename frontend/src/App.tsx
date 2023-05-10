import { stringify } from 'querystring';
import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import CreateGame from './Screens/CreateGame';
import CurrentOpenGames from './Screens/CurrentOpenGames';
import EnterGame from './Screens/EnterGame';
import HomeScreen from './Screens/HomeScreen';
import StartGame from './Screens/StartGame';
import { connectWallet, infuraKey, getCurrentWalletConnected } from "./utils/interact";


function App() {

  const [walletAddress, setWallet] = useState<string>("");

  const connectWalletPressed = async () => {
    const walletResponse: any = await connectWallet();
    if (typeof walletResponse.adress == 'string') {
      setWallet(walletResponse.adress);
    }
  };

  async function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: any) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        }
        else {
          setWallet("");
        }
      });
    };
  }

  async function fetchWallet() {
    const { adress } = await getCurrentWalletConnected();
    setWallet(adress);
  }

  useEffect(() => {
    fetchWallet();
    addWalletListener();
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
