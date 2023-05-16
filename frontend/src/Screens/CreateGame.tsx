import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createGame, getCurrentWalletConnected } from "../utils/interact";

function CreateGame() {

    const [walletAdress, setWalletAdress] = useState<string>("")
    const [minPlayerCount, setMinPlayerCount] = useState<number>(0);
    const [minGuess, setMinGuess] = useState<number>(0);
    const [maxGuess, setMaxGuess] = useState<number>(0);
    const [entryFee, setEntryFee] = useState<number>(0);
    const [name, setName] = useState<string>();

    async function fetchWallet() {
        const { adress } = await getCurrentWalletConnected();
        setWalletAdress(adress);
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
        setEntryFee(target.value)
    }
    const changePlayerCount = ({ target }: any) => {
        setMinPlayerCount(target.value)
    }
    const submitForm = () => {
        if (walletAdress.length > 0 && maxGuess > 0 && minPlayerCount > 0 && entryFee >= 1) {
            createGame(walletAdress, minGuess, maxGuess, minPlayerCount, entryFee)
        } else {
            console.log("Pls fill the information");
        }
    }

    return (
        <>
            <div className="layer"></div>
            <Link to="/">
                <button id="backbtn" className="btn">back</button>
            </Link>
            <h2>Enter your Rules</h2>
            <div className="enterfee">
                <p>min. number of Players: </p>
                <input type={"number"} placeholder="Players" min={2} max={10} onChange={changePlayerCount}></input>
                <p>Range of Guess: </p>
                <div className="flex column">
                    <input type={"number"} placeholder="min" onChange={changeMinGuess}></input>
                    <input type={"number"} placeholder="max" onChange={changeMaxGuess}></input>
                </div>
                <p>Entry Fee: </p>
                <input type={"number"} placeholder="Entry Fee" onChange={changeEntryFee}></input>
                <p>Enter a Name: </p>
                <input type={"text"} placeholder="Name" onChange={(e) => setName(e.target.value)}></input>
                <button id="startbtn" className="btn" onClick={() => submitForm()}>Create Game</button>
            </div>
        </>
    )
}

export default CreateGame