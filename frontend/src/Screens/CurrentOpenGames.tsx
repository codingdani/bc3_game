import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCurrentGames, getCurrentPlayerCount, getGameDetails } from "../utils/interact";
import loadingpng from "../gif/Blockchaingif.gif"

interface TGameDetails {
    name: string,
    entryFee: string,
    minGuess: string,
    maxGuess: string,
    minPlayers: string,
    currentPlayers?: number,
}

function CurrentOpenGames() {

    const [openGames, setOpenGames] = useState<string[]>([]);
    const [openGamesDetails, setOpenGamesDetails] = useState<TGameDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        const fetchCurrentPlayerCount = async (openGames: string[]) => {
            const currentPlayerCount = 0
            for (let i = 0; i < openGamesDetails.length; i++) {
                const count = await getCurrentPlayerCount(openGamesDetails[i].name).then((count) => {

                })
            }
        }
        const fetchGameRules = async (openGames: string[]) => {
            const gameArray: TGameDetails[] = []
            // implement a for await for async iteration
            for (let i = 0; i < openGames.length; i++) {
                await getGameDetails(openGames[i])
                    .then((res) => {
                        const rules = {
                            name: openGames[i],
                            entryFee: res.entryFee,
                            maxGuess: res.maxGuess,
                            minGuess: res.minGuess,
                            minPlayers: res.minPlayers,
                        }
                        gameArray.push(rules);
                        setOpenGamesDetails(gameArray);
                    });
            }
            setTimeout(() => setLoading(false), 2000);
        }
        fetchGameRules(openGames);
    }, [openGames])

    useEffect(() => {
        const getGameList = async () => {
            setLoading(true);
            const currentGames = await getAllCurrentGames();
            setOpenGames(currentGames);
            console.log("set Game String Array", currentGames)
        };
        getGameList()
    }, [])

    return (
        <>
            {openGames.length > 0 ? <h2>Currently open Games</h2> : null}
            <Link to="/" id="backbtn" className="btn">
                back
            </Link>
            {loading ?
                <>
                    <div className="layer z_index">
                    </div>
                    <div id="loading" className="z_index">
                        <p>fetching...</p>
                        <img src={loadingpng} id="loadinggif"></img>
                    </div>
                </>
                : null}
            <div id="container_for_all_games">
                {openGamesDetails && openGamesDetails.length > 0 ? (
                    openGamesDetails.map((game) => (
                        <Link to={`/entergame/${game.name}`} className="gamecontainer" key={game.name} state={{ from: game.name }}>
                            <p>{game.name}</p>
                            <p>Entry Fee: <span className="importantnr">{game.entryFee}</span></p>
                            <p>Guess between <span className="importantnr">{game.minGuess}</span> - <span className="importantnr">{game.maxGuess}</span></p>
                            <p>current Players: <span className="importantnr">{game.minPlayers}</span></p>
                        </Link>
                    ))) : (
                    <p className="centered">no games here yet</p>
                )}
            </div>
        </>
    )
}


export default CurrentOpenGames