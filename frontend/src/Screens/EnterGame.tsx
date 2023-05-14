import React from 'react'
import { Link } from 'react-router-dom'

function EnterGame() {

    return (
        <>
            <div className="layer"></div>
            <Link to="/opengames" id="backbtn" className="btn">
                back
            </Link>
            <h2>Name of Game</h2>
            <div className="details">
                <p>Contract Adress: 0x0000000000000000000000000000000</p>
                <a href="" target="_blank">show on Etherscan</a>
            </div>
            <div className="enterfee">
                <p>You play against multiple other Players. </p>
                <p>You all enter a guess between 0 and 100.</p>
                <p>The person with the closest guess to <b>66.6% of the intersection of all guesses</b> wins the price.</p>
                <br />
                <h3>Enter Your Guess: <br />0 - 100</h3>
                <div className="form-group">
                    <input type="number" id="input" className="form-input" />
                </div>
                <div className="flex">
                    <h3>Fee: </h3>
                    <span>5</span>
                    <div id="eth_logo"></div>
                </div>
            </div>
            <button id="startbtn" className="btn">Enter Game</button>
        </>
    )
}

export default EnterGame