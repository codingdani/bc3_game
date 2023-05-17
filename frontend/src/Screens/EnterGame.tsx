import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { enterAGame, getCurrentPlayerCount, getCurrentWalletConnected, getGameDetails } from '../utils/interact';

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
    const [pCount, setPCount] = useState<number>();

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
            const fetchCurrentPlayerCount = async () => {
                const count = await getCurrentPlayerCount(location.state.from);
                setPCount(count);
            }
            fetchCurrentPlayerCount();
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
                    <h2>66.6% of Intersection</h2>
                    <div className="details">
                        <p>Contract Adress:{gameAdress} </p>
                        <a href={`https://sepolia.etherscan.io/address/${gameAdress}`} target="_blank">show on Etherscan</a>
                    </div>
                    <div className="enterfee">
                        <p>current players: <span className="importantnr">{pCount}</span></p>
                        <p>You play against multiple other Players. (min. {gameDetails.minPlayers}) </p>
                        <p>You all enter a guess between <span className="importantnr">{gameDetails.minGuess}</span> - <span className="importantnr">{gameDetails.maxGuess}</span>.</p>
                        <p>The person with the closest guess to <br /> <b>66.6% of the intersection of all guesses</b><br /> wins the price.</p>
                        <br />
                        <h3>enter your guess: </h3>
                        <form className="form-group">
                            <input type="number" id="input" className="form-input" onChange={changeGuess} />
                        </form>
                        <div className="flex">
                            <h3 className='margin'>entry fee: </h3>
                            <span className='importantnr'> {gameDetails.entryFee}</span>
                            <div id="eth_logo"></div>
                        </div>
                        <button className="btn" onClick={submitGuess}>Play</button>
                    </div>
                </>) : null}
        </>
    )
}

export default EnterGame