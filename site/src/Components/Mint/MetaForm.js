import React, { useEffect, useState, useRef } from "react";
import * as IPFS from "ipfs-core";
import { ethers } from "ethers";
import abi from "../../contract_utils/Competition.json";

export default function MetaForm({ beatFile }) {
    const [title, setTitle] = useState('');
    const [producer, setProducer] = useState('');
    const [key, setKey] = useState('');
    const [bpm, setBPM] = useState('');
    const [description, setDescription] = useState('');
    const [beat, setBeat] = useState('');
    const [file, setFile] = useState(beatFile)
    const [loading, setLoading] = useState(false)
    const handleLoadingStart = () => {
        setLoading(true);
    };
    const handleLoadingEnd = () => {
        setLoading(false);
    };
    console.log(file)
    //Cid ref.
    const cid = useRef(null);

    const [currentAccount, setCurrentAccount] = useState("");
    const contractAddress = "0x2ceB2b6fAD60f7c4CeF2a33846bC07Eca1Acba40";
    const contractABI = abi.abi;

    // Mints NFT.
    const mint = async (nftUri) => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const compContract = new ethers.Contract(contractAddress, contractABI, signer);
                const buyTXoptions = { value: ethers.utils.parseEther('0.01'), gasLimit: 500_000 }

                const isUserInComp = await compContract.getIfUserInComp();

                // User in comp (free mint + gas fee).
                if (isUserInComp == true) {
                    // Minting the token.
                    await compContract.mintNFTLogic(
                        nftUri,
                        {
                            gasLimit: 500_000,
                        },
                    ).then((tx) => {
                        provider.waitForTransaction(tx.hash)
                            .then(() => {
                                console.log("success");
                                console.log(tx.hash);
                            })
                    })
                        .catch((error) => {
                            console.log(error);
                        })
                }

                // User not in comp (fee for mint + gas fee).
                else {
                    const transaction = await compContract.mintNFTLogic(
                        nftUri, buyTXoptions
                    )
                    // Loading here.
                    console.log("minting pls wait.")
                    handleLoadingStart()
                    const tx = await transaction.wait()
                    handleLoadingEnd()
                    if (tx.status == 1)
                        console.log("success")
                    // End loading here.
                    else
                        console.log("fail")
                }

            }
        } catch (error) {
            console.log(error)
        }
    }

    // Add audio file to IPFS and get the cid.
    const commitFileToIPFS = async () => {
        const node = await IPFS.create({ repo: 'ok' + Math.random() })
        const results = await node.add(file)

        // Setting CID.
        cid.current = "ipfs://"
        cid.current += results.path

        console.log(results)
        console.log(results.path)
        console.log({ cid })

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

    // Handles the submit.
    const handleSubmit = async (event) => {
        event.preventDefault();
        await commitFileToIPFS().then(() => {
            var jsonData = {
                title,
                producer,
                key,
                bpm,
                description,
                cid,
            }
            console.log(jsonData)
            console.log(JSON.stringify(jsonData))
            const finalizedData = JSON.stringify(jsonData)
            commitJsonToIPFS(finalizedData)
        })
    }


    return (
        <div>
            {!loading && (<form onSubmit={handleSubmit} className="meta-form">
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
                <button className="button-59" role="button" type="submit">Mint</button>
            </form>)}
            {loading && <div>
                Loading ....
            </div>}
        </div>
    );
}