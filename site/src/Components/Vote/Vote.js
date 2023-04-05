import React, { useEffect, useState } from "react";
import * as IPFS from "ipfs-core";
import abi from "../../contract_utils/Competition.json";
const { ethers } = require("ethers");
const BufferList = require('bl/BufferList')

export default function Vote(){
    const [file, setFile] = useState("")
    const contractAddress = "0xCf9B7f05035232a128Cfe89D5135e1dCa3508ef3";
    const contractABI = abi.abi;

    const playBeat = () => {
        console.log(file)
        file.play()
      };

    const getCompetitorsWavs = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);
                
                let tokenIds = await compContract.getCompetitionStats()
                console.log(tokenIds[2])
                /*for (let i = 0; i < tokenIds.length; i++) {
                    tokenIds[i] = await compContract.tokenURI(tokenIds[i])
                }*/
            }
            /*let cid = "QmT1gBqqa8PdsdiAUeAjqTbWWeqYGiJSmhnojZQqdjq8XX";
            const sound = new Audio("https://ipfs.io/ipfs/" + cid)
            setFile(sound)*/

        } catch (error) {
            console.log(error)
            console.log("hi")
        }
    }

    useEffect(() => {
        getCompetitorsWavs()
    }, [])

    return(
        <div>
            <button onClick={playBeat}> play </button>
            Vote
        </div>
    );
}