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
            <button id="startbtn" className="btn">Create Game</button>
        </>
    )
}

export default StartGame