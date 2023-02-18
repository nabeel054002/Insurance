// add bootstrap css 
import 'bootstrap/dist/css/bootstrap.css'
// own css files here
//import "../css/customcss.css";
import "../styles/globals.css";
import {useRef, useEffect, useState, React} from "react"
import Web3Modal from "web3modal"
import { ethers, providers } from "ethers";
import Header from "../components/Header";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }) {

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
        const web3Provider = new providers.Web3Provider(provider);
        setWeb3provider(web3Provider);
    
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 1 ) {
          window.alert("Please switch to the Matic network!");
          throw new Error("Please switch to the Matic network");
        }
    
        if (needSigner) {
          const signer = web3Provider.getSigner();
          return signer;
        }
        return web3Provider;
      };

  return (<div>
    <Header prop1 ={signer}/>
    <Component prop1 = {signer} prop2 = {web3provider} {...pageProps} />
    <Footer />
  </div>);
}

export default MyApp;
