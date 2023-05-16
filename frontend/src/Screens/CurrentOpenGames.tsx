import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
        const fetchGameRules = async (openGames: string[]) => {
            const gameArray: TGameDetails[] = []
            for (let i = 0; i < openGames.length; i++) {
                const res = await getGameDetails(openGames[i])
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
                        console.log(`iteration: ${i}`, gameArray)
                    })
            }
        }
        fetchGameRules(openGames);
    }, [openGames])

    useEffect(() => {
        const getGameList = async () => {
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
            <div id="container_for_all_games">
                {openGamesDetails && openGamesDetails.length > 0 ? (
                    openGamesDetails.map((game) => (
                        <Link to={`/entergame/${game.name}`} className="gamecontainer" key={game.name} state={{ from: game.name }}>
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