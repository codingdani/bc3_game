import React from 'react'

function EnterGame() {
    return (
        <>
            <div className="layer"></div>
            <h2>Name of Game</h2>
            <button id="backbtn" className="btn">back</button>
            <div className="container1 enterfee">
                <h3>Enter Your Guess: </h3>
                <input type="number" />
            </div>
            <div className="container3">
                <h3>Fee: </h3>
                <div className="flex">
                    <span>5</span>
                    <div id="eth_animation"></div>
                </div>
            </div>
            <button id="startbtn" className="btn">Enter Game</button>
        </>
    )
}

export default EnterGame