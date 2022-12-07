import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from 'react';
import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';
import { ethers } from "ethers";
import './App.css';
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { _toEscapedUtf8String } from "ethers/lib/utils";

function App() {
  
  const [addressLawyer, setAddressLawyer] = useState('');
  const [addressBeneficiary, setAddressBeneficiary] = useState('');
  const [addressPayer, setAddressPayer] = useState('');
  const [toDeposit, setToDeposit] = useState(0);
  const [deposited, setDeposited] = useState(0);
  const [amount, setAmount] = useState(0);

  const addressContract = '0xd6f22ae1232aDDCEfaB9065Cfc4b4b69b2D48093';

  const abi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_payer",
          "type": "address"
        },
        {
          "internalType": "address payable",
          "name": "_beneficiary",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "amount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "beneficiary",
      "outputs": [
        {
          "internalType": "address payable",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "lawyer",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "payer",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [],
      "name": "release",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];
  
  let contractDeployed = null;
  let contractDeployedSigner = null;
  
  function getProvider(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (contractDeployed == null){
      contractDeployed = new ethers.Contract(addressContract, abi, provider)
    }
    if (contractDeployedSigner == null){
      contractDeployedSigner = new ethers.Contract(addressContract, abi, provider.getSigner());
    }
  }

  function toastMessage(text) {
    toast.info(text)  ;
  }

  async function getData() {
    getProvider();
    setDeposited( await contractDeployed.balanceOf());
    setToDeposit( await contractDeployed.amount());
    setAddressLawyer(await  contractDeployed.lawyer());
    setAddressBeneficiary( await contractDeployed.beneficiary());
    setAddressPayer( await contractDeployed.payer());
    toastMessage('Data loaded from blockchain')
  }
 
  async function handleDeposit(){
    getProvider();
    try {
      const resp  = await contractDeployedSigner.deposit({value: amount});  
      toastMessage("Deposited, wait a seconds and refresh page")
    } catch (error) {
      toastMessage(error.data.message);
    }
  }

  async function handleRelease(){
    getProvider();
    try {
      const resp  = await contractDeployedSigner.release();  
      toastMessage("Released")
    } catch (error) {
      toastMessage(error.data.message);
    }
  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="Escrow" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>
 
        {addressLawyer == '' ?
          <>
            <button onClick={getData}>Load data</button>
          </>
          : 
          <>
          <h2>Escrow Info</h2>
          <h5>To deposit: {(toDeposit).toString()} wei</h5>
          <h5>Deposited: {(deposited).toString()}</h5>
          <h5>Lawyer address: {addressLawyer}</h5>
          <h5>Payer address: {addressPayer}</h5>
          <h5>Beneficiary address: {addressBeneficiary}</h5>
          <hr/>
          <h2>Deposit Funds (Payer)</h2>
          <input type="text" placeholder="Deposit your funds (in wei)" onChange={(e) => setAmount(e.target.value)} value={amount} />
          <button onClick={handleDeposit}>Deposit</button>
          <hr/>
          <h2>Release Funds (Lawyer)</h2>
          <button onClick={handleRelease}>Release/Transfer funds to Beneficiary</button>
        </>
        
        }
        
      </WRContent>
      <WRTools react={true} truffle={true} bootstrap={true} solidity={true} css={true} javascript={true} ganache={true} ethersjs={true} />
      <WRFooter />       
    </div>
  );
}

export default App;
