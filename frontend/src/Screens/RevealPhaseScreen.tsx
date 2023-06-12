import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { createGameContractInstance, revealGuess } from '../utils/interact';

function RevealPhaseScreen() {

    const { state } = useLocation();
    const { gameDetails, gameAddress, walletAddress, isMaster } = state;

    const [guess, setGuess] = useState<number>(0);
    const [salt, setSalt] = useState<number>(0);
    const [newReveal, setNewReveal] = useState<boolean>(false);
    const [allRevealed, setAllRevealed] = useState<boolean>(false);

    useEffect(() => {
        scRevealMadeEventListener(gameAddress);
    }, []);

    function scRevealMadeEventListener(address: string) {
        const contract = createGameContractInstance(address);
        contract.events.RevealMade({}, (error: Error) => {
            if (error) console.log(error.message);
            else {
                setNewReveal(true);
                setTimeout(() => {
                    setNewReveal(false);
                }, 5000);
            };
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
            console.log("wrong guess entered")
            return {
                status: "Invalid Guess."
            };
        } else if (guess && salt && walletAddress.length > 0) {
            revealGuess(gameAddress, walletAddress, guess, salt)
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
                </div>
                <div className="textfield bordergold glowy">
                    <h3>you are the game master</h3>
                    <p><b>Condition</b>: all players have revealed their guess.</p>
                    <br />
                    <button className="btn padding20">Start</button>
                    <br />
                </div>
            </section>
        </>
    )
}

export default RevealPhaseScreen