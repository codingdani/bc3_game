import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCurrentGames, getGameDetails } from "../utils/interact";
import loadingpng from "../gif/Blockchaingif.gif"

interface TGameDetails {
    name: string,
    entryFee: string,
    minGuess: string,
    maxGuess: string,
    minPlayers: string,
}

function CurrentOpenGames() {

    const [openGames, setOpenGames] = useState<string[]>([]);
    const [openGamesDetails, setOpenGamesDetails] = useState<TGameDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
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
                        <p id="fetching">fetching...</p>
                        <img src={loadingpng} id="loadinggif"></img>
                    </div>
                </>
                : null}
            <div id="container_for_all_games">
                {openGamesDetails && openGamesDetails.length > 0 ? (
                    openGamesDetails.map((game) => (
                        <Link to={`/entergame/${game.name}`} className="gamecontainer" key={game.name} state={{ from: game.name }}>
                            <p>{String(game.name).substring(0, 6) + "..." + String(game.name).substring(38)}</p>
                            <p>entry Fee: <span className="importantnr">{game.entryFee}</span></p>
                            <p>intersection between <span className="importantnr">{game.minGuess}</span> - <span className="importantnr">{game.maxGuess}</span></p>
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