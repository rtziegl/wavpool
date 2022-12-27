import './nav-button.css';
import './nav.css';
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import React, {useEffect, useState} from "react";
const {ethers} = require("ethers");

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })

  return (
      <li className={isActive ? "active" : ""}>
          <Link to={to} {...props}>
              {children}
          </Link>
      </li>
  )
}

export default function Navbar(){
  const [currentAccount, setCurrentAccount] = useState("No account connected.");
  const [connected, toggleConnect] = useState(false);
  const checkIfWalletConnected = async () => {

    try {
    const { ethereum } = window;
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        return true;
    } 
    else
        console.log("No authorized account found")
        return false;
    } catch (error) {
    console.log(error);
    }
}

const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Need an ETH wallet to connect to!");
      }
      else{
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
      }
      
    } catch (error) {
      alert("Wallet could not be connected.")
    }
  }

  useEffect(() => {
    if (checkIfWalletConnected())
      toggleConnect(true)
  }, [])

  return(
    <div className='head'>
      <div className="logo"><Link to='/'>wav pool</Link></div>
      <nav>
          <ul className="nav_links">
            <li><a href="#"><CustomLink to='/thepool'>the pool</CustomLink></a></li>
            <li><a href="#"><CustomLink to='/discord'>discord</CustomLink></a></li>
            <li><a href="#"><CustomLink to='/about'>about</CustomLink></a></li>
          </ul>
      </nav>
      <a className="connect" href="#">
        {!connected && (<button className="button-59" role="button" onClick={() => connectWallet()}>connect wallet</button>)}
        {connected && (<div className="account">{currentAccount.substring(0,10)}..</div>)}
      </a>
    </div>
  );
}
    