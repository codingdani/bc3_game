import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    checkForParticipation,
    checkForRevealPhase,
    checkIfGameMaster,
    createGameContractInstance,
    enterGame,
    getCurrentPlayerCount,
    getCurrentWalletConnected,
    getGameDetails,
    startRevealPhase,
    withdrawMyEntryFee
} from '../utils/interact';
import loading from "../gif/loading-spinner.gif";
interface TGameDetails {
    entryFee: string,
    maxGuess: string,
    minGuess: string,
    minPlayers: string,
};

function CommitPhaseScreen() {

    const location = useLocation();
    const navigate = useNavigate();

    const [walletAddress, setWalletAddress] = useState("");
    const [gameAddress, setGameAddress] = useState("");
    const [gameDetails, setGameDetails] = useState<TGameDetails>();
    const [guess, setGuess] = useState<number>(0);
    const [salt, setSalt] = useState<number>(0);
    const [playerCount, setPlayerCount] = useState<number>(0);
    const [minPlayerCountReached, setMinPlayerCountReached] = useState<boolean>(false);
    const [isMaster, setIsMaster] = useState<boolean>(false);
    const [hasCommitted, setHasCommitted] = useState<boolean>(false);
    const [newPlayerEntered, setNewPlayerEntered] = useState<boolean>(false);
    const [isRevealPhase, setIsRevealPhase] = useState<boolean>(false);
    const [showWithdrawButton, setShowWithdrawButton] = useState<boolean>(false);

    useEffect(() => {
        async function fetchWallet() {
            const { address } = await getCurrentWalletConnected();
            setWalletAddress(address);
        };
        fetchWallet();
    }, []);

    useEffect(() => {
        if (location.state.from && gameAddress != location.state.from) {
            fetchGameData(location.state.from);
            setGameAddress(location.state.from);
            const fetchCurrentPlayerCount = async () => {
                const count = await getCurrentPlayerCount(location.state.from);
                setPlayerCount(count);
            };
            const fetchGameStatus = async () => {
                const status = await checkForRevealPhase(location.state.from);
                setIsRevealPhase(status);
            };
            fetchGameStatus();
            fetchCurrentPlayerCount();
            scCommitEventListener(location.state.from);
            scRevealEventListener(location.state.from);
        };
        const fetchGameMasterInfo = async () => {
            const masterState = await checkIfGameMaster(walletAddress, location.state.from)
            setIsMaster(masterState);
        };
        const fetchParticipationInfo = async () => {
            const participationState = await checkForParticipation(walletAddress, location.state.from);
            setHasCommitted(participationState);
        };
        fetchGameMasterInfo();
        fetchParticipationInfo();
    }, [walletAddress, location]);

    useEffect(() => {
        if (playerCount == Number(gameDetails?.minPlayers)) setMinPlayerCountReached(true);
    }, [gameDetails, playerCount])

    const fetchGameData = async (address: string) => {
        const game = await getGameDetails(address);
        setGameDetails({
            entryFee: game.entryFee,
            maxGuess: game.maxGuess,
            minGuess: game.minGuess,
            minPlayers: game.minPlayers
        });
    }

    function scCommitEventListener(address: string) {
        const contract = createGameContractInstance(address);
        contract.events.CommitMade({}, (error: Error) => {
            if (error) console.log(error.message);
            else {
                const fetchCurrentPlayerCount = async () => {
                    const count = await getCurrentPlayerCount(location.state.from);
                    setPlayerCount(count);
                };
                fetchCurrentPlayerCount();
                setNewPlayerEntered(true);
                setTimeout(() => {
                    setNewPlayerEntered(false);
                }, 5000);
            };
        });
    }

    function scRevealEventListener(address: string) {
        const contract = createGameContractInstance(address);
        contract.events.RevealStart({}, (error: Error) => {
            if (error) console.log(error.message);
            else setIsRevealPhase(true);
        });
    }

    const changeGuess = ({ target }: any) => {
        setGuess(target.value);
    }
    const changeSalt = ({ target }: any) => {
        setSalt(target.value);
    }

    const submitGuess = () => {
        if (guess > Number(gameDetails?.maxGuess) || guess < Number(gameDetails?.minGuess)) {
            console.log("The Guess is invalid. Check your Input.");
            return {
                status: "Invalid Guess."
            };
        } else if (guess && salt && walletAddress.length > 0) {
            enterGame(gameAddress, walletAddress, guess, salt).then((res) => {
                if (res.confirmed == true) setHasCommitted(true);
            });
            return {
                status: "Transaction went through."
            };
        } else {
            console.log("something's not right");
            return {
                status: "There was a mistake",
            };
        };
    }

    const handleKeypress = (e: React.KeyboardEvent) => {
        if (e.key == 'Enter') submitGuess();
    }

    const enterRevealPhase = () => {
        if (playerCount >= Number(gameDetails?.minPlayers)) startRevealPhase(gameAddress, walletAddress);
        else console.log("playercount not reached yet");
    }

    const showWithdraw = async () => {
        setShowWithdrawButton(!showWithdrawButton);
    }
    return (
        <>
            <Link to="/opengames" id="backbtn" className="btn">
                back
            </Link>
            {newPlayerEntered ? <p className="padding20">a player has entered the game</p> : null}
            {gameDetails ?
                <>
                    <section className="flex evenly width100 height100">
                        <section>
                            <div className="flexstart textfield">
                                <p>Contract Info (<a href={`https://sepolia.etherscan.io/address/${gameAddress}`} target="_blank">show on etherscan</a>)</p>
                                <p> address: {
                                    String(gameAddress).substring(0, 6) +
                                    "..." +
                                    String(gameAddress).substring(38)
                                }
                                </p>
                                <p>current players: <span className="importantnr">{playerCount}</span>  min. players: <span className="importantnr">{gameDetails.minPlayers}</span></p>
                                {hasCommitted ?
                                    <div id="getmymoneyback" className="marginbtm">
                                        <div onClick={showWithdraw} className="padding5 borderred round pointer">my money is stuck?</div>
                                        {showWithdrawButton ?
                                            <div className="padding5">
                                                <p>if the game master does not respond for 7 Days, you can withdraw your money</p>
                                                <br />
                                                <button className="btn" onClick={() => withdrawMyEntryFee(gameAddress, walletAddress)}>withdraw my money</button>
                                            </div>
                                            :
                                            null
                                        }
                                    </div>
                                    : null
                                }

                            </div>
                            <div className="textfield">
                                <h3 className="secondarytext">RULES</h3>
                                <div className="bordergold glowy round">
                                    <p className="padding20">The player with the closest guess to <br /> <b><span className="secondarytext">66.6% of the intersection</span> of all guesses</b><br /> wins the price.</p>
                                </div>
                                <p>All players enter a <b>guess</b> between <span className="importantnr">{gameDetails.minGuess}</span> - <span className="importantnr">{gameDetails.maxGuess}</span>.</p>
                                <p>To keep your guess hidden from the other players, you will enter a <b>salt number</b> as well. The salt number makes it impossible to read your guess from the blockchain transaction.</p>
                                <p><span className="secondarytext">Hold on to your Guess and your Salt.</span> You will have to enter them again in the reveal phase.</p>
                                <p>Once the reveal phase has started, there is a <span className="primarytext">24 hours deadline</span> to commit your reveal. If you miss the deadline, you will be disqualified without payback.</p>
                            </div>
                        </section>
                        <section>
                            {isMaster ?
                                <>
                                    <div className="textfield borderwhite">
                                        <h3>you are the game master</h3>
                                        {isRevealPhase ?
                                            <>
                                                <p>reveal phase has started.</p>
                                                {hasCommitted ? null :
                                                    <>
                                                        <button className="btn" onClick={() => navigate(`/revealphase/${gameAddress}`, { state: { gameDetails, gameAddress, playerCount, walletAddress, isMaster } })}>observe reveal phase</button>
                                                        <br />
                                                    </>
                                                }
                                            </>
                                            :
                                            <>
                                                {minPlayerCountReached ?
                                                    <p className="greentext">min player count reached.</p>
                                                    :
                                                    <p><b>Condition</b>: min. player count has to be reached.</p>
                                                }
                                                <button className="btn padding20" onClick={enterRevealPhase}>start reveal phase</button>
                                            </>
                                        }
                                    </div>
                                </>
                                : null
                            }
                            <div className="textfield bordergold glowy">
                                <br />
                                <h3>commit phase</h3>
                                {hasCommitted ?
                                    <>
                                        <h3>you have committed a <span className="primarytext">guess</span> and <span className="secondarytext">salt</span>.</h3>
                                        <p>hold on to your numbers.</p>
                                        {isRevealPhase ?
                                            <>
                                                <br />
                                                <p className="greentext">the reveal phase has started.</p>
                                                <button className="btn" onClick={() => navigate(`/revealphase/${gameAddress}`, { state: { gameDetails, gameAddress, playerCount, walletAddress, isMaster } })}>enter reveal phase</button>
                                                <br />
                                            </>
                                            :
                                            <>
                                                <img src={loading} id="loadinggifsmall"></img>
                                                <p>waiting for the reaveal phase...</p>
                                            </>
                                        }
                                    </>
                                    :
                                    <>
                                        {isRevealPhase ?
                                            <p>this game has started already</p>
                                            :
                                            <>
                                                <form className="flex evenly" onKeyPress={handleKeypress}>
                                                    <div className="padding20">
                                                        <h3 className="primarytext padding20">guess: </h3>
                                                        <input type="number" id="input" className="form-input" onChange={changeGuess} />
                                                    </div>
                                                    <div className="padding20">
                                                        <h3 className="secondarytext padding20">salt: </h3>
                                                        <input type="number" id="input" className="form-input" placeholder="bsp: 1234" onChange={changeSalt} />
                                                    </div>
                                                </form>
                                                <div className="flex padding20">
                                                    <h3 className='margin'>entry fee: </h3>
                                                    <span className='importantnr'> {gameDetails.entryFee}</span>
                                                    <div id="eth_logo"></div>
                                                </div>
                                                <button id="buttonintextfield" className="btn padding20" onClick={submitGuess}>commit</button>
                                            </>
                                        }
                                    </>
                                }
                            </div>
                        </section>
                    </section>
                </> : null
            }
        </>
    )
}

export default CommitPhaseScreen