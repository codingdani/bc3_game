// Get web3 instance and contract instance
async function init() {
    // Check if Web3 is injected
    if (typeof web3 === 'undefined') {
      return alert('Please install MetaMask to use this dApp!');
    }
  
    // Get contract instance
    const contractAddress = 'CONTRACT_ADDRESS';
    const abi = CONTRACT_ABI;
    const contract = new web3.eth.Contract(abi, contractAddress);
  
    // Get player's address
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const player = accounts[0];
  
    // Add event listeners to buttons
    document.getElementById('submit-guess').addEventListener('click', submitGuess);
    document.getElementById('claim-prize').addEventListener('click', claimPrize);
  
    // Update game status
    updateGameStatus();
  
    // Listen for events
    contract.events.GameEnded({}, updateGameStatus);
    contract.events.NewGuess({}, updateGameStatus);
  
    // Update game status function
    async function updateGameStatus() {
      // Get game status
      const gameStatus = await contract.methods.getGameStatus().call();
  
      // Update UI
      document.getElementById('closest-guess').innerHTML = gameStatus.closestGuess;
      document.getElementById('num-guesses').innerHTML = gameStatus.numGuesses;
  
      if (gameStatus.gameEnded) {
        document.getElementById('game-ended').innerHTML = 'Game ended!';
        document.getElementById('claim-prize').style.display = 'block';
      } else {
        document.getElementById('game-ended').innerHTML = '';
        document.getElementById('claim-prize').style.display = 'none';
      }
  
      if (gameStatus.playerGuessed) {
        document.getElementById('guess-form').style.display = 'none';
        document.getElementById('guess-confirmation').style.display = 'block';
        document.getElementById('player-guess').innerHTML = gameStatus.playerGuess;
      } else {
        document.getElementById('guess-form').style.display = 'block';
        document.getElementById('guess-confirmation').style.display = 'none';
      }
    }
  
    // Submit guess function
    async function submitGuess() {
      // Get user's input
      const guess = document.getElementById('guess-input').value;
  
      // Check if user's input is valid
      if (isNaN(guess) || guess < 1 || guess > 100) {
        return alert('Please enter a valid number between 1 and 100.');
      }
  
      // Submit guess
      const tx = await contract.methods.submitGuess(guess).send({ from: player });
  
      // Update UI
      updateGameStatus();
    }
  
    // Claim prize function
    async function claimPrize() {
      // Claim prize
      const tx = await contract.methods.claimPrize().send({ from: player });
  
      // Update UI
      updateGameStatus();
    }
  }
  
  // Call init function when window loads
  window.addEventListener('load', init);
  