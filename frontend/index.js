 const connectWeb3Button = document.getElementById('connect_btn');
 const walletId = document.getElementById('walletId');
connectWeb3Button.addEventListener('click', connectWallet);
 
function connectWallet() {
  if (typeof window.ethereum !== undefined) {
    ethereum
    .request( {method: "eth_requestAccounts"})
    .then((accounts) => {
      const account = accounts[0]
      walletId.innerHTML = `${account}`;
    })
  }
  else window.open("https://https://metamask.io/download/", "_blank");
}
 