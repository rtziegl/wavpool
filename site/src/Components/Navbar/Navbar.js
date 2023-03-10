import './nav-button.css';
import './nav.css';
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import React, { useEffect, useState } from "react";
import abi from "../../contract_utils/Competition.json";
const { ethers } = require("ethers");

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

export default function Navbar() {
  const [currentAccount, setCurrentAccount] = useState("No account connected.");
  const [connected, toggleConnect] = useState(false);
  const [owner, setOwner] = useState(false);
  const contractAddress = "0x8E6C0104EA3De7A201F8ebA1D0aDe6a026e0bFE2";
  const contractABI = abi.abi;
  

  const checkIfWalletConnected = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const compContract = new ethers.Contract(contractAddress, contractABI, signer);
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        toggleConnect(true)

        if (await compContract.checkIfOwner() == true){
          console.log("OWNER")
          setOwner(true)
        }
        else{
          console.log("NOT OWNER")
          setOwner(false)
        }
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
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });

        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
        toggleConnect(true)
      }
      else {
        alert("Need an ETH wallet to connect to!");
      }

    } catch (error) {
      alert("Wallet could not be connected.")
    }
  }

  useEffect(() => {
    checkIfWalletConnected()
  }, [])

  return (
    <div className='head'>
      <div className="logo"><Link to='/'>wavpool</Link></div>
      <nav>
        <ul className="nav_links">
          {owner && <CustomLink to='/admin'>admin</CustomLink>}
          <CustomLink to='/marketplace'>nft store</CustomLink>
          <CustomLink to='/mint'>mint</CustomLink>
          <CustomLink to='/vote'>vote</CustomLink>
          <CustomLink to='/leaderboard'>leaderboard</CustomLink>
          <CustomLink to='/discord'>discord</CustomLink>
          <CustomLink to='/about'>about</CustomLink>
        </ul>
      </nav>
      <a className="connect" href="#">
        {!connected && (<button className="button-59" role="button" onClick={() => connectWallet()}>connect wallet</button>)}
        {connected && (<div className="account">{currentAccount.substring(0, 10)}..</div>)}
      </a>
    </div>
  );
}
