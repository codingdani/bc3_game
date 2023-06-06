import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createGame, getCurrentWalletConnected } from "../utils/interact";

function CreateGame() {

    const [walletAdress, setWalletAdress] = useState<string>("")
    const [minPlayerCount, setMinPlayerCount] = useState<number>(0);
    const [minGuess, setMinGuess] = useState<number>(0);
    const [maxGuess, setMaxGuess] = useState<number>(0);
    const [entryFee, setEntryFee] = useState<number>(0);
    const navigate = useNavigate()

    async function fetchWallet() {
        const { address } = await getCurrentWalletConnected();
        setWalletAdress(address);
    }
    useEffect(() => {
        fetchWallet()
    }, []);

    const changeMinGuess = ({ target }: any) => {
        setMinGuess(target.value)
    }
    const changeMaxGuess = ({ target }: any) => {
        setMaxGuess(target.value)
    }
    const changeEntryFee = ({ target }: any) => {
        setEntryFee(target.value);
    }
    const changePlayerCount = ({ target }: any) => {
        setMinPlayerCount(target.value)
    }

    const submitForm = () => {
        if (walletAdress.length > 0 &&
            maxGuess > 0 &&
            minPlayerCount > 0 &&
            entryFee >= 0 &&
            minGuess < maxGuess) {
            createGame(walletAdress, minGuess, maxGuess, minPlayerCount, entryFee).then(() => navigate('/opengames'));
        } else {
            console.log("Pls fill the information correctly");
        }
    }

    return (
        <>
            <Link to="/">
                <button id="backbtn" className="btn">back</button>
            </Link>
            <h2>Enter your Rules</h2>
            <div className="textfield bordergold">
                <p>min. number of Players: </p>
                <input type={"number"} placeholder="Players" min={2} max={10} onChange={changePlayerCount}></input>
                <p>Range of Guess: </p>
                <div className="flex column">
                    <input type={"number"} placeholder="min bsp: 0" onChange={changeMinGuess}></input>
                    <input type={"number"} placeholder="max bsp: 100" onChange={changeMaxGuess}></input>
                </div>
                <p>Entry Fee: </p>
                <div className="flex transform">
                    <input type={"number"} placeholder="fee in ETH" id="entryfeeinput" onChange={changeEntryFee}></input>
                    <div id="eth_logo" className="positioned"></div>
                </div>
                <button className="btn margintp" onClick={() => submitForm()}>Create Game</button>
            </div>
        </>
    )
}

export default CreateGame