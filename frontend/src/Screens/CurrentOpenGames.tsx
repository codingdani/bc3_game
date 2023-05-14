import { stringify } from 'querystring';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCurrentGames, getGameDetails } from "../utils/interact";

// interface TGame {
//     name: string,
//     fee: number,
//     minGuess: number,
//     maxGuess: number,
//     players: number,
// }

function CurrentOpenGames() {

    const [openGames, setOpenGames] = useState<string[]>([]);
    const [openGamesDetails, setOpenGamesDetails] = useState([{}]);

    const getGameList = async () => {
        const currentGames = await getAllCurrentGames();
        setOpenGames(currentGames);
        for (let i = 0; i < openGames.length; i++) {
            getGameDetails(openGames[i]).then((res) => {
                console.log(res);
                const rules = {
                    name: openGames[i],
                    entryFee: res.entryFee,
                    maxGuess: res.maxGuess,
                    minGuess: res.minGuess,
                    minPlayers: res.minPlayers,
                }
                setOpenGamesDetails([...openGamesDetails, rules]);
                console.log("open Game Details", openGamesDetails)
            })
        }
    };

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
                        <Link to={`/entergame/${game}`} className="gamecontainer" key={game} state={{ from: game }}>
                            <p>{game}</p>
                            {/* <p>Entry Fee: {game.fee}</p>
                            <p>Guess between {game.minGuess} - {game.maxGuess}</p>
                            <p>current Players: {game.players}</p> */}
                        </Link>
                    ))) : (
                    <h2>no games here yet</h2>
                )}
            </div>
        </>
    )
}

export default CurrentOpenGames