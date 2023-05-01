import './admin.css';
import abi from "../../contract_utils/Competition.json";
import React, { useEffect, useState } from "react";
const { ethers } = require("ethers");

export default function Admin(){
    const [spots, setSpots] = useState("");
    const [cost, setCost] = useState("");
    const [type, setType] = useState("");
    const contractAddress = "0x4e2F61DDAF59e21F022e42e6C2EF088FabD33853";
    const contractABI = abi.abi;

    const startComp = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);

                await compContract.startCompetition(spots, ethers.utils.parseEther(cost), type);
            }
        } catch (error) {
            console.log(error)
        }
    }

    const endComp = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);

                await compContract.endCompetition();
            }
        } catch (error) {
            console.log(error)
        }
    }

    const cancelComp = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);

                await compContract.cancelCompetition();
            }
        } catch (error) {
            console.log(error)
        }
    }

    return(
        <div className='admin'>
            <div>
                <label htmlFor="spots">Spots</label>
                <input
                    id="spots"
                    type="text"
                    value={spots}
                    onChange={(e) => setSpots(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="cost">Cost</label>
                <input
                    id="cost"
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="type">Type</label>
                <input
                    id="type"
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                />
            </div>
            <button onClick={startComp}>Start Competition</button>
            <button onClick={endComp}>End Competition</button>
            <button onClick={cancelComp}>Cancel Competition</button>
        </div>
    );
}