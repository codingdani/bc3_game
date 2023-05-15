import { setMaxIdleHTTPParsers } from 'http';
import { stringify } from 'querystring';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCurrentGames, getGameDetails } from "../utils/interact";

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

    const getGameList = async () => {
        const currentGames = await getAllCurrentGames();
        setOpenGames(currentGames);
    };

    const fetchGameRules = async (openGames: string[]) => {
        const gameArray = []
        for (let i = 0; i < openGames.length; i++) {
            const res = await getGameDetails(openGames[i]);
            const rules = {
                name: openGames[i],
                entryFee: res.entryFee,
                maxGuess: res.maxGuess,
                minGuess: res.minGuess,
                minPlayers: res.minPlayers,
            }
            gameArray.push(rules);
            setOpenGamesDetails(gameArray);
        }
    }

    useEffect(() => {
        fetchGameRules(openGames)
    }, [openGames])
    useEffect(() => {
        getGameList()
    }, [])

    return (
        <>
            {openGames.length > 0 ? <h2>Currently open Games</h2> : null}
            <Link to="/" id="backbtn" className="btn">
                back
            </Link>
            <div id="container_for_all_games">
                {openGamesDetails && openGamesDetails.length > 0 ? (
                    openGamesDetails.map((game) => (
                        <Link to={`/entergame/${game}`} className="gamecontainer" key={game.name} state={{ from: game.name }}>
                            <p>{game.name}</p>
                            <p>Entry Fee: {game.entryFee}</p>
                            <p>Guess between {game.minGuess} - {game.maxGuess}</p>
                            <p>current Players: {game.minPlayers}</p>
                        </Link>
                    ))) : (
                    <h2>no games here yet</h2>
                )}
            </div>
        </>
    )
}

export default CurrentOpenGames