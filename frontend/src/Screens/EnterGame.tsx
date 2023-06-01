import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { checkIfGameMaster, enterAGame, getCurrentPlayerCount, getCurrentWalletConnected, getGameDetails, getMyGuess } from '../utils/interact';

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
    const [salt, setSalt] = useState<number>(0);
    const [pCount, setPCount] = useState<number>();
    const [isMaster, setIsMaster] = useState<boolean>(false);
    const [hasEntered, setHasEntered] = useState<boolean>(false);

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
        const fetchGameMasterInfo = async () => {
            const masterState = await checkIfGameMaster(walletAdress, location.state.from)
            if (masterState) setIsMaster(true)
            else setIsMaster(false);
            console.log("masterState changed", masterState)
        }
        fetchGameMasterInfo();
        const fetchParticipationInfo = async () => {

        }
    }, [walletAdress, location])

    useEffect(() => {
        async function fetchWallet() {
            const { adress } = await getCurrentWalletConnected();
            setWalletAdress(adress);
        }
        fetchWallet()
    }, []);

    const changeGuess = ({ target }: any) => {
        setGuess(target.value);
    }
    const changeSalt = ({ target }: any) => {
        setSalt(target.value);
    }

    const submitGuess = () => {
        if (guess > Number(gameDetails?.maxGuess) || guess < Number(gameDetails?.minGuess)) {
            console.log("fail")
            return {
                status: "Invalid Guess."
            }
        } else if (guess && walletAdress.length > 0) {
            enterAGame(gameAdress, walletAdress, guess, salt).then(() => {
                setHasEntered(true);
            })
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
            <Link to="/opengames" id="backbtn" className="btn">
                back
            </Link>
            {gameDetails ? (
                <>
                    <section className="flex evenly width100">
                        <div className="details flexstart">
                            <p>Contract:</p>
                            <p>
                                {
                                    String(gameAdress).substring(0, 6) +
                                    "..." +
                                    String(gameAdress).substring(38)
                                }
                            </p>
                            <br />
                            <a href={`https://sepolia.etherscan.io/address/${gameAdress}`} target="_blank">show on Etherscan</a>
                        </div>
                        <div className="enterfee">
                            <p>current players: <span className="importantnr">{pCount}</span></p>
                            <p>You play against multiple other Players. (min. {gameDetails.minPlayers}) </p>
                            <p>You all enter a guess between <span className="importantnr">{gameDetails.minGuess}</span> - <span className="importantnr">{gameDetails.maxGuess}</span>.</p>
                            <p>The person with the closest guess to <br /> <b>66.6% of the intersection of all guesses</b><br /> wins the price.</p>
                            <br />
                            {hasEntered ?
                                <>
                                    <h3>the game has not started yet...</h3>
                                    <button className="btn" onClick={() => {
                                        console.log("game adress", gameAdress)
                                    }}>get my guess</button>
                                </>
                                :
                                <>
                                    <section className="flex evenly">
                                        <div>
                                            <h3 className="primarytext">guess: </h3>
                                            <form className="form-group">
                                                <input type="number" id="input" className="form-input" onChange={changeGuess} />
                                            </form>
                                        </div>
                                        <div>
                                            <h3 className="secondarytext">salt: </h3>
                                            <form className="form-group">
                                                <input type="number" id="input" className="form-input" onChange={changeSalt} />
                                            </form>
                                        </div>
                                    </section>
                                    <div className="flex">
                                        <h3 className='margin'>entry fee: </h3>
                                        <span className='importantnr'> {gameDetails.entryFee}</span>
                                        <div id="eth_logo"></div>
                                    </div>
                                    <button className="btn" onClick={submitGuess}>Play</button>
                                </>
                            }
                        </div>
                    </section>
                </>) : null}
        </>
    )
}

export default EnterGame