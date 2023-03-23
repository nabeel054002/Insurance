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

  const protocol = id + "/protocol";
  const exchange = id + "/exchange";

  // const [signer, setSigner] = useState(null);
  const [availableInsurances, setAvailableInsurances] = useState([]);
  const [riskSpectrumLength, setRiskSpectrumLength] = useState(0);
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
          <h2>This is for ....</h2>
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
