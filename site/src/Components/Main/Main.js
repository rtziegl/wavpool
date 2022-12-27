import './main.css';
import './main-button.css'
import React, {useEffect, useState} from "react";
const {ethers} = require("ethers");

export default function Main(){
    const [remainingSpots, updateRemaining] = useState("Unkown");

    return(
        <div>
            <div className='body2'>
                <div className='content'>
                    <h3>Be a part of the newest wav of music creation.</h3>
                </div>
            </div>
            <div className='grandparent'>
                <div className="parent">
                    <div className="child1">
                        <div className='left-box'>
                            <div className='box-header'>Catch the next wav</div>
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