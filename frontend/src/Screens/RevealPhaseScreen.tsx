import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { createGameContractInstance, getRevealedPlayerCount, revealGuess, startGame } from '../utils/interact';
import loading from "../gif/loading-spinner.gif";

function RevealPhaseScreen() {

    const { state } = useLocation();
    const { gameDetails, gameAddress, playerCount, walletAddress, isMaster } = state;

    const [guess, setGuess] = useState<number>(0);
    const [salt, setSalt] = useState<number>(0);
    const [hasRevealed, setHasRevealed] = useState<boolean>(true);
    const [newReveal, setNewReveal] = useState<boolean>(false);
    const [revealCount, setRevealCount] = useState<number>(0);
    const [allRevealed, setAllRevealed] = useState<boolean>(false);
    const [gameIsFinished, setGameIsFinished] = useState<boolean>(true);
    const [winnerAddress, setWinnerAddress] = useState<string>("");
    const [isWinner, setIsWinner] = useState<boolean>(true);

    useEffect(() => {
        scRevealMadeEventListener(gameAddress);
        scWinnerDeclaredEventListener(gameAddress);
        const fetchCurrentRevealCount = async () => {
            const count = await getRevealedPlayerCount(gameAddress);
            setRevealCount(count);
        }
        fetchCurrentRevealCount();
    }, []);

    useEffect(() => {
        if (revealCount == playerCount) setAllRevealed(true);
    }, [revealCount])

    function scRevealMadeEventListener(address: string) {
        const contract = createGameContractInstance(address);
        contract.events.RevealMade({}, (error: Error) => {
            if (error) console.log(error.message);
            else {
                setNewReveal(true);
                setRevealCount(revealCount + 1);
                setTimeout(() => {
                    setNewReveal(false);
                }, 5000);
            };
        });
    }

    function scWinnerDeclaredEventListener(address: string) {
        const contract = createGameContractInstance(address);
        contract.events.WinnerDeclared({}, (error: Error) => {
            if (error) console.log("Error: ", error.message)
            else {
                setGameIsFinished(true);
                fetchWinnerAddress(address);
            }
        })
    }

    const changeGuess = ({ target }: any) => {
        setGuess(target.value);
    }
    const changeSalt = ({ target }: any) => {
        setSalt(target.value);
    }

    const submitGuess = () => {
        if (guess > Number(gameDetails?.maxGuess) || guess < Number(gameDetails?.minGuess)) {
            console.log("wrong guess entered")
            return {
                status: "Invalid Guess."
            };
        } else if (guess && salt && walletAddress.length > 0 && allRevealed) {
            revealGuess(gameAddress, walletAddress, guess, salt).then((res) => {
                if (res.confirmed == true) setHasRevealed(true);
            })
            return {
                status: "Transaction went through."
            };
        } else {
            console.log("fail");
            return {
                status: "There was a mistake",
            };
        };
    }

    const startLastPhase = () => {
        if (allRevealed) startGame(gameAddress, walletAddress);
    }

    const fetchWinnerAddress = async (address: string) => {
        const contract = createGameContractInstance(address);
        const winner = await contract.methods.winner().call();
        setWinnerAddress(winner);
    }

    return (
        <>
            <Link to={`/entergame/${gameAddress}`} state={{ from: gameAddress }} id="backbtn" className="btn">
                back
            </Link>
            {newReveal ?
                <>
                    <p>a player has revealed his guess</p>
                    <br />
                </>
                : null}
            <section className="flex evenly width100 height100">
                <div className="textfield bordergold glowy">
                    <h3>reveal phase</h3>
                    <p className="secondarytext">{revealCount} / {playerCount} revealed</p>
                    {hasRevealed ?
                        <>
                            <img src={loading} id="loadinggifsmall"></img>
                            <p>waiting for other players...</p>
                        </>
                        :
                        <>
                            <p>make sure to enter the exact same guess and salt as you committed in the first step. Otherwise you get disqualified without payback.</p>
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
                                        <input type="number" id="input" className="form-input" onChange={changeSalt} />
                                    </form>
                                </div>
                            </section>
                            <button id="buttonintextfield" className="btn padding20" onClick={submitGuess}>reveal</button>
                        </>
                    }
                </div>
                {isMaster ?
                    <div className="textfield bordergold glowy">
                        <h3>you are the game master</h3>
                        <p><b>Condition</b>: all players have revealed their guess.</p>
                        <br />
                        <button className="btn padding20" onClick={startLastPhase}>Start</button>
                        <br />
                    </div>
                    : null
                }
            </section>
        </>
    )
}

export default RevealPhaseScreen