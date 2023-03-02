import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import Web3Modal from "web3modal";
import {proxyAddr, implementationAddr, assistAddr, proxyAbi, Abi, TrancheAbi, daiAbi, implementationAbi, assistAbi} from "../constants";
import Footer from "../components/Footer";
const moment = require('moment')
// const web3 = require('web3')


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

    }, [signer])

  const Loading = () => {
    return (
      <div className={styles.loading}>
        <h1>{S}</h1>
        <h1>{tOne}</h1>
        <h1>{tTwo}</h1>
      </div>
    )
  }

  const getTimes = async () =>{
    //to be run only once 
    const proxyContract = new Contract(proxyAddr, proxyAbi, signer);
    console.log("functions are ",proxyContract.callStatic.functions);
    const implementationContract = new Contract(implementationAddr, implementationAbi, signer);
    console.log("assist contrCt is", await implementationContract.AssistContract())
    let s = (await implementationContract.S())
    console.log("S is ", s)
    setS(s)
    setTOne((await implementationContract.T1()));
    setTTwo((await implementationContract.T2()));
    setTThree((await implementationContract.T3()));
  }
  

  const mintForDAI = async (value) => {
    const contract = new Contract(proxyAddr, proxyAbi, signer);
    const valueBN = utils.parseUnits(value, 18);
    const dai = new Contract("0x6b175474e89094c44da98b954eedeac495271d0f", daiAbi, signer);
    const tx2 = await dai.approve(Addr, valueBN);
    const tx = await contract.splitRisk(valueBN, {
      gasLimit: 1000000,
    });
    await tx.wait()
  }

  const updateBlockTimestamp = async () =>{
    // const provider = new ethers.providers.InfuraProvider("https://eth-mainnet.g.alchemy.com/v2/1jL4KovovKlEyn-QtmIhBAFbarVNUd_M");

    if(signer){
      signerInput.prop2.getBlock('latest').then((block)=>{
        const t = (block.timestamp)
        setBlockTimeStamp(t)
      })
      const contract = new Contract(implementationAddr, implementationAbi, signer);
      const isInvested = (await contract.isInvested())
      const inLiquidMode = (await contract.inLiquidMode())
      setIsInvested(isInvested)
      setInLiquidMode(inLiquidMode)
    }
  }


  const getUserTrancheBalance = async () =>{
    const addrUser = (await signer.getAddress())
    const contract = new Contract(implementationAddr, implementationAbi, signer);
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
    const contract = new Contract(proxyAddr, proxyAbi, signer);
    const tx = await contract.claimAll()
    await tx.wait(); 
  }

  const claimInFallbackMode = async (AfromAAVE, AfromCompound, BfromAAVE, BfromCompound) =>{
    const contract = new Contract(proxyAddr, proxyAbi, signer);
    const AfromAAVEBN = utils.parseUnits(AfromAAVE.toString(), 18);
    const BfromAAVEBN = utils.parseUnits(BfromAAVE.toString(), 18);
    const AfromCompoundBN = utils.parseUnits(AfromCompound.toString(), 18);
    const BfromCompoundBN = utils.parseUnits(BfromCompound.toString(), 18);
    let tx = await contract.claimA(AfromAAVEBN, AfromCompoundBN);
    await tx.wait();
    await contract.claimB(BfromAAVEBN, BfromCompoundBN);
    await tx.wait();
  }

  const claimInOnlyA = async (AfromAAVE, AfromCompound) =>{
    const contract = new Contract(proxyAddr, proxyAbi, signer);
    const AfromAAVEBN = utils.parseUnits(AfromAAVE.toString(), 18);
    const AfromCompoundBN = utils.parseUnits(AfromCompound.toString(), 18);
    let tx = await contract.claimA(AfromAAVEBN, AfromCompoundBN);
    await tx.wait();
  }

  const Balances = () =>{
    return (
      <div className={styles.balances}>
        <h3>Tranche A Balance: {utils.formatUnits(userABalance.toString(), 18)}</h3>
        <h3>Tranche B Balance: {utils.formatUnits(userBBalance.toString(), 18)}</h3>
      </div>
    )
  }

  //so by doing a function call the state is changing then handle that, and render differently, if it rendered so, but dont handle the change that occurs when the user lets the site open for too long
  const SScreen = ()=>{
    return (<div className={styles.topFirst}>
      <h2>Vary your risk exposure using RiskSpectrum</h2>
      <br/>
      <h4>RiskSpectrum is a decentralized DeFi risk derivative protocol on the Mumbai network.</h4>
      <h4>This page is to provide 2 tranche tokens to those that deposit their DAI for their investments in aDAI and cDAI</h4>  
      <br/>
      <Balances/>
      <div className="card">
        <div className="card-header">
          <h4>To vary your risk exposure for your DAI investments in AAVE and Compound</h4></div>
          <div className="card-body">
          <h5>Deposit your DAI into the RiskSpectrum protocol</h5><br/>
          <p className={styles.contentFirst}>A protocol in which a particular token is pooled in, which are used to buy the return accruing interest in 2 different protocols. In exchange of pooling the tokens, there are 50% SafeBet tranche tokens and 50% BearerOfAll tranche tokens that get issued to the end user that pooled the tokens, the SafeBet tranche tokens have lower risk and has a really less chance of default and the BearerOfAll tranche is the opposite. The risk mitigation happens through trading of SafeBet tranche and BearerOfAll tranche tokens and not by the protocol giving you the tranche tokens.`</p>
            <input placeholder = "Enter DAI Amount" type="number" onChange = {(e)=>{
              amountOfDAI = (e.target.value)
            }}/>
            <button className="btn btn-danger btn-sm" onClick={()=>{
              mintForDAI(amountOfDAI);//redirect to success page
              }}>Deposit</button>
          </div>
        </div>
    </div>)
  }

  const TOne = ()=>{
    return (<div>
      <h2>The investment is currently ongoing for the pooled in DAI tokens, into the protocols,<br/> AAVE and Compound</h2><br/>
      <h4><br/> The investment period is ongoing, you will be able to withdraw your tranche tokens after this observation period.</h4>
      <h4>Tranche tokens are the tokens that represent your share of the pooled DAI tokens</h4>
      <br/>

      <div className = {styles.contentLower}>
        {/* to add something related to the progress of the wrapped tokens or so */}
        <h3>Observing the Investments...</h3>
      </div>
    </div>)
  }

  const TTwo = ()=>{
    return (<div>
      <h2>The divest call is to made today, the liquidation of aDAI and cDAI into the DAI are to be made today.</h2>
      <h2>The payouts and the option to claim your DAI tokens will be available from tomorrow. :)</h2>
      </div>)
    }

  const TThree = ()=>{
    /////for now we will only observer this
    if(inLiquidMode){
      return(<div>
        <h2>The divest call has been made, the conversion of SafeBet and BearerOfAll tranches are both available.</h2>
        <h2>Claim your tranche tokens and convert them into DAI</h2>
        <div>
          <div className={styles.threeDiv}>
          <h3>You have {userABalance.toString()} SafeBet tranche tokens</h3>
          <h3>You have {userBBalance.toString()} BearerOfAll tranche tokens</h3>
        </div>
        <div className={styles.three}>
          <h3>Claim the DAI tokens that you are entitled to!</h3>  
          <button onClick={()=>(claimInLiquidmode())}>Claim!</button>
        </div>
        </div>
        
      </div>)
    }else{
      return(<div className={styles.contentOnlyA}>
        <h3>The divest call was attempted, but unfortunately the protocols(s) were not in liquid mode</h3>
        <h3>You can claim your higher priority SafeBet tranche tokens now!</h3>
        <div className={styles.descriptionOnlyA}><br/>
          <h4>
            Fallback-claim the DAI tokens that you are entitled to for your SafeBet tranches!<br/>
          You now have to decide which of your traches go to redeem which protocol
          You have an option between aDAI and cDAI
          </h4><br/>
          
        </div>
        {/* to fix this later on, specifically the huge left inclination*/}
        <div >
          <h3>You have {userABalance.toString()} A tranche tokens</h3>

          <div className={styles.threeDiv}>
            <div>
            <h5>How many of your superior tranches do you wanna exchange for aDAI?</h5>
            <input placeholder="Amount from AAVE" onChange = {(e)=>{
              AfromAAVE = (e.target.value)
            }}></input>
          </div>
          <div>
            <h5>How many of your superior tranches do you wanna exchange for cDAI?</h5>
          
          <input placeholder="Amount from Compound" onChange = {(e)=>{
              AfromCompound = e.target.value
          }}></input>
          </div>
          </div>
          <br/><br/>
          <div className={styles.buttonOnlyA}>
            <button className="btn btn-danger" onClick = {()=>{
              claim
            }}>this</button>
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
          <h2> Claim your SafeBet tranche tokens</h2>

          <div className={styles.leftdiv}>
          <h3>You have {userABalance.toString()} SafeBet tranche tokens</h3>
          <div>
            How much of your SafeBet tranche tokens do you want to redeem from AAVE?
            <br/>
            <input label="AfromAAVE" placeholder="Amount from AAVE"></input>
          </div>
          <div>
          How much of your SafeBet tranche tokens do you want to redeem from Compound?
          <br/>
          <input label = "AfromCompound" placeholder="Amount from Compound"></input>
          </div>
          </div>
        </div>
        <div className={styles.right}>
          <h2>Claim your B tranche tokens</h2>

          <div className={styles.leftdiv}>
          <h3>You have {userABalance.toString()} BearerOfAll tranche tokens</h3>
          <div>
            How much of your BearerOfAll tranche tokens do you want to redeem from AAVE?
            <br></br>
            <input label="BfromAAVE" placeholder="Amount from AAVE" onChange = {(e)=>{BfromAAVE = e.target.value}}></input>
          </div>
          <div>
          How much of your BearerOfAll tranche tokens do you want to redeem from Compound?
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
      )
    }
    //get aDAI and cDAI balance
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
    else if (blockTimeStamp > tThree){
      return(
        <AboveTThree/>
        // <TThree/>
        // <TOne/>
      )
  } else{
    return(
      <div>
        {/* <h1>Something went wrong</h1> */}
        <TThree/>
      </div>
    )
  }
}
  return (
    <div>
      <Head>
        <title>RiskSpectrum</title>
        <meta
          name="description"
          content="Insurance page for RiskSpectrum"
        />
        <link rel="icon" href="/favicon.ico" />
        {/* change the icon */}
      </Head>
      <main className={styles.main}>
        <div>
          <Screen/>
          {blockTimeStamp} is blocktimestamp
          {S.toString()} is S
          {tOne.toString()} is tone
          {tTwo.toString()} is ttwo
          {tThree.toString()} is t three
          <div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * 
 * 1676900795 is blocktimestamp1676900917 is S1676901277 is tone1676901397 is ttwo1676901577 is t three
 * 
 */