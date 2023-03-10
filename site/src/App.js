import Navbar from "./Components/Navbar/Navbar.js";
import Underline from "./Components/Underline/Underline.js"
import Main from "./Components/Main/Main"
import About from "./Components/About/About.js"
import Mint from "./Components/Mint/Mint.js"
import Discord from "./Components/Discord/Discord.js"
import Marketplace from "./Components/Marketplace/Marketplace.js";
import Vote from "./Components/Vote/Vote.js";

import { Route, Routes } from "react-router-dom"

function App() {
  return (
    <div className="App">
      <Navbar />
      <Underline />
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/marketplace' element={<Marketplace />} />
        <Route path='/mint' element={<Mint />} />
        <Route path='/vote' element={<Vote />} />
        <Route path='/discord' element={<Discord />} />
        <Route path='/about' element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
