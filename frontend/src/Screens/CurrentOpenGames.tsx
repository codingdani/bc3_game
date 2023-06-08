import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCurrentGames, getGameDetails } from "../utils/interact";
import loadinggif from "../gif/loading-spinner.gif"

interface TGameDetails {
    address: string,
    entryFee: string,
    minGuess: string,
    maxGuess: string,
    minPlayers: string,
}

function CurrentOpenGames() {

    const [openGamesList, setOpenGamesList] = useState<string[]>([]);
    const [openGamesDetails, setOpenGamesDetails] = useState<TGameDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        const fetchGameRules = async (openGames: string[]) => {
            const gameDetailsArray: TGameDetails[] = []
            // implement a for await for async iteration
            for (let i = 0; i < openGames.length; i++) {
                await getGameDetails(openGames[i])
                    .then((res) => {
                        const rules = {
                            address: openGames[i],
                            entryFee: res.entryFee,
                            maxGuess: res.maxGuess,
                            minGuess: res.minGuess,
                            minPlayers: res.minPlayers,
                        }
                        gameDetailsArray.push(rules);
                        setOpenGamesDetails(gameDetailsArray);
                    });
            }
            setLoading(false);
        }
        fetchGameRules(openGamesList);
    }, [openGamesList])

    useEffect(() => {
        const getGameList = async () => {
            setLoading(true);
            const currentGames = await getAllCurrentGames();
            setOpenGamesList(currentGames);
        };
        getGameList()
    }, [])

    return (
        <>
            {openGamesList.length > 0 ? <h2>Currently open Games</h2> : null}
            <Link to="/" id="backbtn" className="btn">
                back
            </Link>
            {loading ?
                <>
                    <div id="loading" className="z_index">
                        <p id="fetching">fetching...</p>
                        <img src={loadinggif} id="loadinggif"></img>
                    </div>
                </>
                : null}
            <div id="container_for_all_games">
                {openGamesDetails && openGamesDetails.length > 0 ? (
                    openGamesDetails.map((game) => (
                        <Link to={`/entergame/${game.address}`} className="gamecontainer" key={game.address} state={{ from: game.address }}>
                            <p>{String(game.address).substring(0, 6) + "..." + String(game.address).substring(38)}</p>
                            <p>entry Fee: <span className="importantnr">{game.entryFee}</span></p>
                            <p>intersection between <span className="importantnr">{game.minGuess}</span> - <span className="importantnr">{game.maxGuess}</span></p>
                            <p>min. playercount: {game.minPlayers}</p>
                        </Link>
                    ))) : (
                    <div className="flex column">
                        <h2>no games here yet</h2>
                        <Link to="/creategame" className="btn">create a game</Link>
                    </div>
                )}
            </div>
        </>
    )
}


export default CurrentOpenGames