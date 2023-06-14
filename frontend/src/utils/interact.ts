//dotenv bug with typescript??
const infuraKey = "b6b652a41f604aadb527654f04bed96c";
//const infuraKey = process.env.REACT_APP_INFURA_KEY;
const gameContractABI = require('../guessing_game_abi.json');
const factoryContractABI = require('../factory_abi.json');
const factoryAdress = "0x10B9221A76200e66ff29e05803Dd6428D99cd182";

const Web3 = require('web3');
const web3 = new Web3(
    new Web3.providers.WebsocketProvider(`wss://sepolia.infura.io/ws/v3/${infuraKey}`)
);

//CONTRACT INSTANCES
const factoryContract = new web3.eth.Contract(
    factoryContractABI,
    factoryAdress,
);
export const createGameContractInstance = (address: string) => {
    return new web3.eth.Contract(
        gameContractABI,
        address,
    );
}

//FETCH OPEN GAMES
const getAllGameMasters = async () => {
    return await factoryContract.methods.getMasters().call();
}
export const getAllCurrentGames = async () => {
    const allGameMasters: string[] = await getAllGameMasters();
    const gameArray = [];
    for (let i = 0; i < allGameMasters.length; i++) {
        const allGames = await factoryContract.methods.getAllActiveGames(allGameMasters[i]).call();
        gameArray.push(...allGames);
    };
    return gameArray;
}

//GAME INTERACTION
export const createGame = async (
    address: string,
    minGuess: number,
    maxGuess: number,
    playerCount: number,
    fee: number) => {
    if (!window.ethereum || address === null || address === undefined) {
        return {
            confirmed: false,
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        };
    };
    const transactionParams = {
        to: factoryAdress,
        from: address,
        data: factoryContract.methods.createGame(
            minGuess,
            maxGuess,
            playerCount,
            web3.utils.toWei(fee.toString(), "ether")
        ).encodeABI(),
    };
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParams],
        });
        return {
            confirmed: true,
            status: `transaction sent. View it under https://sepolia.etherscan.io/tx/${txHash}`
        };
    } catch (error: any) {
        return {
            confirmed: false,
            status: "There was an Error: " + error.message
        };
    };
}

export const startRevealPhase = async (contractAddress: string, wallet: string) => {
    if (!window.ethereum || wallet === null || wallet === undefined) {
        return {
            confirmed: false,
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        };
    };
    const contract = createGameContractInstance(contractAddress);
    const transactionParams = {
        to: contractAddress,
        from: wallet,
        data: contract.methods.startRevealPhase().encodeABI(),
    }
    try {
        await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParams],
        });
        return {
            confirmed: true,
        }
    } catch (err: any) {
        console.log("Failed, so ist die schreibweise falsch")
        return {
            confirmed: false
        }
    }
}

export const startGame = async (contractAddress: string, wallet: string) => {
    if (!window.ethereum || wallet === null || wallet === undefined) {
        return {
            confirmed: false,
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        };
    };
    const contract = createGameContractInstance(contractAddress);
    const transactionParams = {
        to: contractAddress,
        from: wallet,
        data: contract.methods.finishGame().encodeABI(),
    }
    try {
        await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParams],
        });
        return {
            confirmed: true,
        }
    } catch (err: any) {
        console.log("Failed, so ist die schreibweise falsch")
        return {
            confirmed: false
        }
    }
}

export const getGameDetails = async (address: string) => {
    const contract = createGameContractInstance(address);
    const contractRules = await contract.methods.RULES().call();
    const entryFeeFromWei = web3.utils.fromWei(contractRules.entryFee.toString(), "ether");
    contractRules.entryFee = entryFeeFromWei;
    return contractRules;
}

export const getCurrentPlayerCount = async (address: string) => {
    const contract = createGameContractInstance(address);
    return await contract.methods.getPlayerCount().call() as number;
}

export const getRevealedPlayerCount = async (address: string) => {
    const contract = createGameContractInstance(address);
    return await contract.methods.revealedPlayers().call() as number;
}

export const enterGame = async (
    contractAddress: string,
    wallet: string,
    guess: number,
    salt: number) => {
    if (!window.ethereum || wallet === null || wallet === undefined) {
        return {
            confirmed: false,
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        };
    };
    const _commitHash = web3.utils.soliditySha3(guess, salt);
    const contract = createGameContractInstance(contractAddress);
    const gameRules = await contract.methods.RULES().call();
    const transactionParams = {
        to: contractAddress,
        from: wallet,
        data: contract.methods.commitHash(_commitHash).encodeABI(),
        value: web3.utils.toHex(gameRules.entryFee.toString()),
    };
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParams]
        });
        return {
            confirmed: true,
            status: `transaction sent. View it under https://sepolia.etherscan.io/tx/${txHash}`
        };
    } catch (error: any) {
        return {
            confirmed: false,
            status: "There was an Error: " + error.message
        };
    };
}

export const revealGuess = async (
    contractAddress: string,
    wallet: string,
    guess: number,
    salt: number) => {
    if (!window.ethereum || wallet === null || wallet === undefined) {
        return {
            confirmed: false,
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        };
    };
    const contract = createGameContractInstance(contractAddress);
    const transactionParams = {
        to: contractAddress,
        from: wallet,
        data: contract.methods.reveal(guess, salt).encodeABI(),
    }
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParams],
        });
        return {
            confirmed: true,
            status: `transaction sent. View it under https://sepolia.etherscan.io/tx/${txHash}`
        };
    } catch (error: any) {
        return {
            confirmed: false,
            status: "There was an Error: " + error.message
        };
    };
}

export const claimWinnings = async (contractAddress: string, wallet: string) => {
    if (!window.ethereum || wallet === null || wallet === undefined) {
        return {
            confirmed: false,
            status: "💡 Connect your Metamask wallet to update the message on the blockchain."
        };
    };
    const contract = createGameContractInstance(contractAddress);
    const transactionsParams = {
        to: contractAddress,
        from: wallet,
        data: contract.methods.payout().encodeABI(),
    }
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionsParams],
        });
        return {
            confirmed: true,
            status: `transaction sent. View it under https://sepolia.etherscan.io/tx/${txHash}`
        }
    } catch (err: any) {
        console.log("Error: ", err.message)
        return {
            confirmed: false,
        }
    }
}

//INFO FOR STATE TO RENDER PAGES ACCORDINGLY
export const checkForParticipation = async (address: string, contractAddress: string) => {
    const contract = createGameContractInstance(contractAddress);
    const playersArray: string[] = await contract.methods.getPlayers().call();
    const lowerCaseArray: string[] = [];
    playersArray.map((string) => {
        lowerCaseArray.push(string.trim().toLowerCase());
    });
    return lowerCaseArray.includes(address.trim().toLowerCase()) as boolean;
}

export const checkIfPlayerHasRevealed = async (address: string, contractAddress: string) => {
    const contract = createGameContractInstance(contractAddress);
    return contract.methods.getIfPlayerRevealed().call({ from: address }) as boolean;
}

export const checkIfGameMaster = async (address: string, contractAddress: string) => {
    const contract = createGameContractInstance(contractAddress);
    const contractOwner: string = await contract.methods.owner().call();
    return contractOwner.trim().toLowerCase() === address.trim().toLowerCase() ? true : false;
}

export const checkIfGameStarted = async (contractAddress: string) => {
    const contract = createGameContractInstance(contractAddress);
    return await contract.methods.isStarted().call() as boolean;
}

//WALLET FUNCTIONALITY
export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray: string[] = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const obj = {
                status: "Connected",
                address: addressArray[0],
            };
            return obj;
        } catch (err: any) {
            return {
                address: "",
                status: "Uff...Error: " + err.message,
            };
        };
    } else {
        return {
            address: "",
            status: "You must install MetaMask in your Browser",
        };
    };
}

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray: string[] = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                };
            } else {
                return {
                    address: "",
                    status: "🦊 Connect to Metamask using the top right button.",
                };
            };
        } catch (err: any) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        };
    } else {
        return {
            address: "",
            status: "You must install MetaMask.",
        };
    };
}
