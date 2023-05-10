import React, { useEffect } from 'react';
import logo from './logo.svg';
import CreateGame from './Screens/CreateGame';
import CurrentOpenGames from './Screens/CurrentOpenGames';
import EnterGame from './Screens/EnterGame';
import HomeScreen from './Screens/HomeScreen';
import StartGame from './Screens/StartGame';
import { infuraKey } from "./utils/interact";

function App() {

  useEffect(() => {

  }, []);

  return (
    <div className="App">
      <button id="connectwalletbtn" className="btn">Connect Wallet</button>
      <HomeScreen></HomeScreen>
    </div>
  );
}

export default App;
