import React from 'react'

function CurrentOpenGames() {
    return (
        <>
            <h2>Currently open Games</h2>
            <button id="backbtn" className="btn">back</button>
            <div id="container_for_all_games">
                <div className="gamecontainer">
                    <p>Name of Game</p>
                    <p>Entry Fee: 1 ETH</p>
                    <p>Guess between 0 - 500</p>
                    <p>current Players: 4</p>
                </div>
                <div className="gamecontainer">
                    <p>Name of Game</p>
                    <p>Entry Fee: 5 ETH</p>
                    <p>Guess between 0 - 1000</p>
                    <p>current Players: 5</p>
                </div>
                <div className="gamecontainer">
                    <p>Name of Game</p>
                    <p>Entry Fee: 2 ETH</p>
                    <p>Guess between 0 - 100</p>
                    <p>current Players: 1</p>
                </div>
            </div>
        </>
    )
}

export default CurrentOpenGames