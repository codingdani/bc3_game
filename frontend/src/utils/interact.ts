export const infuraKey = "b6b652a41f604aadb527654f04bed96c";

const Web3 = require('web3');

const web3 = new Web3(
    new Web3.providers.HttpProvider('https://sepolia.infura.io/v3/b6b652a41f604aadb527654f04bed96c')
);


export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const adressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const obj = {
                status: "Connected",
                adress: adressArray[0],
            }
            return obj
        } catch (err: any) {
            return {
                address: "",
                status: "Uff...Error: " + err.message,
            }
        }
    } else {
        return {
            address: "",
            status: "You must install MetaMask in your Browser",
        }
    }
}

