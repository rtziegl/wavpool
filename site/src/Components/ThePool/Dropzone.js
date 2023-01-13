import "./dropzone.css";
import "./meta-button.css";
import MetaForm from "./MetaForm";
import React, {useEffect, useState, useRef} from "react";
import {FaPlayCircle} from "react-icons/fa";
import { FaPause } from "react-icons/fa";

export default function DragDropFile() {
    // drag state
    const [dragActive, setDragActive] = useState(false);
    const [justDropped, setDropped] = useState(false);
    const [file, setFile] = useState();
    // ref
    const inputRef = useRef(null);
    
    // handle drag events
    const handleDrag = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };
    
    // triggers when file is dropped
    const handleDrop = function(e) {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      setDropped(true)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        let file = e.dataTransfer.files[0];
        console.log(file)
        
        if (file.type != "audio/mpeg" && file.type !="audio/wav")
            alert("Wrong file type, must be mp3 or wav.")
        else{
          setFile(file)
        }
      }
    };
    
    // triggers when file is selected with click
    const handleChange = function(e) {
      e.preventDefault();
      setDropped(true);
      if (e.target.files && e.target.files[0]) {
        let file = e.target.files[0];
        console.log(file)

        if (file.type != "audio/mpeg" && file.type !="audio/wav")
          alert("Wrong file type, must be mp3 or wav.")
        else{
          setFile(file)
        }
      }
    };
    
    // triggers the input when the button is clicked
    const onButtonClick = () => {
      inputRef.current.click();
    };
    
  
    const play = () => {
      let reader = new FileReader();
      reader.readAsDataURL(file)
      reader.onload = e => {
        const audio = new Audio(e.target.result);
        audio.play();
      };
      
    };

    return (
    <div>
        
        {!justDropped && <div className="wrap"><form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
            <input ref={inputRef} type="file" id="input-file-upload" multiple={false} onChange={handleChange} onSubmit={(e) => e.preventDefault()} />
            <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
                <div className="around-form">
                    <p>Drag and drop your file here or</p>
                    <button className="upload-button" onClick={onButtonClick}>Upload a file.</button>
                </div> 
            </label>
            { dragActive && 
            <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}> Drop it.</div>
            }
        </form></div>}
        
        {justDropped && <div className="after-drop-bg"> 
          <div className="after-drop-left">
            <div className="play-button"><div onClick={play}><FaPlayCircle /></div></div>
          </div>
          <div className="after-drop-right"> 
            <MetaForm /> 
          </div>
          </div>}
      </div>
    );
  };