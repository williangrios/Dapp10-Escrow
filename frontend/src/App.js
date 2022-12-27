import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

import {  useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter, { async } from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';
import Button from "react-bootstrap/Button";

import { format6FirstsAnd6LastsChar, formatDate } from "./utils";
import meta from "./assets/metamask.png";

function App() {
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [provider, setProvider] = useState();
  const [contract, setContract] = useState();
  const [signer, setSigner] = useState();
  
  const [addressLawyer, setAddressLawyer] = useState('');
  const [addressBeneficiary, setAddressBeneficiary] = useState('');
  const [addressPayer, setAddressPayer] = useState('');
  const [toDeposit, setToDeposit] = useState(0);
  const [deposited, setDeposited] = useState(0);
  const [amount, setAmount] = useState(0);

  const contractAddress = '0x1a02B0e8642DCc03649Dd98f3fCBA14256b466CF';

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
  
  async function handleConnectWallet (){
    try {
      setLoading(true)
      let userAcc = await provider.send('eth_requestAccounts', []);
      setUser({account: userAcc[0], connected: true});


      const contrSig = new ethers.Contract(contractAddress, abi, provider.getSigner())
      setSigner( contrSig)

    } catch (error) {
      if (error.message == 'provider is undefined'){
        toastMessage('No provider detected.')
      }
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    
    async function getData() {
      try {
        const {ethereum} = window;
        if (!ethereum){
          toastMessage('Metamask not detected');
        }
  
        const goerliChainId = "0x5";
        const currentChainId = await window.ethereum.request({method: 'eth_chainId'})
        if (goerliChainId != currentChainId){
          toastMessage('Change to goerli testnet');
        } 

        const prov =  new ethers.providers.Web3Provider(window.ethereum);
        setProvider(prov);

        const contr = new ethers.Contract(contractAddress, abi, prov);
        setContract(contr);

        //contract data
        setDeposited( await contr.balanceOf());
        setToDeposit( await contr.amount());
        setAddressLawyer( format6FirstsAnd6LastsChar( await  contr.lawyer()));
        setAddressBeneficiary( format6FirstsAnd6LastsChar( await contr.beneficiary()));
        setAddressPayer( format6FirstsAnd6LastsChar( await contr.payer()));
        
      } catch (error) {
        toastMessage(error.reason)        
      }
      
    }

    getData()  
    
  }, [])
  
  function isConnected(){
    if (!user.connected){
      toastMessage('You are not connected!')
      return false;
    }
    
    return true;
  }

  async function handleDisconnect(){
    try {
      setUser({});
      setSigner(null);
    } catch (error) {
      toastMessage(error.reason)
    }
  }

  function toastMessage(text) {
    toast.info(text)  ;
  }
 
  async function handleDeposit(){
    
    try {
      if (!isConnected()) {
        return;
      }

      setLoading(true);
      const resp  = await signer.deposit({value: amount});  
      await resp.wait();
      toastMessage("Deposited. Refresh page")
    } catch (error) {
      toastMessage(error.reason)      
    } finally{
      setLoading(false);
    }
  }

  async function handleRelease(){
    
    try {
      if (!isConnected()) {
        return;
      }
      setLoading(true);
      const resp  = await signer.release();  
      await resp.wait();
      toastMessage("Released")
    } catch (error) {
      toastMessage(error.reason)      
    } finally{
      setLoading(false);
    }

  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="Escrow" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>

        <h1>ESCROW</h1>

        {loading && 
          <h1>Loading....</h1>
        }
        { !user.connected ?<>
            <Button className="commands" variant="btn btn-primary" onClick={handleConnectWallet}>
              <img src={meta} alt="metamask" width="30px" height="30px"/>Connect to Metamask
            </Button></>
          : <>
            <label>Welcome {format6FirstsAnd6LastsChar(user.account)}</label>
            <button className="btn btn-primary commands" onClick={handleDisconnect}>Disconnect</button>
          </>
        }
        <hr/> 

        <h2>Contract Info</h2>
        <label>To deposit: {(toDeposit).toString()} wei</label>
        <label>Deposited: {(deposited).toString()}</label>
        <label>Lawyer address: {addressLawyer}</label>
        <label>Payer address: {addressPayer}</label>
        <label>Beneficiary address: {addressBeneficiary}</label>
        <hr/>
        <h2>Deposit Funds (Payer)</h2>
        <input type="number" className="mb-1 commands" placeholder="Deposit your funds (in wei)" onChange={(e) => setAmount(e.target.value)} value={amount} />
        <button className="btn btn-primary commands" onClick={handleDeposit}>Deposit</button>
        <hr/>
        <h2>Release Funds (Lawyer)</h2>
        <button className="btn btn-primary commands" onClick={handleRelease}>Release/Transfer funds to Beneficiary</button>
        
      </WRContent>
      <WRTools react={true} truffle={true} bootstrap={true} solidity={true} css={true} javascript={true} ganache={true} ethersjs={true} />
      <WRFooter />       
    </div>
  );
}

export default App;
