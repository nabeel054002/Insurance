import Head from "next/head";
import Image from "next/image";
import styles from "../../../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import {factoryAbi, factoryAddr, proxyAbi, implementationAbi, exchangeAbi} from "../../../constants";
// import { relativeTimeRounding } from "moment";
import Web3Modal, { getProviderDescription } from "web3modal"
import Link from "next/link";
import { useRouter } from 'next/router';
import { TrancheAbi } from "@/constants";

// const web3 = require('web3')

function Home(signerInput) {
    const [count, setCount] = useState(0);
    let proxyAddr = "";//getProxyADdr addtiion here
    const router = useRouter()
    const { id } = router.query;
    let slicerIdx = 0;
    // let 
    let burnLp = 0;
  
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
    const [balanceOne, setBalanceOne] = useState(zero)
    const [balanceTwo, setBalanceTwo] = useState(zero);
    const [balanceDEX, setBalanceDEX] = useState(zero);
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
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const ATranche = new Contract(await contract.A(), TrancheAbi, signer);
        const BTranche = new Contract(await contract.B(), TrancheAbi, signer);
        setBflBalance(await BTranche.balanceOf(await signer.getAddress()));
        setSfbtBalance(await ATranche.balanceOf(await signer.getAddress()));
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);
        const exchange = new Contract(exchangeAddr, exchangeAbi, signer);
        const addr = await signer.getAddress();
        const lpBalance = await exchange.balanceOf(addr);
        setLpBalance(lpBalance)
    }

    const Balances = () => {
        return (
            <div className={styles.balances}>
                <h3 className={styles.balance}>Balance of SafeBet tranches is {utils.formatUnits(sfbtBalance.toString())}</h3>
                <h3 className={styles.balance}>Balance of BearerOfAll tranches is {utils.formatUnits(bflBalances.toString())}</h3>
            </div>)
    }

    const poolLiquidity = async () => {
        const signer = await getProviderOrSigner(true);
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);
        const exchangeContract = new Contract(exchangeAddr, exchangeAbi, signer);
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const trancheA = new Contract(await contract.A(), TrancheAbi, signer);
        const trancheB = new Contract(await contract.B(), TrancheAbi, signer);
        const balancOne = await trancheA.balanceOf(await signer.getAddress());
        const balancTwo = await trancheB.balanceOf(await signer.getAddress());
        const tx2 = await trancheA.approve(exchangeAddr, balancOne);
        await tx2.wait();
        const tx3 = await trancheB.approve(exchangeAddr, balancTwo);
        await tx3.wait();
        const tx = await exchangeContract.pool(utils.parseUnits(balanceOne.toString(), 18), utils.parseUnits(balanceTwo.toString(), 18), {
            gasLimit: 1000000,
        });
        await tx.wait();
        //addLiquidity(address liquidityProvider, uint256 amountA, uint256 amountB)
    }

    const swapInputA = async () => {
        const signer = await getProviderOrSigner(true);
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);
        const exchangeContract = new Contract(exchangeAddr, exchangeAbi, signer);
        const tx = await exchangeContract.swapInputA(utils.parseUnits(balanceDEX, 18), {
            gasLimit: 1000000,
        });
        await tx.wait();
    }

    const swapInputB = async () => {
        const signer = await getProviderOrSigner(true);
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);
        const exchangeContract = new Contract(exchangeAddr, exchangeAbi, signer);
        const tx = await exchangeContract.swapInputB(utils.parseUnits(balanceDEX, 18), {
            gasLimit: 1000000,
        });
        await tx.wait();
    }

    const getExchangeAddr = async () => {
        console.log("enterred getxchng")
        const signer = await getProviderOrSigner(true);
        const factoryContract = new ethers.Contract(factoryAddr, factoryAbi, signer);
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);//there is a problem here
        setExchangeAddr(exchangeAddr);
    }

    const burnLiquidity = async () => {
        const signer = await getProviderOrSigner(true);
        const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
        const exchangeAddr = await factoryContract.riskSpectrumExchangeContracts(implementationAddr);
        const exchangeContract = new Contract(exchangeAddr, exchangeAbi, signer);
        const tx = await exchangeContract.liquidate(utils.parseUnits(burnLp, 18), {
            gasLimit: 1000000,
        });
        await tx.wait();
    }


    const Div = () => {
        if(count==0)
        return(
            <div className={styles.dexContent}>
            <h3 className={styles.insurancesDetail}>Pool In your tranche Tokens to recieve liquidity tokens</h3>
            <h3 className={styles.insurancesDetail}>You have {utils.formatUnits(lpBalance.toString())} LP tokens for this RiskSpectrum DEX</h3>
            <div className={styles.inputBox}>
                <input className={styles.inputMini} type="number" placeholder = {"Enter the amount of SafeBet tranches to pool"}
                onChange = {(event) => {
                    setBalanceOne(event.target.value)
                }}></input>
                <input className={styles.inputMini} type="number" placeholder = "Enter the amount of BearerOfAll tranches to pool"
                onChange = {(event) => {
                    setBalanceTwo(event.target.value);
                }}></input> 
            </div>
                <br/>
            <p style={{
                display:"flex",
                width:"1100px",
                paddingLeft:"0",
                paddingRight:"0",
                justifyContent:"center",
                alignItems:"center"
            }} className={styles.secondInsurancesDetail}>Please be sure to pool in based on the ratio, as it can create a huge loss for you</p>
            <button className = {styles.mybutton} onClick = {poolLiquidity}>Provide Liquidity!</button>
        </div>)
        else if(count == 1){ return(<div className={styles.dexContent}>
                <h3 className={styles.insurancesDetail}>Enter the amount that you want to swap, input as SafeBet tranches or as BearerOfAll tranches</h3>
                <div>
                    <input className={styles.inputMini} type = "number" onChange = {(event) => {
                        setBalanceDEX(event.target.value);
                    }}placeholder = "Input amount to swap"></input>
                </div>
                <div>
                    <button onClick = {swapInputB} className = {styles.mybutton}>Swap for SafeBet Tranches!</button>
                    {/* swapinputb */}
                    <button onClick = {swapInputA} className = {styles.mybutton}>Swap for BearerOfAll Tranches!</button>
                </div>
            </div>)
        }  else {
            return (<div className={styles.dexContent}>
            <h3 className={styles.insurancesDetail}>Burn your LP Tokens to recieve your tranches back!<br></br>
            You have {utils.formatUnits(lpBalance.toString())} LP tokens for this RiskSpectrum DEX<br></br>
            You can burn your tokens, enter the amount below</h3>
            <input className={styles.inputMini} type ="number" placeholder = "Enter amount to burn"
            onChange = {(event) => {
                burnLp = (event.target.value)
            }}></input>
            <button className={styles.mybutton} onClick = {burnLiquidity}>Provide Liquidity!</button>
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
            <h3 className={styles.titleOptions}>Decentralized Exchange</h3>
            <h3 className={styles.insurancesDetail}>Name of investing Token: {description[0]}<br></br>
            Name of protocols are:<br></br>
            {description[1]} {description[2]}</h3>
            <Balances/>
                <nav>
                <ul style = {{
                    listStyleType:"none",
                    display:"flex",
                    justifyContent:"space-around",
                    width:"100%",
                    margin:"0", 
                }}>
                    <li><button className={count==0?styles.miniButtonsSelected:styles.miniButtons} onClick = {() => {setCount(0)}}>Provide Liquidity</button></li>
                    <li><button className={count==1?styles.miniButtonsSelected:styles.miniButtons} onClick = {() => {setCount(1)}}>Swap</button></li>
                    <li><button className={count==2?styles.miniButtonsSelected:styles.miniButtons} onClick={() => {setCount(2)}}>Remove Liquidity</button></li>
                </ul>
            </nav>
            <Div/>
        </main>
        </div>
    );
}

export default Home;