import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import {factoryAbi, factoryAddr, proxyAbi} from "../../constantsFactory";
import { relativeTimeRounding } from "moment";
import Web3Modal from "web3modal"
import Link from "next/link";

// const web3 = require('web3')


export default function Home(signerInput) {

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
            getRiskSpectrums();
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

  // useEffect( () => {
  //   if (signerInput) {
  //     console.log("signers",signerInput)
  //       setSigner(signerInput.prop1);
  //       if(signer){
  //         console.log("Signer is ", signer)
          
  //       }
  //       getRiskSpectrums();
  //     }

  //   }, [signer])

  const getRiskSpectrums = async () => {
    console.log("getRiskSpectrums entered")
    const signer = await getProviderOrSigner(true);
    const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
    console.log("asdads")
    console.log(factoryContract)
    const arrLength = await factoryContract.riskSpectrumContractsArrayLength();//issue, for now it is just gonna be 3
    // const arrLength = 3;
    console.log("arrLength is ", arrLength.toString())
    const proxyContracts = [];
    const implementationContracts = [];
    const descriptionArr = [];
    console.log("for loop abt to enter")
    for(let i = 0; i < arrLength; i++){
      console.log("asdasdasd")
        const proxyContract = new Contract(await factoryContract.riskSpectrumContractsArray(i), proxyAbi, signer);
        proxyContracts.push(proxyContract.address);
        const implementationContract = new Contract(await proxyContract.implementation(), proxyAbi, signer);
        implementationContracts.push(implementationContract.address);
        const description = await factoryContract.detailsOfRiskSpectrums(proxyContract.address);
        console.log(description.slice(0,3));
        descriptionArr.push(description);
    }
    console.log("for loop exited")
    setProxyArr(proxyContracts);
    setImplementationArr(implementationContracts);
    setDescriptionArr(descriptionArr);
    setRiskSpectrumLength(arrLength);
  }

  const availableRiskSpectrums = () => {
    let linkUrl = "";
    return (
      <div>
        {descriptionArr.map((description, index) => {
          linkUrl = "/insurances/" + implementationArr[index]
          return(
            <Link href={linkUrl}><div className = {styles.riskSpectrum}>
                <h3>RiskSpectrum  {implementationArr[index].substr(0,6)}</h3>
              <div className={styles.investingToken}><h5>Name of investing Token: {description[0]}</h5></div>
              
              <div className={styles.protocolsInRiskSpectrum}>
                <h5>Name of protocols are:</h5>
                <h5>{description[1]}</h5>
                <h5>{description[2]}</h5>
              </div>
              </div></Link>)
        })}
      </div>
    )
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
          <h2>Available Risk Spectrums:</h2>
          {availableRiskSpectrums()}
          {descriptionArr.map((description, index) => {
          <div>
            asdasd
          </div>
        })}
        length of description array is  {}
        </div>
      </main>
    </div>
  );
}
