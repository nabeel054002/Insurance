import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import Web3Modal from "web3modal";
import {Addr, Abi, TrancheAbi} from "../constants";
import Footer from "../components/Footer";
const moment = require('moment')


export default function Home(signerInput) {

  let AfromAAVE = 0;
  let AfromCompound = 0;
  let BfromAAVE = 0;
  let BfromCompound = 0;
  let amountOfDAI = 0;
  const [signer, setSigner] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false)
  const zero = BigNumber.from("0")
  const [blockTimeStamp, setBlockTimeStamp] = useState(0)
  const [S, setS] = useState(zero);
  const [tOne, setTOne] = useState(zero);
  const [tTwo, setTTwo] = useState(zero);
  const [tThree, setTThree] = useState(zero);
  const [isInvested, setIsInvested] = useState(false);//wouldnt exactly be needed
  const [inLiquidMode, setInLiquidMode] = useState(false);
  const [userABalance, setUserABalance] = useState(zero);
  const [userBBalance, setUserBBalance] = useState(zero);

  useEffect( () => {
    if (signerInput) {
        setSigner(signerInput.prop1);
        if(signer){
          getTimes();
        updateBlockTimestamp();//need to see if this is necessary
        getUserTrancheBalance();
        }
      }

    })

  const getTimes = async () =>{
    //to be run only once 
    const contract = new Contract(Addr, Abi, signer);
    setS((await contract.S()))
    setTOne((await contract.T1()));
    setTTwo((await contract.T2()));
    setTThree((await contract.T3()));
  }
  

  const mintForDAI = async (value) => {
    const contract = new Contract(Addr, Abi, signer);
    const valueBN = utils.parseUnits(value, 18);
    // const tx = await contract.splitRisk(valueBN)
  }

  const updateBlockTimestamp = async () =>{
    // const provider = new ethers.providers.InfuraProvider("https://eth-mainnet.g.alchemy.com/v2/1jL4KovovKlEyn-QtmIhBAFbarVNUd_M");

    if(signer){
      signerInput.prop2.getBlock('latest').then((block)=>{
        const t = (block.timestamp)
        setBlockTimeStamp(t)
      })
      const contract = new Contract(Addr, Abi, signer);
      const isInvested = (await contract.isInvested())
      const inLiquidMode = (await contract.inLiquidMode())
      setIsInvested(isInvested)
      setInLiquidMode(inLiquidMode)
    }
  }


  const getUserTrancheBalance = async () =>{
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

  useEffect(()=>{
    updateBlockTimestamp();
  }, [isInvested, inLiquidMode])

  const claimInLiquidmode = async () =>{
    const contract = new Contract(Addr, Abi, signer);
    const tx = await contract.claimAll()
    await tx.wait(); 
  }

  const claimInFallbackMode = async () =>{
    const contract = new Contract(Addr, Abi, signer);
    const AfromAAVEBN = utils.parseUnits(AfromAAVE.toString(), 18);
    const BfromAAVEBN = utils.parseUnits(BfromAAVE.toString(), 18);
    const AfromCompoundBN = utils.parseUnits(AfromCompound.toString(), 18);
    const BfromCompoundBN = utils.parseUnits(BfromCompound.toString(), 18);
    let tx = await contract.claimA(AfromAAVEBN, AfromCompoundBN);
    await tx.wait();
    await contract.claimB(BfromAAVEBN, BfromCompoundBN);
    await tx.wait();
  }



  //so by doing a function call the state is changing then handle that, and render differently, if it rendered so, but dont handle the change that occurs when the user lets the site open for too long
  const SScreen = ()=>{
    return (<div className={styles.topFirst}>
      <h2>Insure your DAI investments using InsuraTranch</h2>
      <br/>
      <h4>InsuraTranch is a decentralized insurance protocol on the Mumbai network.</h4>
      <h4>This page is to provide insurance to those who are willing to stake their in AAVE and Compound to gain aDAI and cDAI</h4>  
      <br/>
      <div className="card">
        <div className="card-header">
          <h4>To insure your DAI investments in AAVE and Compound</h4></div>
          <div className="card-body">
          <h5>Deposit your DAI into the InsuraTranch protocol</h5><br/>
          <p className={styles.contentFirst}>A  protocol in which a particular token is pooled in which are used to buy the return accruing interest in 2 different protocols. In exchange of pooling the tokens, there are 50% A tranche tokens and 50% B tranche tokens that get issued to the end user that pooled the tokens, the A tranche tokens have lower risk and will get lower returns and B is the opposite. The risk mitigation happens through trading of A tranche and B tranche tokens and not by the protocol giving you the tranche tokens.`</p>
            <input placeholder = "Enter DAI Amount" type="number" onChange = {(e)=>{
              amountOfDAI = (e.target.value)
            }}/>
            <button className="btn btn-danger btn-sm" onClick={()=>{
              const tx = mintForDAI(amountOfDAI);
              }}>Deposit</button>
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
        <div>
          <h3>You have {userABalance.toString()} A tranche tokens</h3>
          <h3>You have {userBBalance.toString()} B tranche tokens</h3>
        </div>
        <div>
          <h3>Claim the DAI tokens that you are entitled to!</h3>  
          <button onClick={()=>(claimInLiquidmode())}>Claim!</button>
        </div>
      </div>)
    }else{
      return(<div>
        <h2>The divest call had been attempted, but unfortunately the protocols(s) were not in liquid mode</h2>
        <h2>You can claim your higher priority A tranche tokens now!</h2>
        <div >
          <h3>Fallback-claim the DAI tokens that you are entitled to for your A tranches!</h3>
          <h3>You now have to decide which of your traches go to redeem which protocol</h3>
          <h3>You have an option between aDAI and cDAI</h3>
        </div>
        {/* to fix this later on, specifically the huge left inclination*/}
        <div >
          <h3>You have {userABalance.toString()} A tranche tokens</h3>
          <div>
            <h4></h4>How much of your A tranche tokens do you want to redeem from AAVE?<br/>
            <input placeholder="Amount from AAVE" onChange = {(e)=>{
              AfromAAVE2 = (e.target.value)
            }}></input>
          </div>
          <div>
          How much of your A tranche tokens do you want to redeem from Compound?
          <input placeholder="Amount from Compound"></input>
          </div>
          <div>
            <button className="btn btn-danger">this</button>
          </div>
          
        </div>
      </div>)
    }
  }

  const AboveTThree = ()=>{
    return(<div className = {styles.container}>
      <div>
      <h2 className={styles.toptxt}>Fallback-claim your tokens</h2>
      <h3 className={styles.scndtxt}>
            Due to illiquidity of the invested tokens, the state of the insurance is not in the Liquid mode.<br></br>
            We are offering redemptions for both the SafeBet and the BearerOfAll tranches</h3>
      <div className={styles.content}>
        <div className={styles.left}>
          <h2> Claim your A tranche tokens</h2>

          <div className={styles.leftdiv}>
          <h3>You have {userABalance.toString()} A tranche tokens</h3>
          <div>
            How much of your A tranche tokens do you want to redeem from AAVE?
            <br/>
            <input label="AfromAAVE" placeholder="Amount from AAVE"></input>
          </div>
          <div>
          How much of your A tranche tokens do you want to redeem from Compound?
          <br/>
          <input label = "AfromCompound" placeholder="Amount from Compound"></input>
          </div>
          </div>
        </div>
        <div className={styles.right}>
          <h2>Claim your B tranche tokens</h2>

          <div className={styles.leftdiv}>
          <h3>You have {userABalance.toString()} B tranche tokens</h3>
          <div>
            How much of your B tranche tokens do you want to redeem from AAVE?
            <br></br>
            <input label="BfromAAVE" placeholder="Amount from AAVE" onChange = {(e)=>{BfromAAVE = e.target.value}}></input>
          </div>
          <div>
          How much of your B tranche tokens do you want to redeem from Compound?
          <br/>
          <input placeholder="Amount from Compound" label="BfromCompound" onChange = {(e)=>{
            BfromCompound = e.target.value
          }}></input>
          </div>
          </div>
        </div>
        <div className={styles.btn_claim}>
            <button type = "submit" onClick = {() => {
              const tx = claimInFallbackMode(AfromAAVE, AfromCompound, BfromAAVE, BfromCompound);
            }} className="btn btn-danger btn-primary btn-lg">Claim!</button>
          </div>
      </div>
      </div>
    </div>)
  }
  const Screen = () => {
    if (blockTimeStamp < S){
      return(
        <SScreen/>
        // <TThree/>
        // <AboveTThree/>
      )
    }
    else if (blockTimeStamp < tOne){
      return(
        <TOne/>
        // <SScreen/>
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
    <div>
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