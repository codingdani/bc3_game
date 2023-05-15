export const infuraKey = "b6b652a41f604aadb527654f04bed96c";
const gameContractABI = require('../guessing_game_abi.json');
const factoryContractABI = require('../factory_abi.json');

const factoryAdress: string = "0xFDB5BAe7AB7e73214355e38cFe99318b0900eDeC";
const gameAdress: string = "0xD4F04D3433E06fD64452D667984a7A4bF16224bF";

const Web3 = require('web3');

const web3 = new Web3(
    new Web3.providers.HttpProvider('https://sepolia.infura.io/v3/b6b652a41f604aadb527654f04bed96c')
);

//CONTRACTS
const factoryContract = new web3.eth.Contract(
    factoryContractABI,
    factoryAdress,
);

const getAllGameMasters = async () => {
    return await factoryContract.methods.getMasters().call();
}
export const getAllCurrentGames = async () => {
    const allGameMasters: string[] = await getAllGameMasters();
    const gameArray = []
    for (let i = 0; i < allGameMasters.length; i++) {
        const allGames = await factoryContract.methods.getAllActiveGames(allGameMasters[i]).call();
        gameArray.push(...allGames);
    }
    return gameArray;
}

export const createGame = async (
    adress: string,
    minGuess: number,
    maxGuess: number,
    playerCount: number,
    fee: number) => {
    if (!window.ethereum || adress === null || adress == undefined) {
        return {
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        }
    }
    const transactionParams = {
        to: factoryAdress,
        from: adress,
        data: factoryContract.methods.createGame(minGuess, maxGuess, playerCount, fee).encodeABI(),
    }
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParams],
        });
        return {
            status: `transaction sent. View it under https://sepolia.etherscan.io/tx/${txHash}`
        }
    } catch (error: any) {
        return {
            status: "There was an Error: " + error.message
        }
    }
}

const enterAGame = async (contract: string, wallet: string, guess: number) => {
    if (!window.ethereum || wallet === null || wallet == undefined) {
        return {
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        }
    }
    const gameContract = new web3.eth.Contract(
        gameContractABI,
        contract,
    );
    const transactionParams = {
        to: contract,
        from: wallet,
        data: gameContract.methods.enterGuess(guess).encodeABI()
    }
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParams]
        })
        return {
            status: `transaction sent. View it under https://sepolia.etherscan.io/tx/${txHash}`
        }
    } catch (error: any) {
        return {
            status: "There was an Error: " + error.message
        }
    }
}

export const getGameDetails = async (adress: string) => {
    const contract = new web3.eth.Contract(
        gameContractABI,
        adress,
    )
    const contractRules = await contract.methods.RULES().call();
    return contractRules;

}

//WALLET
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
