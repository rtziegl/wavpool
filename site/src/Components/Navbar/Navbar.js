import './nav-button.css';
import './nav.css';

export default function Navbar(){
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
    