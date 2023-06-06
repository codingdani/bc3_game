import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { checkForParticipation, checkIfGameMaster, enterAGame, getCurrentPlayerCount, getCurrentWalletConnected, getGameDetails, getMyGuess } from '../utils/interact';

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
            setIsMaster(masterState)
            console.log("masterState changed", masterState)
        }
        const fetchParticipationInfo = async () => {
            const participationState = await checkForParticipation(walletAdress, location.state.from);
            //setHasEntered(participationState);
        }
        fetchGameMasterInfo();
        fetchParticipationInfo();
    }, [walletAdress, location])

    useEffect(() => {
        async function fetchWallet() {
            const { address } = await getCurrentWalletConnected();
            setWalletAdress(address);
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
        } else if (guess && salt && walletAdress.length > 0) {
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
                    <section className="flex evenly width100 height100">
                        <section>
                            <div className="flexstart textfield bordergreen">
                                <p>Contract Info (<a href={`https://sepolia.etherscan.io/address/${gameAdress}`} target="_blank">show on etherscan</a>)</p>
                                <p> address: {
                                    String(gameAdress).substring(0, 6) +
                                    "..." +
                                    String(gameAdress).substring(38)
                                }
                                </p>
                                <p>current players: <span className="importantnr">{pCount}</span>  min. players: <span className="importantnr">{gameDetails.minPlayers}</span></p>
                            </div>
                            <div className="textfield bordergreen">
                                <h3 className="secondarytext">RULES</h3>
                                <div className="bordergold glowy round">
                                    <p className="padding20">The person with the closest guess to <br /> <b><span className="secondarytext">66.6% of the intersection</span> of all guesses</b><br /> wins the price.</p>
                                </div>
                                <p>All players enter a <b>guess</b> between <span className="importantnr">{gameDetails.minGuess}</span> - <span className="importantnr">{gameDetails.maxGuess}</span>.</p>
                                <p>To keep your guess hidden from the other players, you will enter a <b>salt number</b> as well. The salt number makes it impossible to read your guess from the blockchain transaction.</p>
                                <p><span className="secondarytext">Hold on to your Guess and your Salt.</span> You will have to enter them again in the reveal phase.</p>
                            </div>
                        </section>
                        <div className="textfield bordergold glowy">
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
                                        <div className="padding20">
                                            <h3 className="primarytext padding20">guess: </h3>
                                            <form className="form-group">
                                                <input type="number" id="input" className="form-input" onChange={changeGuess} />
                                            </form>
                                        </div>
                                        <div className="padding20">
                                            <h3 className="secondarytext padding20">salt: </h3>
                                            <form className="form-group">
                                                <input type="number" id="input" className="form-input" placeholder="bsp: 1234" onChange={changeSalt} />
                                            </form>
                                        </div>
                                    </section>
                                    <div className="flex padding20">
                                        <h3 className='margin'>entry fee: </h3>
                                        <span className='importantnr'> {gameDetails.entryFee}</span>
                                        <div id="eth_logo"></div>
                                    </div>
                                    <button id="buttonintextfield" className="btn padding20" onClick={submitGuess}>Play</button>
                                </>
                            }
                        </div>
                    </section>
                </>) : null}
        </>
    )
}

export default EnterGame