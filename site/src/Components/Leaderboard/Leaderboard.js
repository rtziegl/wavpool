import './leaderboard.css';
import React, { useEffect, useState } from "react";
import abi from "../../contract_utils/Competition.json";
const { ethers } = require("ethers");
const web3 = require('web3');
export default function Leaderboard() {
    const [competitors, setCompetitors] = useState([]);
    const getLeaderboardStats = async () => {
        const contractAddress = "0x62c921f6EFf43333970Ae7650BF9aa110D2b28D2";
        const contractABI = abi.abi;
        let amtOfLeaders = []

        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);
                let allCompetitors = await compContract.getAllUsers()

                for (let i = 0; i < allCompetitors.length; i++) {
                    let competitorInfo = await compContract.getCompetitorStats(allCompetitors[i]);
                    for (let j = 0; j < competitorInfo[2].length; j++) {
                        amtOfLeaders.push(web3.utils.hexToNumber(competitorInfo[2][j]));
                    }
                    const updateCompetitors = [
                        ...competitors,
                        {
                            id: competitors.length + 1,
                            address: competitorInfo[0],
                            gainedVotesAllTime: web3.utils.hexToNumber(competitorInfo[1]),
                            amtOfFirst: amtOfLeaders[0],
                            amtOfSecond: amtOfLeaders[1],
                            amtOfThird: amtOfLeaders[1],
                            amtOfCompsEntered: web3.utils.hexToNumber(competitorInfo[3]),
                            nftCountAllTime: web3.utils.hexToNumber(competitorInfo[4]),
                        }
                    ];
                    setCompetitors(updateCompetitors)
                }
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getLeaderboardStats()
    }, [])

    return (
        <div>
            Leaderboard
            <ul>
                {competitors.map(competitor => (
                    <li key={competitor.id}>
                        <p>{competitor.address}</p>
                        <p>{competitor.amtOfFirst}</p>
                        <p>{competitor.amtOfSecond}</p>
                        <p>{competitor.amtOfThird}</p>
                        <p>{competitor.gainedVotesAllTime}</p>
                        <p>{competitor.amtOfCompsEntered}</p>
                        <p>{competitor.nftCountAllTime}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}