import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { createGame } from "../utils/interact";

function CreateGame() {
    const [minPlayerCount, setMinPlayerCount] = useState<number>(3);
    const [minGuess, setMinGuess] = useState<number>(0);
    const [maxGuess, setMaxGuess] = useState<number>(100);
    const [entryFee, setEntryFee] = useState<number>(1);
    const [name, setName] = useState<string>("");

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
                    <input type={"number"} placeholder="Players"></input>
                </div>
                <div className='container2'>
                    <p>Range of Guess: </p>
                    <input type={"number"}></input>
                    <input type={"number"}></input>
                </div>
                <div className='container3'>
                    <p>Entry Fee: </p>
                    <input type={"number"} placeholder="Entry Fee"></input>
                </div>
                <div className='container4'>
                    <p>Enter a Name: </p>
                    <input type={"text"} placeholder="your Name for the Game" onChange={(e) => setName(e.target.value)}></input>
                </div>
            </div>
            <button id="startbtn" className="btn">Create Game</button>
        </>
    )
}

export default CreateGame