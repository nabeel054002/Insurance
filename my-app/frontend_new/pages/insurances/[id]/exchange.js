import Head from "next/head";
import Image from "next/image";
import styles from "../../../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import {factoryAbi, factoryAddr, proxyAbi, implementationAbi, exchangeAbi} from "../../../constantsFactory";
import { relativeTimeRounding } from "moment";
import Web3Modal, { getProviderDescription } from "web3modal"
import Link from "next/link";
import { useRouter } from 'next/router';
import { TrancheAbi } from "@/constants";

// const web3 = require('web3')

export default function Home(signerInput) {
    const [count, setCount] = useState(0);
    let proxyAddr = "";
    const router = useRouter()
    const { id } = router.query;
    let slicerIdx = 0;
    // let 
  
    console.log("ID is this", id)
  
    for(let i = 0; i < id.length; i++){
        if(id.substring(i,i+5) === "PAUSE"){
            slicerIdx = i;
        }
    }
    const implementationAddr = id.substring(0, slicerIdx)
    proxyAddr = id.substring(slicerIdx+5, id.length)
    const zero = BigNumber.from("0")
    // const [signer, setSigner] = useState(null);
    const [web3provider, setWeb3provider] = useState(null)
    const [description, setDescription] = useState([null, null]);
    const [exchangeAddr, setExchangeAddr] = useState("")
    const [walletConnected, setWalletConnected] = useState(false);
    let balanceOne = 0;
    let balanceTwo = 0;
    let blncDEX = 0;
    const [sfbtBalance, setSfbtBalance] = useState(zero);
    const [bflBalances, setBflBalance] = useState(zero);
    const [lpBalance,setLpBalance] = useState(zero)

    // const [Div, setDiv] = useState(null);
    const web3ModalRef = useRef();

    useEffect(() => {
        if (!walletConnected) {
          web3ModalRef.current = new Web3Modal({
            network: "hardhat",
            providerOptions: {},
            disableInjectedProvider: false,
          });
    
          connectWallet().then(async () => {
            getExchangeAddr();
            getDescription();
            getBalances();
          });
        }
    }, [walletConnected]);

    const connectWallet = async () => {
        try {
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (error) {
            console.error(error);
        }
    };

    const getProviderOrSigner = async (needSigner = false) => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new ethers.providers.Web3Provider(provider);
        setWeb3provider(web3Provider);
    
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 1 ) {
          console.log(chainId)
          // window.alert("Please switch to the Hardhat fork network!");
          throw new Error("Please switch to the Hardhat fork network");
        }
    
        if (needSigner) {
          const signer = web3Provider.getSigner();
          return signer;
        }
        return web3Provider;
      };

      const getDescription = async () => {
        const signer = await getProviderOrSigner(true);
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const description = await factoryContract.returnData(implementationAddr);
        console.log(description)
        setDescription(description);
    }

    const getBalances = async() => {
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const ATranche = new Contract(await contract.A(), TrancheAbi, signer);
        const BTranche = new Contract(await contract.B(), TrancheAbi, signer);
        setBflBalance(await BTranche.balanceOf(await signer.getAddress()));
        setSfbtBalance(await ATranche.balanceOf(await signer.getAddress()));
        const exchange = new Contract(exchangeAddr, exchangeAbi, signer);
        const lpBalance = await exchange.balanceOf(await signer.getAddress());
        setLpBalance(lpBalance)
    }

    const Balances = () => {
        return (<div>
            <div className = {styles.balancesDEX}>
                <h4>Balance of SafeBet tranches is {sfbtBalance.toString()}</h4>
                <h4>Balance of BearerOfAll tranches is {bflBalances.toString()}</h4>
            </div>
        </div>)
    }

    const poolLiquidity = async () => {
        const signer = await getProviderOrSigner(true);
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);
        const exchangeContract = new Contract(exchangeAddr, exchangeAbi, signer);
        const tx = await exchangeContract.pool(utils.parseUnits(balanceOne, 18), utils.parseUnits(balanceTwo, 18));
        await tx.wait();
        //addLiquidity(address liquidityProvider, uint256 amountA, uint256 amountB)
    }

    const swapInputA = async () => {
        const signer = await getProviderOrSigner(true);
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);
        const exchangeContract = new Contract(exchangeAddr, exchangeAbi, signer);
        const tx = await exchangeContract.swapInputA(utils.parseUnits(blncDEX, 18));
        await tx.wait();
    }

    const swapInputB = async () => {
        const signer = await getProviderOrSigner(true);
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);
        const exchangeContract = new Contract(exchangeAddr, exchangeAbi, signer);
        const tx = await exchangeContract.swapInputB(utils.parseUnits(blncDEX, 18));
        await tx.wait();
    }

    const getExchangeAddr = async () => {
        console.log("enterred getxchng")
        const signer = await getProviderOrSigner(true);
        const factoryContract = new ethers.Contract(factoryAddr, factoryAbi, signer);
        console.log("factory contract",factoryContract)
        console.log("impaddr",implementationAddr)
        console.log("signer", signer)
        // console.log("no fn call",await factoryContract.callStatic.riskSpectrumExchangeContracts(implementationAddr))
        console.log("arr length", await factoryContract.riskSpectrumContractsArrayLength())
        console.log("factoryabi", factoryAbi)
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);//there is a problem here
        console.log("Asdasd", exchangeAddr)
        setExchangeAddr(exchangeAddr);
    }

    const Div = () => {
        if(count==0)
        return(
             <div className={styles.Div}>
            <h2 className={styles.pool}>Pool In your tranche Tokens to recieve liquidity tokens</h2>
            <h3 className={styles.pool}>You have {lpBalance.toString()} LP tokens for this RiskSpectrum DEX</h3>
            <div className = {styles.balancesDEX}>
            <input type="number" placeholder = {description[1]}
            onChange = {(event) => {
                balanceOne = (event.target.value)
            }}></input>
            <input type="number" placeholder = {description[2]}
            onChange = {(event) => {
                balanceTwo = (event.target.value);
            }}></input> 
            
            </div>
            <div className = {styles.this}>
                <br/>
                <div className = {styles.balancesDEX}>
                    <p>Please be sure to pool in based on the ratio, as it can create a huge loss for you
                </p></div>
                <div className={styles.balancesDEX}>
                    <button className = {styles.mybutton} onClick = {poolLiquidity}>Provide Liquidity!</button>
                </div>
            </div>
        </div>)
        else if(count == 1){ return(<div className={styles.Div}>
                <h2 className={styles.pool}>Enter the amount that you want to swap, input as SafeBet tranches or as BearerOfAll tranches</h2>
                <div className={styles.balancesDEX}>
                    <input onChange = {(event) => {
                        blncDEX = (event.target.value);
                    }}placeholder = "Input amount to swap"></input>
                </div>
                <div className={styles.balancesDEX}>
                    <button onClick = {swapInputB} className = {styles.mybutton}>Swap for SafeBet Tranches!</button>
                    {/* swapinputb */}
                    <button onClick = {swapInputA} className = {styles.mybutton}>Swap for BearerOfAll Tranches!</button>
                </div>
            </div>)
        }  else {
            return (
                <div className={styles.Div}>
            <h2 className={styles.pool}>Burn your LP Tokens to recieve your tranches back!</h2>
            <div className={styles.pool}>
                <h3>You have {lpBalance.toString()} LP tokens for this RiskSpectrum DEX</h3>
                <h3>You can burn your tokens, enter the amount below</h3>
            </div>
            
            <div className = {styles.balancesDEX}>
            <input type ="number" placeholder = "Enter amount to burn"
            onChange = {(event) => {
                balanceOne = (event.target.value)
            }}></input>
            
            
            </div>
                <div className={styles.balancesDEX}>
                    <button className = {styles.mybutton} onClick = {poolLiquidity}>Provide Liquidity!</button>
                </div>
        </div>)
        }
    }
    return (
        <div>
        <Head>
            <title>RiskSpectrum</title>
            <meta
            name="description"
            content="RiskSpectrums Available"
            />
            <link rel="icon" href="/favicon.ico" />
            {/* change the icon */}
        </Head>
        <main className={styles.main}>
            <div>
                {/* <h1>{exchangeAddr}</h1> */}
                <div>
                    <div className={styles.center}>
                        <h1>Decentralized Exchange</h1>
                    </div>
                <div className={styles.investingToken}><h3>Name of investing Token: {description[0]}</h3></div>
                <div className={styles.protocolsInRiskSpectrum}>
                    <h3>Name of protocols are:</h3>
                    <h3>{description[1]}</h3>
                    <h3>{description[2]}</h3>
                </div>
              </div>
            </div>
            <br/><Balances/>
                <nav className={styles.aboveOptionsDEX}>
                <ul className={styles.optionsDEX}>
                    <li className={styles.optionsDEXli}><button className = {count==0?styles.chosenDexbtn:styles.dexbtn} onClick = {() => {setCount(0)}}>Provide Liquidity</button></li>
                    <li className={styles.optionsDEXli}><button className = {count==1?styles.chosenDexbtn:styles.dexbtn} onClick = {() => {setCount(1)}}>Swap</button></li>
                    <li className={styles.optionsDEXli}><button className={count==2?styles.chosenDexbtn:styles.dexbtn} onClick={() => {setCount(2)}}>Remove Liquidity</button></li>
                </ul>
            </nav>
            <Div/>
        </main>
        </div>
    );
}
