const infuraKey = "b6b652a41f604aadb527654f04bed96c";
const gameContractABI = require('../guessing_game_abi.json');
const factoryContractABI = require('../factory_abi.json');
const factoryAdress: string = "0x60A59e365386d1462e1700a70480a45a154551F6";

const Web3 = require('web3');
const web3 = new Web3(
    new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${infuraKey}`)
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
    if (!window.ethereum || adress === null || adress === undefined) {
        return {
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        }
    }
    const transactionParams = {
        to: factoryAdress,
        from: adress,
        data: factoryContract.methods.createGame(minGuess, maxGuess, playerCount, web3.utils.toWei(fee.toString(), "ether")).encodeABI(),
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

export const enterAGame = async (contract: string, wallet: string, guess: number, salt: number) => {
    if (!window.ethereum || wallet === null || wallet === undefined) {
        return {
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        }
    }
    const _hash = web3.utils.soliditySha3(guess, salt);
    const gameContract = await new web3.eth.Contract(
        gameContractABI,
        contract,
    )
    const gameRules = await gameContract.methods.RULES().call();
    const transactionParams = {
        to: contract,
        from: wallet,
        data: gameContract.methods.commitHash(_hash).encodeABI(),
        value: web3.utils.toHex(gameRules.entryFee.toString()),
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
    const entryFeeFromWei = web3.utils.fromWei(contractRules.entryFee.toString(), "ether");
    contractRules.entryFee = entryFeeFromWei
    return contractRules;
}

export const getCurrentPlayerCount = async (adress: string) => {
    const contract = new web3.eth.Contract(
        gameContractABI,
        adress,
    )
    const currentPlayerCount: number = await contract.methods.getPlayerCount().call();
    return currentPlayerCount;
}

export const getMyGuess = async (adress: string) => {
    const contract = new web3.eth.Contract(
        gameContractABI,
        adress,
    )
    const myGuess = await contract.methods.getMyGuess().call();
    console.log(myGuess)
    return myGuess;
}

export const checkForParticipation = async (address: string, contractAddress: string) => {
    const contract = new web3.eth.Contract(
        gameContractABI,
        contractAddress
    )
    const playersArray: string[] = await contract.methods.players().call();
    return playersArray.includes(address);
}

export const checkIfGameMaster = async (address: string, contractAddress: string) => {
    const contract = new web3.eth.Contract(
        gameContractABI,
        contractAddress,
    )
    const contractOwner: string = await contract.methods.owner().call();
    console.log("gamemaster", contractOwner);
    console.log("vergleichr", address);
    return contractOwner.trim().toLowerCase() === address.trim().toLowerCase() ? true : false;
}

//WALLET
export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const adressArray: string[] = await window.ethereum.request({
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
            const addressArray: string[] = await window.ethereum.request({
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
