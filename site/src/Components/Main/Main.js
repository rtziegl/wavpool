import './main.css';
import './main-button.css'
import './main-header.css'
import React, { useEffect, useState } from "react";
import abi from "../../contract_utils/Competition.json";
const { ethers } = require("ethers");

export default function Main() {
    const [remainingSpots, updateRemaining] = useState("Competition hasn't started.");
    const contractAddress = "0xfcA9C127Dc84B8a950e75de7d778B2A381e23BC6";
    const contractABI = abi.abi;

    //Gets competition stats from Competition.sol.
    const getCompStats = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);

                let compinfo = await compContract.getCompetitionStats()
                console.log(compinfo[1])
                if (compinfo[1].length == 0) {
                    updateRemaining("Competition hasn't started yet.")
                }
                else {
                    updateRemaining(parseInt(compinfo[3]._hex, 16))
                }


            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getCompStats()
    }, [])

    return (
        <div>
            <div className='wave-text'>
                <div className='content'>
                    <h3 className='wave-text'>Be a part of the newest wave of music creation.</h3>
                </div>
            </div>
            <div className='grandparent'>
                <div className="parent">
                    <div className="child1">
                        <div className='left-box'>
                            <div className='box-header'>Catch the next wave</div>
                            <li className='main-li'>Connect your metamask wallet.</li>
                            <li className='main-li'>Buyin to the competition.</li>
                            <li className='main-li'>Make a beat with the sample given to you on buy in.</li>
                            <li className='main-li'>Drop the beat in the pool before time is up.</li>
                            <li className='main-li'>Vote on which beat you like the best.</li>
                            <li className='main-li'>Collect the rewards.</li>
                        </div>
                    </div>
                    <div className='vl'></div>
                    <div className="child2">
                        <div className='left-box'>
                            <div className='box-header'>Buyin</div>
                            <div className='button-size'>
                                <button className="button-592" role="button" onClick={() => "connectWallet()"}>Buyin to the competition.</button>
                            </div>
                            <div className='box-header2'>Spots Remaining</div>
                            <li className='main-li'>{remainingSpots}</li>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}