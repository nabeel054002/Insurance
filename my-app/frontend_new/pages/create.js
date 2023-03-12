import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {useRef, useEffect, useState, React} from "react"
import { BigNumber, providers, Contract, utils, ethers} from "ethers";
import Web3Modal from "web3modal";
import {proxyAddr, implementationAddr, assistAddr, proxyAbi, implementationAbi, TrancheAbi, daiAbi, assistAbi} from "../constants";

import Footer from "../components/Footer";

// const web3 = require('web3')


export default function Home(signerInput) {
    
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
        
      </main>
    </div>
  );
}

