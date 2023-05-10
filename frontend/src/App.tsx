import React from 'react';
import logo from './logo.svg';
import CreateGame from './Screens/CreateGame';
import HomeScreen from './Screens/HomeScreen';
import StartGame from './Screens/StartGame';

function App() {
  return (
    <div className="App">
      <button id="connectwalletbtn" className="btn">Connect Wallet</button>
      <StartGame></StartGame>
    </div>
  );
}

export default App;
