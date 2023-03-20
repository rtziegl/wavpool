import './main.css';
import './main-button.css'
import './main-header.css'
import React, { useEffect, useState } from "react";
import abi from "../../contract_utils/Competition.json";
const web3 = require('web3');
const { ethers } = require("ethers");

export default function Main() {
    const [compTitle, setCompTitle] = useState("");
    const [compType, setCompType] = useState("");
    const [compSpots, setCompSpots] = useState("");
    const [compCost, setCompCost] = useState("");
    const [compStarted, setCompStarted] = useState(false)
    const contractAddress = "0x62c921f6EFf43333970Ae7650BF9aa110D2b28D2";
    const contractABI = abi.abi;

    //Gets competition stats from Competition.sol.
    const getCompStats = async () => {

        /*
        _comps[_compIds].compId, 0
        _comps[_compIds].usersInComp, 1
        _comps[_compIds].typeOfComp, 2
        _comps[_compIds].totalSpotsInComp, 3
        _comps[_compIds].costToJoin, 4
        _comps[_compIds].isCompStarted 5
        */
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);
    
                let compInfo = await compContract.getCompetitionStats()
                // Conversion from wei to actual amount of eth.
                let costInEth = web3.utils.fromWei(web3.utils.hexToNumberString(compInfo[4]._hex, 'ether'))
                console.log(compInfo)
                if (compInfo[5] == true) {
                    setCompStarted(true)
                    setCompTitle(parseInt(compInfo[0]._hex, 16))
                    setCompType(compInfo[2])
                    setCompSpots(parseInt(compInfo[3]._hex, 16))
                    setCompCost(costInEth)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const buyinToComp =  async () =>{
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);
                var buyTXoptions = { value: ethers.utils.parseEther(compCost) }
                await compContract.buyin(buyTXoptions)
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
                        {compStarted && (<div className='left-box'>
                            <li className='main-li'>Competition #{compTitle}</li>
                            <li className='main-li'>Type: {compType}</li>
                            <li className='main-li'>Cost to join: {compCost} ETH</li>
                            <li className='main-li'>Spots remaining: {compSpots}</li>
                            <div className='button-size'>
                                <button className="button-592" role="button" onClick={buyinToComp}>Buyin to the competition.</button>
                            </div>
                        </div>)}
                        {!compStarted &&  (<div className='left-box-no-comp'><div className='box-header'>No competition currently</div> </div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}