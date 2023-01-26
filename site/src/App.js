import Navbar from "./Components/Navbar/Navbar.js";
import Underline from "./Components/Underline/Underline.js"
import Main from "./Components/Main/Main"
import About from "./Components/About/About.js"
import ThePool from "./Components/ThePool/ThePool.js"
import Discord from "./Components/Discord/Discord.js"
import { Route, Routes } from "react-router-dom"

function App() {
  return (
    <div className="App">
      <Navbar />
      <Underline />
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/thepool' element={<ThePool />} />
        <Route path='/discord' element={<Discord />} />
        <Route path='/about' element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
