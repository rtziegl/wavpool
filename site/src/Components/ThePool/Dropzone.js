import "./dropzone.css";
import React, {useEffect, useState, useRef} from "react";

export default function DragDropFile() {
    // drag state
    const [dragActive, setDragActive] = useState(false);
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
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        let file = e.dataTransfer.files[0];
        let reader = new FileReader();
        console.log(file)
        //reader.readAsDataURL(file)
        if (file.type != "audio/mpeg")
            console.log("Oops")
        else{
            reader.readAsDataURL(file);
            reader.onload = e => {
                const audio = new Audio(e.target.result);
                audio.play();
            };
        }
      }
    };
    
    // triggers when file is selected with click
    const handleChange = function(e) {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        // handleFiles(e.target.files);
      }
    };
    
  // triggers the input when the button is clicked
    const onButtonClick = () => {
      inputRef.current.click();
    };
    
    return (
    <div className="wrap">
        <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
            <input ref={inputRef} type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
            <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
           
            </label>
            { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
        </form>
        <div className="spacer">
                <button className="upload-button" onClick={onButtonClick}>Upload a file</button>
        </div>
      </div>
    );
  };