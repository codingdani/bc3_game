import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import "../utils/interact";
import { getCurrentWalletConnected } from '../utils/interact';

function HomeScreen() {

    const [walletAddress, setWalletAddress] = useState<string>("");

    useEffect(() => {
        async function fetchWallet() {
            const { address } = await getCurrentWalletConnected();
            setWalletAddress(address);
        }
        async function addWalletListener() {
            if (window.ethereum) {
                window.ethereum.on("accountsChanged", (accounts: any) => {
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                    }
                    else {
                        setWalletAddress("");
                    }
                });
            };
        };
        fetchWallet();
        addWalletListener();
    }, []);

    return (
        <>
            <h1>King of Diamonds</h1>
            <p id="belowh1">the winner takes it all</p>
            {walletAddress ?
                <>
                    <Link to="/creategame"><button id="creategamebtn" className="btn">Create Game</button></Link>
                    <Link to="/opengames"><button id="searchforgamebtn" className="btn">Scout Games</button></Link>
                </>
                : null
            }
        </>
    )
}

export default HomeScreen