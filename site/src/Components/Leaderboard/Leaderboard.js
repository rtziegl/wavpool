import './leaderboard.css';
import React, { useEffect, useState } from "react";
import abi from "../../contract_utils/Competition.json";
const { ethers } = require("ethers");
export default function Leaderboard(){
    let allCompets = [];

    const getLeaderboardStats = async () => {
        const contractAddress = "0x62c921f6EFf43333970Ae7650BF9aa110D2b28D2";
        const contractABI = abi.abi;

        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);
                let allCompetitors = await compContract.getAllUsers()
                console.log(allCompetitors)

                for (let i = 0; i < allCompetitors.length; i++) {
                    let competitorInfo = await compContract.getCompetitorStats(allCompetitors[i])
                    console.log(competitorInfo)
                    allCompets.push(competitorInfo)
                }
                console.log(allCompets)
            }
            
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getLeaderboardStats()
    }, [])

    return(
        <div>
            Leaderboard
        </div>
    );
}