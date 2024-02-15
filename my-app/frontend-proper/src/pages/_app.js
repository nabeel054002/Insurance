import '@/styles/globals.css'
import "../styles/globals.css";
import {useRef, useEffect, useState, React} from "react"
import Web3Modal from "web3modal"
import {ethers} from "ethers";
import Header from "../components/Header";

export default function App({ Component, pageProps }) {
    const [address, setAddress] = useState('');
    const [signer, setSigner] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false);
    const [provider, setProvider] = useState(null)
    const web3ModalRef = useRef();

    useEffect(() => {
        if (!walletConnected) {
          web3ModalRef.current = new Web3Modal({
            network: "hardhat",
            providerOptions: {},
            disableInjectedProvider: false,
          });
    
          connectWallet();
        }
      }, [walletConnected]);

    const connectWallet = async () => {
    try {
        const signer = await getProviderOrSigner(true);
        const provider = await getProviderOrSigner();
        let addr = await signer.getAddress();
        setAddress(addr);
        setSigner(signer);
        setProvider(provider)
        setWalletConnected(true);
    } catch (error) {
        console.error(error);
    }
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

  return (<div>
    <Header address={address? address : ''}/>
    <Component signer={signer} provider={provider} {...pageProps} />
  </div>);
}
