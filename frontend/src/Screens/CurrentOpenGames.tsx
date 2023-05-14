import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCurrentGames } from "../utils/interact";

interface TGame {
    name: string,
    fee: number,
    minGuess: number,
    maxGuess: number,
    players: number,
}

function CurrentOpenGames() {

    const [openGames, setOpenGames] = useState<TGame[]>([])
    const getGameList = async () => {
        const currentGames = await getAllCurrentGames();
        console.log(currentGames)
        setOpenGames(currentGames);
    }

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
                {openGames.length > 0 ? (
                    openGames.map((game) => (
                        <Link to="/entergame" className="gamecontainer">
                            <p>{game.name}</p>
                            <p>Entry Fee: {game.fee}</p>
                            <p>Guess between {game.minGuess} - {game.maxGuess}</p>
                            <p>current Players: {game.players}</p>
                        </Link>
                    ))) : (
                    <h2>no games here yet</h2>
                )}
            </div>
        </>
    )
}

export default CurrentOpenGames