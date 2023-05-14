import React from 'react'
import { Link } from 'react-router-dom';
import "../utils/interact";

function HomeScreen() {
    return (
        <>
            <h1>King of Diamonds</h1>
            <Link to="/creategame"><button id="creategamebtn" className="btn">Create Game</button></Link>
            <Link to="/opengames"><button id="searchforgamebtn" className="btn">Scout Games</button></Link>
        </>
    )
}

export default HomeScreen