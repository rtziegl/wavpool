import React, { useEffect, useState, useRef } from "react";
import * as IPFS from "ipfs-core";
import { ethers } from "ethers";
import abi from "../../contract_utils/Competition.json";

export default function MetaForm({ cid }) {
    const [title, setTitle] = useState('');
    const [producer, setProducer] = useState('');
    const [key, setKey] = useState('');
    const [bpm, setBPM] = useState('');
    const [description, setDescription] = useState('');
    const [beat, setBeat] = useState(cid);

    const [currentAccount, setCurrentAccount] = useState("");
    const contractAddress = "0x2ceB2b6fAD60f7c4CeF2a33846bC07Eca1Acba40";
    const contractABI = abi.abi;

    const mint = async (nftUri) => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);
                // Minting the token.
                await compContract.mintNFTLogic(
                    nftUri,
                    {
                        gasLimit: 500_000,
                    },
                ).then((tx) => {
                    provider.waitForTransaction(tx.hash)
                    .then(()=>{
                      console.log("success");
                      console.log(tx.hash);
                    })
                  })
                  .catch((error) => {
                    console.log(error);
                  })
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Adding metaData including original file IPFS to IPFS.
    const commitJsonToIPFS = async (json) => {
        const node = await IPFS.create({ repo: 'ok' + Math.random() })
        const results = await node.add(json)
        let nftUri = 'ipfs://'
        nftUri += results.path
        console.log(nftUri)
        mint(nftUri)
    }

    function handleSubmit(event) {
        event.preventDefault();
        var jsonData = {
            title,
            producer,
            key,
            bpm,
            description,
            beat,
        }

        console.log(JSON.stringify(jsonData))
        const finalizedData = JSON.stringify(jsonData)
        commitJsonToIPFS(finalizedData)
    }

    return (
        <form onSubmit={handleSubmit} className="meta-form">
            <h2 className="meta-title">Metadata</h2>
            <div>
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="producer">Producer</label>
                <input
                    id="producer"
                    type="text"
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="key">Key</label>
                <input
                    id="key"
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="BPM">BPM</label>
                <input
                    id="BPM"
                    type="text"
                    value={bpm}
                    onChange={(e) => setBPM(e.target.value)}
                />
            </div>
            <div>
                <label className='extra-text-space' htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    cols="50"
                />
            </div>
            <div className="extra-button-space-1">
                <button className="button-59" role="button" type="submit">Submit</button>
            </div>
        </form>
    );
}