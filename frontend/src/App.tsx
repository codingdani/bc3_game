import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateGame from './Screens/CreateGame';
import CurrentOpenGames from './Screens/CurrentOpenGames';
import EnterGame from './Screens/EnterGame';
import HomeScreen from './Screens/HomeScreen';
import PlayingScreen from './Screens/PlayingScreen';
import StartGame from './Screens/StartGame';
import WinnerScreen from './Screens/WinnerScreen';
import { connectWallet, infuraKey, getCurrentWalletConnected } from "./utils/interact";


function App() {

  const [walletAddress, setWallet] = useState<string>();

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
        {walletAddress && walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/creategame" element={<CreateGame />} />
        <Route path="/entergame/:adress" element={<EnterGame />} />
        <Route path="/opengames" element={<CurrentOpenGames />} />
        <Route path="/enteredgame" element={<PlayingScreen />} />
      </Routes>
    </div>
  );
}

export default App;
