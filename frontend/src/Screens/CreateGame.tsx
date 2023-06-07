import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createGame, getCurrentWalletConnected } from "../utils/interact";
import loadinggif from "../gif/loading-spinner.gif"

function CreateGame() {

    const [walletAdress, setWalletAdress] = useState<string>("")
    const [minPlayerCount, setMinPlayerCount] = useState<number>(0);
    const [minGuess, setMinGuess] = useState<number>(0);
    const [maxGuess, setMaxGuess] = useState<number>(0);
    const [entryFee, setEntryFee] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate()

    useEffect(() => {
        async function fetchWallet() {
            const { address } = await getCurrentWalletConnected();
            setWalletAdress(address);
        }
        fetchWallet()
    }, []);

    const changeMinGuess = ({ target }: any) => {
        setMinGuess(target.value)
    }
    const changeMaxGuess = ({ target }: any) => {
        setMaxGuess(target.value)
    }
    const changeEntryFee = ({ target }: any) => {
        setEntryFee(target.value);
    }
    const changePlayerCount = ({ target }: any) => {
        setMinPlayerCount(target.value)
    }

    const submitForm = () => {
        if (walletAdress.length > 0 &&
            maxGuess > 0 &&
            minPlayerCount > 0 &&
            entryFee >= 0 &&
            minGuess < maxGuess) {
            setLoading(true);
            createGame(walletAdress, minGuess, maxGuess, minPlayerCount, entryFee).then((res) => {
                if (res.confirmed == true) {
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/opengames')
                    }, 4000);
                } else setLoading(false);
            });
        } else {
            setLoading(false);
            console.log("Pls fill the information correctly");
        }
    }

    return (
        <>
            <Link to="/">
                <button id="backbtn" className="btn">back</button>
            </Link>
            {loading ?
                <>
                    <div id="loading" className="z_index">
                        <img src={loadinggif} id="loadinggif"></img>
                    </div>
                </>
                : null}
            <h2>Enter your Rules</h2>
            <div id="gamecreation" className="textfield bordergold">
                <p>Enter the number of players that have to commit to the contract before the game can be manually started or the timer for autostart goes off: </p>
                <input type={"number"} placeholder="playercount" min={2} max={10} onChange={changePlayerCount}></input>
                <div>
                    <p>Enter the range for the number the players can commit as their guess: </p>
                    <input type={"number"} placeholder="min bsp: 0" onChange={changeMinGuess}></input>
                    <input type={"number"} placeholder="max bsp: 100" onChange={changeMaxGuess}></input>
                </div>
                <div className="flex column">
                </div>
                <div>
                    <p>Entry Fee: </p>
                    <div className="flex transform">
                        <input type={"number"} placeholder="fee in ETH" id="entryfeeinput" onChange={changeEntryFee}></input>
                        <div id="eth_logo" className="positioned"></div>
                    </div>
                </div>
                <button id="createbtn" className="btn margintp" onClick={() => submitForm()}>Create Game</button>
            </div>
        </>
    )
}

export default CreateGame