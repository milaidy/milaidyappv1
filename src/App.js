import React, { useState, useEffect } from 'react';
import { getContract } from './contracts/getContract';
import './App.css';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserNFTs from './UserNFTs';
import ImageGenerator from './ImageGenerator';
import logo from './logo.png';
import logo2 from './logo2.png';
import logo3 from './logo3.png';
import scatterLogo from './scatterLogo.png';
import { useCallback } from 'react'; // Import useCallback
import MintComponent from './MintComponent'; // Add this import statement

function App() {
  const [quantity, setQuantity] = useState(1);
  const [account, setAccount] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [ownsNFT, setOwnsNFT] = useState(false);
  const [userNFTs, setUserNFTs] = useState([]);
  const [hasUserNFTs, setHasUserNFTs] = useState(false);

  const shortenAddress = (address, chars = 2) => {
    return address
      ? `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
      : "";
  };

  const connectWallet = async () => {
    try {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: {
              1: 'https://mainnet.infura.io/v3/0348e5cae08944bd9eb663da5a1e3b4d',
            },
          },
        },
      };

      const web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: true,
        providerOptions,
      });

      const provider = await web3Modal.connect();
      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      provider.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });

      provider.on('chainChanged', async (chainId) => {
        const networkId = await web3.eth.net.getId();
        console.log('Network changed to:', networkId);
      });

      provider.on('disconnect', (code, reason) => {
        console.log('Disconnected:', code, reason);
        setAccount(null);
      });
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };



  const fetchTotalSupply = async () => {
    const options = { method: 'GET', headers: { accept: 'application/json' } };
    const url = 'https://api.opensea.io/api/v1/collection/milaidyartaccmachine/stats'; // Replace with your actual collection slug

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      setTotalSupply(data.stats.total_supply);
    } catch (error) {
      console.error('Error fetching total supply:', error);
    }
  };
  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        setAccount(window.ethereum.selectedAddress);
      }
    };

    loadAccount();
    fetchTotalSupply(); // Add this line
  }, []);
  const contractAddresses = [
    '0x499De9CF6465c050aE116Afcbf9105e1d7259cb7', // First contract address
  ];

  const checkNFTOwnership = useCallback(async () => {
    if (!account) return;

    let userNFTs = [];

    try {
      for (const contractAddress of contractAddresses) {
        const response = await fetch(`https://api.opensea.io/api/v1/assets?owner=${account}&asset_contract_address=${contractAddress}`);
        const data = await response.json();
        const filteredAssets = data.assets.filter(asset => contractAddresses.includes(asset.asset_contract.address));
        userNFTs = userNFTs.concat(filteredAssets);
      }
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
    }

    setHasUserNFTs(userNFTs.length > 0);
    setUserNFTs(userNFTs); // Add this line to update the userNFTs state variable
  }, [account]);

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        setAccount(window.ethereum.selectedAddress);
      }
    };

    loadAccount();
    fetchTotalSupply();
  }, []);

  useEffect(() => {
    checkNFTOwnership();
  }, [account, checkNFTOwnership]);

  const handleMint = async () => {
    if (!account) return;

    const { web3, contractInstance } = await getContract();

    const fixedPrice = web3.utils.toWei('0.0069', 'ether');
    const totalAmount = web3.utils.toBN(quantity).mul(web3.utils.toBN(fixedPrice));

    const auth = {
      key: "0x0000000000000000000000000000000000000000000000000000000000000000",
      proof: [],
    };
    const affiliate = "0x0000000000000000000000000000000000000000";
    const signature = "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    await contractInstance.methods
      .mint(auth, quantity, affiliate, signature)
      .send({ from: account, value: totalAmount.toString() });
  };







  return (
    <div className="App">
      <header className="header">
        <nav className="top-menu">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/image-generator">milAidy/acc art machine</Link>
            </li>
          </ul>
        </nav>
      </header>
      <Routes>
        <Route
          path="/"
          element={
            <div className="container">
              <div className="text-background">
                <h1>milAIdy ART ACCELERATOR</h1>
                <h3>generate your own ai milady</h3>
                <h3>***at your own discretion***</h3>
                <p>Minted: {totalSupply}/10,000</p>

                

                <p> </p>

                <p> </p>
                <p>0.0069 eth / generator mint</p>

                {account ? (
                  <p>Connected Account: {shortenAddress(account)}</p>
                ) : (
                  <div className="connect-section">
                    <p>Please connect your MetaMask account.</p>
                    <button className="xp-button" onClick={connectWallet}>
                      connect
                    </button>
                  </div>
                )}

                <div className="mint-redirect-section">

                  <p>
                    <Link to="/image-generator" className="center-text">
                      CLICK HERE FOR ART MACHINE
                    </Link>
                  </p>
                </div>

                <div className="logo-container">
                  <a href="https://opensea.io/collection/milaidyartaccmachine" target="_blank" rel="noopener noreferrer">
                    <img className="logo-opensea" src={logo} alt="OpenSea Logo" />
                  </a>
                  <a href="https://twitter.com/mil_ai_dy" target="_blank" rel="noopener noreferrer">
                    <img className="logo-twitter" src={logo2} alt="Twitter Logo" />
                  </a>
                  <a href="https://etherscan.io/address/0x3E8Ea79dcbd42Ff525bd98A56Cc0b63f58f2eBbb" target="_blank" rel="noopener noreferrer">
                    <img className="logo-twitter" src={logo3} alt="etherscan Logo" />
                  </a>
                </div>
              </div>
            </div>
          }
        />
        <Route path="/nfts" element={<UserNFTs account={account} userNFTs={userNFTs} />} />
        <Route path="/image-generator" element={<ImageGenerator />} />
        <Route path="/mint" element={<MintComponent />} /> {/* Add a new Route for the /mint path */}
      </Routes>
    </div>
  );
}

export default App;