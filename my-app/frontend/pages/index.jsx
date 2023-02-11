import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import Web3Modal from "web3modal";
import {Addr, Abi, TrancheAbi} from "../constants";
const moment = require('moment')


export default function Home() {

  let count = 0;

  const [walletConnected, setWalletConnected] = useState(false)
  const zero = BigNumber.from("0")
  const [blockTimeStamp, setBlockTimeStamp] = useState(0)
  const [S, setS] = useState(zero);
  const [tOne, setTOne] = useState(zero);
  const [tTwo, setTTwo] = useState(zero);
  const [tThree, setTThree] = useState(zero);
  const [isInvested, setIsInvested] = useState(false);//wouldnt exactly be needed
  const [inLiquidMode, setInLiquidMode] = useState(false);
  const [mintingDAI, setMintingDAI] = useState(0);
  const [userABalance, setUserABalance] = useState(zero);
  const [userBBalance, setUserBBalance] = useState(zero);

  const [value, setValue] = useState(0);
  // {
    // ReadyToAccept: 0,
    // ReadyToInvest: 1,
    // ReadyToDivest: 2,
    // Liquid: 3,
    // FallbackOnlyA: 4,
    // FallbackAll: 5,
  // }

  const web3ModalRef = useRef();

  const getTimes = async () =>{
    //to be run only once 
    const provider = await getProviderOrSigner();
    const contract = new Contract(Addr, Abi, provider);
    setS((await contract.S()))
    setTOne((await contract.T1()));
    setTTwo((await contract.T2()));
    setTThree((await contract.T3()));
  }
  
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };
  

  const updateBlockTimestamp = async () =>{
    const provider = new ethers.providers.InfuraProvider(process.env.QUICKNODE_HTTP_URL);
    provider.getBlock('latest').then((block)=>{
      const t = (block.timestamp)
      setBlockTimeStamp(t)
    })
    const prov = await getProviderOrSigner();
    const contract = new Contract(Addr, Abi, prov);
    console.log(contract)
    const isInvested = (await contract.isInvested())
    console.log("isinvested", isInvested)
    const inLiquidMode = (await contract.inLiquidMode())
    setIsInvested(isInvested)
    setInLiquidMode(inLiquidMode)
  }


  const mintDAI = async () =>{
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(Addr, Abi, signer);
    const mintingDAIBN = utils.parseUnits(mintingDAI.toString(), 18);
    const tx = await contract.splitRisk(mintingDAIBN)//complete after confirming input is bignumber
    await tx.wait();
  }

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Please switch to the Matic network!");
      throw new Error("Please switch to the Matic network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const getUserTrancheBalance = async () =>{
    const signer = await getProviderOrSigner(true);
    const addrUser = (await signer.getAddress())
    const contract = new Contract(Addr, Abi, signer);
    const AtrancheAddr = (await contract.A());
    const BtrancheAddr = (await contract.B());
    const AtrancheContract = new Contract(AtrancheAddr, TrancheAbi, signer);
    const AtrancheBalance = await AtrancheContract.balanceOf(addrUser);
    setUserABalance(AtrancheBalance);
    const BtrancheContract = new Contract(BtrancheAddr, TrancheAbi, signer);
    const BtrancheBalance = await BtrancheContract.balanceOf(addrUser);
    setUserBBalance(BtrancheBalance);
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "matic",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet().then(() => {
        getTimes();
        updateBlockTimestamp();//need to see if this is necessary
        getUserTrancheBalance();
      });
    }
  }, [walletConnected]);

  useEffect(()=>{
    updateBlockTimestamp();
  }, [isInvested, inLiquidMode])

  const claimInLiquidmode = async () =>{
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(Addr, Abi, signer);
    const tx = await contract.claimAll()
    await tx.wait();
  }

  //so by doing a function call the state is changing then handle that, and render differently, if it rendered so, but dont handle the change that occurs when the user lets the site open for too long
  const SScreen = ()=>{
    return (<div>
      <h1>InsuraTranch</h1>
      <h2>InsuraTranch is a decentralized insurance protocol on the Polygon network.</h2>
      <h2>This page is to provide insurance to those who are willing to stake their in <br></br>AAVE and Compound to gain aDAI and cDAI</h2>  
      <div className={styles.splitRisk}>
        <div className={styles.content}>
          <h3>To insure your DAI investments in AAVE and Compound, and get your Tranche tokens</h3>
          <h3>Deposit your DAI into the InsuraTranch protocol</h3>
            <input type="number" onChange = {(e)=>{
              setMintingDAI(e.target.value)
            }}/>
            <button onClick={()=>console.log(mintingDAI)/*there should be mintDAI function over here, but the setMintingDAI thing above is not working*/}>Deposit</button>
        </div>
      </div>
    </div>)
  }

  const TOne = ()=>{
    return (<div>
      <h2>The investment is currently ongoing for the pooled in DAI tokens, into the protocols, AAVE and Compound</h2>
      <h2>Once the investment is complete, you will be able to withdraw your tranche tokens</h2>
      <h2>Tranche tokens are the tokens that represent your share of the pooled DAI tokens</h2>
      <div>
        {/* to add something related to the progress of the wrapped tokens or so */}
      </div>
    </div>)
  }

  const TTwo = ()=>{
    return (<div>
      <h2>The divest call is to made today, the liquidation of aDAI and cDAI into the DAI are to be made today.</h2>
      <h2>The payouts and the option to claim your Insurance will be available from tomorrow. :)</h2>
      </div>)
    }

  const TThree = ()=>{
    /////for now we will only observer this
    if(inLiquidMode){
      return(<div>
        <h2>The divest call has been made, the conversion of A and B tranches are both available.</h2>
        <h2>Claim your tranche tokens and convert them into DAI</h2>
        <div className={styles.leftdiv}>
          <h3>You have {userABalance.toString()} A tranche tokens</h3>
          <h3>You have {userBBalance.toString()} B tranche tokens</h3>
        </div>
        <div className={styles.rightdiv}>
          <h3>Claim the DAI tokens that you are entitled to!</h3>  
          <button onClick={()=>(claimInLiquidmode())}>Claim!</button>
        </div>
      </div>)
    }else{
      return(<div>
        <h2>The divest call had been attempted, but unfortunately the protocols(s) were not in liquid mode</h2>
        <h2>You can claim your higher priority A tranche tokens now!</h2>
        {/* to fix this later on, specifically the huge left inclination*/}
        <div className={styles.leftdiv}>
          <h3>You have {userABalance.toString()} A tranche tokens</h3>
          <div className={styles.leftdiv}>
            How much of your A tranche tokens do you want to redeem from AAVE?
            <br></br>
            <br/>
            <br/>
            <input placeholder="Amount from AAVE"></input>
          </div>
          <div className={styles.rightdiv}>
          How much of your A tranche tokens do you want to redeem from Compound?
          <br/><br/>
          <input placeholder="Amount from Compound"></input>
          </div>
          <div className={styles.centerdiv}>
            <button>this</button>
          </div>
          
        </div>
        <div className={styles.rightdiv}>
          <h3>Fallback-claim the DAI tokens that you are entitled to for your A tranches!</h3>
          <h3>You now have to decide which of your traches go to redeem which protocol</h3>
          <h3>You have an option between aDAI and cDAI</h3>
        </div>
      </div>)
    }
  }

  const AboveTThree = ()=>{
    return(<div className = {styles.container}>
      <div className={styles.top}>
      <h2>Fallback-claim your tokens</h2>
      <div/>
      <div styles = {{
        display:"flex"
        }}>
        <div className={styles.left}>
          <h2> Claim your A tranche tokens</h2>
        </div>
        <div className={styles.center}>
          <h2>
            Due to fallback mode, you will have to decide how many of your tranches get redeemed from which protocol
          </h2>
        </div>
        <div className={styles.right}>
          <h2>Claim your B tranche tokens</h2>
        </div>
        </div>
      </div>
    </div>)
  }
  const Screen = () => {
    if (blockTimeStamp < S){
      return(
        // <SScreen/>
        <AboveTThree/>
      )
    }
    else if (blockTimeStamp < tOne){
      return(
        <TOne/>
      )
    }
    else if (blockTimeStamp < tTwo){
      return(
        <TTwo/>
      )
    }
    else if (blockTimeStamp < tThree){
      return(
        <TThree/>
      )
    }
    else{
      return(
        <AboveTThree/>
      )
  }
}
  return (
    <div className={styles.container}>
      <Head>
        <title>InsuraTranch</title>
        <meta
          name="description"
          content="Insurance page for InsuraTranch"
        />
        <link rel="icon" href="/favicon.ico" />
        {/* change the icon */}
      </Head>
      <main className={styles.main}>
        <div>
          <Screen/>
        </div>
      </main>
    </div>
  );
}
