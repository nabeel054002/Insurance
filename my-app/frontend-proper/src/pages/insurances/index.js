import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import {factoryAbi, factoryAddr, proxyAbi} from "../../constants";
import {RiskSpectrumOption} from "../../components/RiskSpectrumOption";

export default function Home({
  signer
}) {

  const [proxyArr, setProxyArr] = useState([]);
  const [implementationArr, setImplementationArr] = useState([]);
  const [descriptionArr, setDescriptionArr] = useState([]);


  useEffect(() => {
    getRiskSpectrums()
  }, [signer])

  const getRiskSpectrums = async () => {
    console.log('signer', signer?'Signer there':'empty signer')
    if(!signer) return;
    const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
    let arrLength = await factoryContract.riskSpectrumContractsArrayLength();
    console.log('arrLength', arrLength)
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
    console.log(descriptionArr)
    setProxyArr(proxyContracts);
    setImplementationArr(implementationContracts);
    setDescriptionArr(descriptionArr);
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
        {signer ? (<div className = {styles.contentInsurances}>
          <h2 className={styles.titleOptions}>Available Risk Spectrums</h2>
          {/* {availableRiskSpectrums()} */}
          {descriptionArr.map((description, idx)=> {
            const proxyAddr = proxyArr[idx];
            const implementationAddr = implementationArr[idx];
            return(
              <RiskSpectrumOption
                implementationAddr={implementationAddr}
                proxyAddr={proxyAddr}
                description={description}
              />
            )
          })}
        </div>) : <div>Empty!</div>}
      </main>
    </div>
  );
}
