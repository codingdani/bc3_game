import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    checkForParticipation,
    checkIfGameMaster,
    createGameContractInstance,
    enterAGame,
    getCurrentPlayerCount,
    getCurrentWalletConnected,
    getGameDetails
} from '../utils/interact';
import loading from "../gif/loading-spinner.gif";
interface TGameDetails {
    entryFee: string,
    maxGuess: string,
    minGuess: string,
    minPlayers: string,
};

function EnterGame() {

    const location = useLocation();
    const navigate = useNavigate();

    const [walletAddress, setWalletAddress] = useState("");
    const [gameAddress, setGameAddress] = useState("");
    const [gameDetails, setGameDetails] = useState<TGameDetails>();
    const [guess, setGuess] = useState<number>(0);
    const [salt, setSalt] = useState<number>(0);
    const [pCount, setPCount] = useState<number>();
    const [isMaster, setIsMaster] = useState<boolean>(false);
    const [hasEntered, setHasEntered] = useState<boolean>(false);
    const [newPlayerEntered, setNewPlayerEntered] = useState<boolean>(false);
    const [isReveal, setIsReveal] = useState<boolean>(true);

    useEffect(() => {
        async function fetchWallet() {
            const { address } = await getCurrentWalletConnected();
            setWalletAddress(address);
        };
        fetchWallet();
    }, []);

    useEffect(() => {
        if (location.state.from && gameAddress != location.state.from) {
            callGameData(location.state.from);
            setGameAddress(location.state.from);
            const fetchCurrentPlayerCount = async () => {
                const count = await getCurrentPlayerCount(location.state.from);
                setPCount(count);
            }
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
            setHasEntered(participationState);
        };
        fetchGameMasterInfo();
        fetchParticipationInfo();
        if (gameDetails) {
            navigate(`/revealphase/${gameAddress}`, {
                state: {
                    gameDetails: gameDetails,
                    gameAddress: gameAddress,
                }
            })
        };
    }, [walletAddress, location]);

    const callGameData = async (adress: string) => {
        const game = await getGameDetails(adress);
        setGameDetails({
            entryFee: game.entryFee,
            maxGuess: game.maxGuess,
            minGuess: game.minGuess,
            minPlayers: game.minPlayers
        })
    }

    function scCommitEventListener(address: string) {
        const contract = createGameContractInstance(address);
        contract.events.CommitMade({}, (error: Error) => {
            if (error) console.log(error.message);
            else {
                const fetchCurrentPlayerCount = async () => {
                    const count = await getCurrentPlayerCount(location.state.from);
                    setPCount(count);
                };
                fetchCurrentPlayerCount();
                setNewPlayerEntered(true);
                setTimeout(() => {
                    setNewPlayerEntered(false);
                }, 5000);
            };
        });
    };

    function scRevealEventListener(address: string) {
        const contract = createGameContractInstance(address);
        contract.events.RevealStart({}, (error: Error) => {
            if (error) console.log(error.message);
            else setIsReveal(true);
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
            console.log("fail");
            return {
                status: "Invalid Guess."
            }
        } else if (guess && salt && walletAddress.length > 0) {
            enterAGame(gameAddress, walletAddress, guess, salt).then((res) => {
                if (res.confirmed == true) setHasEntered(true);
            })
            return {
                status: "Transaction went through."
            }
        } else {
            console.log("fail");
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
            {newPlayerEntered ? <p>a player has entered the game</p> : null}
            {gameDetails ? (
                <>
                    <section className="flex evenly width100 height100">
                        <section>
                            <div className="flexstart textfield bordergreen">
                                <p>Contract Info (<a href={`https://sepolia.etherscan.io/address/${gameAddress}`} target="_blank">show on etherscan</a>)</p>
                                <p> address: {
                                    String(gameAddress).substring(0, 6) +
                                    "..." +
                                    String(gameAddress).substring(38)
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
                        <section>
                            {isMaster ?
                                <>
                                    <div className="textfield bordergold glowy">
                                        <h3>you are the game master</h3>
                                        <p><b>Condition</b>: min. player count reached.</p>
                                        <button className="btn padding20">start game</button>
                                        <p>Once the condition is met, the game will start automatically in 7 days or you can start it manually.</p>
                                    </div>
                                </>
                                : null
                            }
                            <div className="textfield bordergold glowy">
                                <br />
                                <h3>commit phase</h3>
                                {hasEntered ?
                                    <>
                                        <h3>you have committed a <span className="primarytext">guess</span> and <span className="secondarytext">salt</span>.</h3>
                                        <p>hold on to your numbers.</p>
                                        {isReveal ?
                                            <>
                                                <br />
                                                <button className="btn" onClick={() => navigate(`/revealphase/${gameAddress}`, { state: { gameDetails, gameAddress } })}>Enter the Reveal Phase</button>
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
                                        <button id="buttonintextfield" className="btn padding20" onClick={submitGuess}>commit</button>
                                    </>
                                }
                            </div>
                        </section>
                    </section>
                </>) : null}
        </>
    )
}

export default EnterGame