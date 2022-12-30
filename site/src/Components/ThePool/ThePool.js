import Dropzone from "./Dropzone";
import React, { useCallback, useState } from "react";
import "./thepool.css";

export default function ThePool(){
    return(
        <div>
            <h2 className="pool-header">Drop your beat in the pool to start your upload.</h2>
            <Dropzone />
        </div>
    );
}