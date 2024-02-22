import { useUrl } from 'nextjs-current-url';
import Web3Modal from "web3modal"
import Head from "next/head";
import { useRouter } from 'next/router';
import styles from "../../../styles/Home.module.css";
import {useState, useEffect, useRef} from "react";
import {BigNumber, Contract, ethers, utils} from "ethers";
import { implementationAbi, TrancheAbi, daiAbi, assistAbi } from "../../../constants";
import { SScreen } from '@/components/SScreen';
import { TOne } from '@/components/TOne'
import {TTwo} from '@/components/TTwo'
import {TThree} from '@/components/TThree';
import { AboveTThree } from '@/components/AboveTThree';

const Post = ({
  signer,
  provider
}) => {
  // keep the usestate variables first then the signer and contract initiation functions first
  // then the helper functions
  const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const [proxyAddr, setProxyAddr] = useState('')
  const zero = BigNumber.from("0")
  const [blockTimeStamp, setBlockTimeStamp] = useState(zero);
  // immutable constants
  const [S, setS] = useState(zero);
  const [tOne, setTOne] = useState(zero);
  const [tTwo, setTTwo] = useState(zero);
  const [tThree, setTThree] = useState(zero);
  const [contract, setContract] = useState(null);
  const [daiContract, setDaiContract] = useState(null);

  const [isInvested, setIsInvested] = useState(false);//set this
  const [inLiquidMode, setInLiquidMode] = useState(false);
  const [userABalance, setUserABalance] = useState(zero);//set this
  const [userBBalance, setUserBBalance] = useState(zero);//set this
  const [cBalance, setCBalance] = useState(zero);

  const router = useRouter();

  const getProxyAddr = async () => {
    let id = (router.query.id)
    if(id?.length){
      let slicerIdx = 0;
      for(let i = 0; i < 100; i++){
        if(id.substring(i,i+5) === "PAUSE"){
          slicerIdx = i;
          break; 
        }
      }
      setProxyAddr(id.substring(slicerIdx+5, id.length));
    }
  }
  useEffect(()=> {
    getProxyAddr();
  }, [router.query.id])

  const getContract = async () => {
    if(!signer) return;
    setContract(new Contract(proxyAddr, implementationAbi, signer));
    setDaiContract(new Contract(daiAddress, daiAbi, signer))
  } 

  useEffect(() => {
    if(signer&& proxyAddr)getContract();
    else return;
  }, [proxyAddr, signer])

  const updateBlockTimestamp = async () =>{
    //assuming provider to not be null since signer 
    if(provider){
      provider.getBlock('latest').then((block) => {
        setBlockTimeStamp(block.timestamp)
      })
    }
  }

  const getLiquidityStatus = async () => {
    const isInvested = (await contract.isInvested())
    const inLiquidMode = (await contract.inLiquidMode())
    setIsInvested(isInvested)
    setInLiquidMode(inLiquidMode)
  }
    
  const getTimes = async () =>{
    if(contract && contract.S){
      setS(await contract.S())
      setTOne((await contract.T1()));
      setTTwo((await contract.T2()));
      setTThree((await contract.T3()));
    }
    else {
      console.log('contract not in the gettimes !!')
      return;
    }
  }


  const getUserTrancheBalance = async () =>{
    const addrUser = (await signer.getAddress())
    const AtrancheAddr = (await contract.A());
    const BtrancheAddr = (await contract.B());
    const AtrancheContract = new Contract(AtrancheAddr, TrancheAbi, signer);
    const AtrancheBalance = await AtrancheContract?.balanceOf(addrUser);
    setUserABalance(AtrancheBalance);
    const BtrancheContract = new Contract(BtrancheAddr, TrancheAbi, signer);
    const BtrancheBalance = await BtrancheContract.balanceOf(addrUser);
    setUserBBalance(BtrancheBalance);
  }

  useEffect(() => {
    //if contract was not null, then signer and proxyAddr are also not null...
    if(contract && contract.S && contract.A && signer){
      updateBlockTimestamp();
      getTimes();
      getUserTrancheBalance();
      updateCBalance();
      getLiquidityStatus();
    }
  }, [contract, signer])

  const updateCBalance = async () =>{
    const cBalance = (await contract?.cBalance());
    setCBalance(cBalance);
  }
    
  const Screen = () => {
    if(blockTimeStamp && S && tOne && tTwo && tThree){//if its able to get the timestamp values, signer toh definitely it will be having
      if (blockTimeStamp < S) 
      return (<SScreen
        contract={contract}
        daiContract={daiContract}
        userABalance={userABalance}
        userBBalance={userBBalance}
        getUserTrancheBalance={getUserTrancheBalance}
        updateBlockTimestamp={updateBlockTimestamp}
      />);
      else if (blockTimeStamp < tOne) return (<TOne
        contract={contract}
        daiContract={daiContract}
        userABalance={userABalance}
        userBBalance={userBBalance}
        getUserTrancheBalance={getUserTrancheBalance}
        updateBlockTimestamp={updateBlockTimestamp}
        getIsInvested={getLiquidityStatus}
        isInvested={isInvested}
      />)
      else if (blockTimeStamp < tTwo) return (<TTwo
        contract={contract}
        isLiquid={inLiquidMode}
        getLiquidityStatus={getLiquidityStatus}
      />)
      else if (blockTimeStamp < tThree) return (<TThree
        inLiquidMode={inLiquidMode}
        contract={contract}
      />)
      else if (blockTimeStamp > tThree) return (inLiquidMode ? (<TThree
        inLiquidMode={inLiquidMode}
        contract={contract}
      />) : (<AboveTThree
        AfromAAVE={0}
        AfromCompound={0}
        BfromAAVE={0}
        BfromCompound={0}
        userABalance={userABalance}
        userBBalance={userBBalance}
        contract={contract}
      />))
      else return <div>here</div>

    } else return (<div>Waiting for time values!</div>)
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
          {signer ? <Screen/> : <div>Empty Signer!</div>}
          {blockTimeStamp.toString()}<br/>
          {S.toString()}<br/>
          {tOne.toString()}<br/>
          {tTwo.toString()}<br/>
      </main>
    </div>
  );

}

export default Post

//learn custom hooks
//state management libraries 
