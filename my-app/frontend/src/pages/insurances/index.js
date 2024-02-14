import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import {factoryAbi, factoryAddr, proxyAbi} from "../../constants";
import Web3Modal from "web3modal"
import Link from "next/link";

// const web3 = require('web3')


export default function Home(signerInput) {

  const [proxyArr, setProxyArr] = useState([]);
  const [implementationArr, setImplementationArr] = useState([]);
  const [descriptionArr, setDescriptionArr] = useState([]);

  const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();

    useEffect(() => {
        if (!walletConnected) {
          web3ModalRef.current = new Web3Modal({
            network: "hardhat",
            providerOptions: {},
            disableInjectedProvider: false,
          });
          connectWallet()
        }
      }, [walletConnected]);

    const connectWallet = async () => {
        await getProviderOrSigner();
        setWalletConnected(true);
        await getRiskSpectrums();
    };

    const getProviderOrSigner = async (needSigner = false) => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new ethers.providers.Web3Provider(provider);
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 1 ) {
          // window.alert("Please switch to the Hardhat fork network!");
          throw new Error("Please switch to the Hardhat fork network");
        }
    
        if (needSigner) {
          const signer = web3Provider.getSigner();
          return signer;
        }
        return web3Provider;
      };
  const getRiskSpectrums = async () => {
    const signer = await getProviderOrSigner(true);
    console.log('signer', signer)
    const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
    
    let arrLength = await factoryContract.riskSpectrumContractsArrayLength();
    console.log('reached here in arrlenghtr')
    arrLength = 3;
    //the issue is in reading the contract...
    const proxyContracts = [];
    const implementationContracts = [];
    const descriptionArr = [];
    for(let i = 0; i < arrLength; i++){
        const proxyContract = new Contract(await factoryContract.riskSpectrumContractsArray(i), proxyAbi, signer);
        proxyContracts.push(proxyContract.address);
        const implementationContract = new Contract(await proxyContract.implementation(), proxyAbi, signer);
        implementationContracts.push(implementationContract.address);
        const description = await factoryContract.returnData(implementationContract.address);
        descriptionArr.push(description);
    }
    setProxyArr(proxyContracts);
    setImplementationArr(implementationContracts);
    setDescriptionArr(descriptionArr);
  }

  const availableRiskSpectrums = () => {
    let linkUrl = "";
    return (
      <div>
        {descriptionArr.map((description, index) => {
          linkUrl = "/insurances/" + implementationArr[index] + "PAUSE" + proxyArr[index];
          return(
            <Link href={linkUrl}>
              <div className = {styles.riskSpectrum}>
                <div className={styles.riskSpectrumLeft}>
                  <div className={styles.riskSpectrumLeftContent}>
                    <h3 className={styles.titleRiskSpectrum}>RiskSpectrum {implementationArr[index].substr(0,6)}</h3>
                    <h5 className={styles.investingToken}>INVESTING TOKEN</h5><h5 className={styles.investingTokenName}>{description[0]}</h5>
                  </div>
                </div>
                <div className={styles.riskSpectrumRight}>
                  <div className={styles.riskSpectrumRightContent}>
                    <h5 className={styles.protocolsAre}>Protocols are</h5>
                    <h5 className={styles.protocolName}>{description[1]}</h5><br></br>
                    <h5 className={styles.protocolName}>{description[2]}</h5>
                  </div>
                </div>
              </div></Link>
              )
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
        <div className = {styles.contentInsurances}>
          <h2 className={styles.titleOptions}>Available Risk Spectrums</h2>
          {availableRiskSpectrums()}
        </div>
      </main>
    </div>
  );
}
