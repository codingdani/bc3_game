import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { enterAGame, getCurrentWalletConnected, getGameDetails } from '../utils/interact';

interface TGameDetails {
    entryFee: string,
    maxGuess: string,
    minGuess: string,
    minPlayers: string,
}
function EnterGame() {

    const location = useLocation();

    const [walletAdress, setWalletAdress] = useState("")
    const [gameAdress, setGameAdress] = useState("");
    const [gameDetails, setGameDetails] = useState<TGameDetails>()
    const [guess, setGuess] = useState<number>(0);

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

    useEffect(() => {
        async function fetchWallet() {
            const { adress } = await getCurrentWalletConnected();
            setWalletAdress(adress);
        }
        fetchWallet()
    }, []);

    const changeGuess = ({ target }: any) => {
        setGuess(target.value)
        console.log(guess);
    }

    const submitGuess = () => {
        if (guess > Number(gameDetails?.maxGuess) || guess < Number(gameDetails?.minGuess)) {
            console.log("fail")
            return {
                status: "Invalid Guess."
            }
        } else if (guess && walletAdress.length > 0) {
            enterAGame(gameAdress, walletAdress, guess);
            return {
                status: "Transaction went through."
            }
        } else {
            console.log("fail")
            return {
                status: "There was a mistake",
            }
        }
    }

    return (
        <>
            <div className="layer"></div>
            <Link to="/opengames" id="backbtn" className="btn">
                back
            </Link>
            {gameDetails ? (
                <>
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
                        <form className="form-group">
                            <input type="number" id="input" className="form-input" onChange={changeGuess} />
                        </form>
                        <div className="flex">
                            <h3>Fee: </h3>
                            <span className='importantnr'> {gameDetails.entryFee}</span>
                            <div id="eth_logo"></div>
                        </div>
                    </div>
                    <button id="startbtn" className="btn" onClick={submitGuess}>Enter Game</button>
                </>) : null}
        </>
    )
}

export default EnterGame