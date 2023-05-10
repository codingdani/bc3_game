import React from 'react'

function StartGame() {
    return (
        <>
            <div className="layer"></div>
            <h2>Name of Game</h2>
            <div className="details">
                <p>Contract Adress: 0x0000000000000000000000000000000</p>
                <a href="" target="_blank">show on Etherscan</a>
            </div>
            <div className="container2">
                <p>current number of <b>Players</b>: </p>
                <span className="importantnr">5</span>
            </div>
            <span id="countdown_status">Countdown started</span>
            <div className="container3">
                <p><b>Balance</b> of Contract: </p>
                <div className="flex">
                    <span className="importantnr">5</span>
                    <div id="eth_animation"></div>
                </div>
            </div>
            <button id="startbtn" className="btn">Start Game</button>
        </>
    )
}

export default StartGame