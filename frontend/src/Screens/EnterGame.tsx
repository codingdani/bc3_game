import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getGameDetails } from '../utils/interact';

function EnterGame() {

    const location = useLocation();

    const [gameAdress, setGameAdress] = useState("");
    const [gameDetails, setGameDetails] = useState({
        entryFee: 0,
        maxGuess: 0,
        minGuess: 0,
        minPlayers: 0,
    })
    const callData = async (adress: string) => {
        const game = await getGameDetails(adress);
        setGameDetails({
            entryFee: game.entryFee,
            maxGuess: game.maxGuess,
            minGuess: game.minGuess,
            minPlayers: game.minPlayers
        })
    }
    useEffect(() => {
        if (location.state.from) {
            callData(location.state.from);
            setGameAdress(location.state.from);
        }
    }, [location])

    return (
        <>
            <div className="layer"></div>
            <Link to="/opengames" id="backbtn" className="btn">
                back
            </Link>
            <h2>Name of Game</h2>
            <div className="details">
                <p>Contract Adress:{gameAdress} </p>
                <a href={`https=//sepolia.etherscan.io/adress/${gameAdress}`} target="_blank">show on Etherscan</a>
            </div>
            <div className="enterfee">
                <p>You play against multiple other Players. (min. {gameDetails.minPlayers}) </p>
                <p>You all enter a guess between {gameDetails.minGuess} and {gameDetails.maxGuess}.</p>
                <p>The person with the closest guess to <br /> <b>66.6% of the intersection of all guesses</b><br /> wins the price.</p>
                <br />
                <h3>Enter Your Guess: <br />{gameDetails.minGuess} - {gameDetails.maxGuess}</h3>
                <div className="form-group">
                    <input type="number" id="input" className="form-input" />
                </div>
                <div className="flex">
                    <h3>Fee: </h3>
                    <span>{gameDetails.entryFee}</span>
                    <div id="eth_logo"></div>
                </div>
            </div>
            <button id="startbtn" className="btn">Enter Game</button>
        </>
    )
}

export default EnterGame