import Head from "next/head";
import Image from "next/image";
import styles from "../../../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import {factoryAbi, factoryAddr, proxyAbi} from "../../../constantsFactory";
import { relativeTimeRounding } from "moment";
import Web3Modal from "web3modal"
import Link from "next/link";
import { useRouter } from 'next/router';
// const web3 = require('web3')


export default function Home(signerInput) {

  const router = useRouter()
  const { id } = router.query;

  let slicerIdx = 0;
  let proxyAddr ="";


  const protocol = id + "/protocol";
  const exchange = id + "/exchange";
  for(let i = 0; i < id.length; i++){
    if(id.substring(i,i+5) === "PAUSE"){
        slicerIdx = i;
    }
}
const implementationAddr = id.substring(0, slicerIdx)
proxyAddr = id.substring(slicerIdx+5, id.length)

  // const [signer, setSigner] = useState(null);
  const [availableInsurances, setAvailableInsurances] = useState([]);
  const [riskSpectrumLength, setRiskSpectrumLength] = useState(0);
  const [description, setDescription] = useState([])
  const [proxyArr, setProxyArr] = useState([]);
  const [implementationArr, setImplementationArr] = useState([]);
  const [descriptionArr, setDescriptionArr] = useState([]);

  const [signer, setSigner] = useState(null);
  const [web3provider, setWeb3provider] = useState(null)

  const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();

    useEffect(() => {
        if (!walletConnected) {
          web3ModalRef.current = new Web3Modal({
            network: "hardhat",
            providerOptions: {},
            disableInjectedProvider: false,
          });
    
          connectWallet().then(async () => {
            setSigner(await getProviderOrSigner(true));
            getDescription();
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

    const getDescription = async () => {
      const signer = await getProviderOrSigner(true);
      const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
      const description = await factoryContract.returnData(implementationAddr);
      console.log(description)
      setDescription(description);
  }

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
          <h2>This is a RiskSpectrum</h2><h3>For the investing token as {description[0]}</h3>
          <h3>to invest in the protocols, {description[1]} and {description[2]}</h3><br></br>
          <h4>You can get the tranches, the payouts and check the status of the protocol in the Protocol page</h4>
          <h4>You can vary your risk exposure by swapping your SafeBet or your<br></br> BearerOfAll tokens for the other, BearerOfAll or SafeBet respectively.</h4>
          <div>
            <Link href = {protocol}><button className = {styles.mybutton}>Protocol</button>
            </Link>
            <Link href = {exchange}><button className = {styles.mybutton}>Exchange</button>
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  );
}
