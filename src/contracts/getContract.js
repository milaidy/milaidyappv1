// src/contracts/getContract.js
import Web3 from 'web3';
import { Web3BuildersABI } from './Web3BuildersABI';

export async function getContract() {
  const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();

  // Replace this with your deployed contract address
  const contractAddress = '0xA8bC6f2DAAF5409951264756B01b244fB01018d6';

  const contractInstance = new web3.eth.Contract(Web3BuildersABI, contractAddress);
  return { web3, accounts, contractInstance };
}
