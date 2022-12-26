import './nav-button.css';
import './nav.css';
import './underline.css';

function Navbar(){
  return(
    <div className='head'>
      <div class="logo">wav pool</div>
        <nav>
            <ul class="nav_links">
            <li><a href="#">about</a></li>
            <li><a href="#">discord</a></li>
            </ul>
        </nav>
        <a class="connect" href="#"><button class="button-59" role="button">connect wallet</button></a>
    </div>
  );
}

function Underline(){
  return(
    <div>
      <hr/> 
    </div>
  );
}


function App() {
  return (
    <div className="App">
      <Navbar />
      <Underline />
    </div>
  );
}

export default App;
