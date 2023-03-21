import { nftUris } from "../Mint/MetaForm";
import React, { useEffect, useState } from "react";
import * as IPFS from "ipfs-core";
const makeIpfsFetch = require('ipfs-fetch')
export default function Vote(){
    console.log(nftUris)

    const getCompetitorsWavs = async () => {
        try {
            const ipfs = await IPFS.create()
            const fetch = await makeIpfsFetch({ipfs})
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getCompetitorsWavs()
    }, [])

    return(
        <div>
            Vote
        </div>
    );
}