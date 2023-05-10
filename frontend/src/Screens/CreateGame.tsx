import React from 'react'

function CreateGame() {
    return (
        <>
            <div className="layer">
            </div>
            <h2>Enter the Rules</h2>
            <div className='containergrid'>
                <div className="container1">
                    <p>min number of Players: </p>
                    <input type={"number"}></input>
                </div>
                <div className='container2'>
                    <p>Range of Guess: </p>
                    <input type={"number"}></input>
                    <input type={"number"}></input>
                </div>
                <div className='container3'>
                    <p>Entry Fee: </p>
                    <input type={"number"}></input>
                </div>
                <div className='container4'>
                    <p>Enter a Name: </p>
                    <input type={"text"}></input>
                </div>
            </div>
            <button id="startbtn" className="btn">Create Game</button>
        </>
    )
}

export default CreateGame