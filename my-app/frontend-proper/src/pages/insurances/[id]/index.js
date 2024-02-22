import Head from "next/head";
import Image from "next/image";
import styles from "../../../styles/Home.module.css";
import {React} from "react"
import { BigNumber, providers, ethers, Contract, utils} from "ethers";
import {factoryAbi, factoryAddr, proxyAbi} from "../../../constants";
import Web3Modal from "web3modal"
import Link from "next/link";
import { useRouter } from 'next/router';
// const web3 = require('web3')

export default function Home({
  signer
}) {

    const router = useRouter()
    const { id } = router.query;

    const protocol = id + "/protocol";
    const exchange = id + "/exchange";
  //check if signer is null or not...
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
        {(signer) ? <div className={styles.contentInsurancePg}>
          <h2 className={styles.titleOptions}>THIS IS A RISKSPECTRUM</h2>
          <h5 className={styles.insurancesDetail}>For the investing token as Dai Stablecoin
          <br></br>to invest in the protocols, ave interest bearing DAI and Compound Dai</h5>
          <h5 className={styles.secondInsurancesDetail}>You can get the tranches, the payouts 
          and check the status of the protocol in the Protocol page. You can vary your risk 
          exposure by swapping your SafeBet or your BearerOfAll tokens for the other, 
          BearerOfAll or SafeBet respectively.</h5>
          <div className={styles.buttons}>
            {console.log("protocol",protocol)}
            <Link href = {protocol}><button className = {styles.mybutton}>Protocol</button>
            </Link>
            <Link href = {exchange}><button className = {styles.mybutton}>Exchange</button>
            </Link>
          </div>
          
        </div> : <div> Empty Signer! </div>}
      </main>
    </div>
  );
}
