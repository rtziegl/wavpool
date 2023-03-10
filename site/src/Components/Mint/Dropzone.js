import "./dropzone.css";
import "./meta-button.css";
import MetaForm from "./MetaForm";
import React, { useEffect, useState, useRef } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FaPauseCircle } from "react-icons/fa";
import * as IPFS from "ipfs-core";

export default function DragDropFile() {
  // Drag state.
  const [dragActive, setDragActive] = useState(false);
  const [justDropped, setDropped] = useState(false);
  const [correctFileType, setCorrectFileType] = useState(false);
  const [justSubmitted, setSubmit] = useState(false)

  // File state.
  const [file, setFile] = useState();

  // Click state.
  const [click, toggleClick] = useState(false)

  // Audio state.
  const [audioObject, setAudio] = useState()

  // Input ref.
  const inputRef = useRef(null);

  //Cid ref.
  const cid = useRef(null);

  // Handles drag events.
  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Triggers when file is dropped.
  // File type checking.
  // sets the file useState.
  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDropped(true)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      let file = e.dataTransfer.files[0];
      console.log(file)

      if (file.type != "audio/mpeg" && file.type != "audio/wav") {
        alert("Wrong file type, must be mp3 or wav.")
        setDropped(false)
      }
      else {
        setFile(file)
        setCorrectFileType(true)
      }
    }
  };

  // Triggers when file is selected with click.
  // File type checking.
  // sets the file useState.
  const handleChange = function (e) {
    e.preventDefault();
    setDropped(true);
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      console.log(file)

      if (file.type != "audio/mpeg" && file.type != "audio/wav") {
        alert("Wrong file type, must be mp3 or wav.")
        setDropped(false)
      }
      else {
        setFile(file)
        setCorrectFileType(true)
      }
    }
  };

  // Triggers the input when the button is clicked.
  const onButtonClick = () => {
    inputRef.current.click();
  };

  // Creates reader that can then play the audio file.
  const play = () => {
    let reader = new FileReader();
    toggleClick(true)
    reader.readAsDataURL(file)
    reader.onload = e => {
      const audio = new Audio(e.target.result);
      audio.play()
      setAudio(audio)
    };

  };

  // Pauses the Audio using the state.
  const pause = () => {
    toggleClick(false)
    audioObject.pause()
  };

  // Add audio file to IPFS and get the cid.
  const commitFileToIPFS = async () => {
    const node = await IPFS.create({ repo: 'ok' + Math.random() })
    const results = await node.add(file)

    // Setting CID.
    cid.current = "ipfs://"
    cid.current += results.path

    // Setting Metadata Screen.
    setSubmit(true)

    console.log(results)
    console.log(results.path)
    console.log({ cid })

  }

  return (
    <div>
      {!justDropped && !correctFileType && <div className="wrap"><form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
        <input ref={inputRef} type="file" id="input-file-upload" multiple={false} onChange={handleChange} onSubmit={(e) => e.preventDefault()} />
        <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
          <div className="around-form">
            <p>Drag and drop your file here or</p>
            <button className="upload-button" onClick={onButtonClick}>Upload a file.</button>
          </div>
        </label>
        {dragActive &&
          <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}> Drop it.</div>
        }
      </form></div>}

      {correctFileType && !justSubmitted && <div className="after-drop-bg">
        <h3>File Preview</h3>
        <div className="after-drop-top">
          <div className="play-button">
            {!click && <div onClick={play}><FaPlayCircle /></div>}
            {click && <div onClick={pause}><FaPauseCircle /></div>}
          </div>
        </div>
        <input ref={inputRef} type="file" id="input-file-upload" multiple={false} onChange={handleChange} onSubmit={(e) => e.preventDefault()} />
        <button className="upload-button-1" onClick={onButtonClick}>Change File</button>
        <h4>or</h4>
        <div className="extra-button-space-1">
          <button className="button-59" role="button" type="submit" onClick={commitFileToIPFS}>Upload</button>
        </div>
      </div>}

      {justSubmitted && justDropped && <div className="after-drop-bg">
        <div className="after-submit">
          <MetaForm cid={cid.current} />
        </div>
      </div>}


    </div>
  );
};