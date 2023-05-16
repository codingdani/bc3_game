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
        createGame(walletAdress, minGuess, maxGuess, minPlayerCount, entryFee)
    }

    return (
        <>
            <div className="layer"></div>
            <Link to="/">
                <button id="backbtn" className="btn">back</button>
            </Link>
            <h2>Enter the Rules</h2>
            <div className='containergrid'>
                <div className="container1">
                    <p>min number of Players: </p>
                    <input type={"number"} placeholder="Players" min={2} max={10} onChange={changePlayerCount}></input>
                </div>
                <div className='container2'>
                    <p>Range of Guess: </p>
                    <input type={"number"} placeholder="min" onChange={changeMinGuess}></input>
                    <input type={"number"} placeholder="max" onChange={changeMaxGuess}></input>
                </div>
                <div className='container3'>
                    <p>Entry Fee: </p>
                    <input type={"number"} placeholder="Entry Fee" onChange={changeEntryFee}></input>
                </div>
                <div className='container4'>
                    <p>Enter a Name: </p>
                    <input type={"text"} placeholder="Name" onChange={(e) => setName(e.target.value)}></input>
                </div>
            </div>
            <button id="startbtn" className="btn" onClick={() => submitForm()}>Create Game</button>
        </>
    )
}

export default CreateGame