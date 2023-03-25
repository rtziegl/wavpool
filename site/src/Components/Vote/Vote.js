import React, { useEffect, useState } from "react";
import * as IPFS from "ipfs-core";
//import { create } from 'ipfs-http-client'
const BufferList = require('bl/BufferList')

export default function Vote(){
    const [file, setFile] = useState("")
    const playBeat = () => {
        console.log(file)
        file.play()
      };

    const getCompetitorsWavs = async () => {
        try {
            let cid = "QmT1gBqqa8PdsdiAUeAjqTbWWeqYGiJSmhnojZQqdjq8XX";
            const sound = new Audio("https://ipfs.io/ipfs/" + cid)
            setFile(sound)

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