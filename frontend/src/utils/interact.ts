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
                adress: "",
                status: "Uff...Error: " + err.message,
            }
        }
    } else {
        return {
            adress: "",
            status: "You must install MetaMask in your Browser",
        }
    }
}

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (addressArray.length > 0) {
                return {
                    adress: addressArray[0],
                    status: "",
                };
            } else {
                return {
                    adress: "",
                    status: "🦊 Connect to Metamask using the top right button.",
                };
            }
        } catch (err: any) {
            return {
                adress: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            adress: "",
            status: "You must install MetaMask.",
        }
    }
};
