import '@/styles/globals.css'
import "../styles/globals.css";
import {useRef, useEffect, useState, React} from "react"
import Web3Modal from "web3modal"
import {ethers} from "ethers";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }) {
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
        console.log("provider", ethers)
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

  return (<div>
    <Header prop1 ={signer}/>
    <Component prop1 = {signer} prop2 = {web3provider} {...pageProps} />
    <Footer />
  </div>);
}
