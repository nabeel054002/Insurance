import styles from "../styles/Home.module.css"
import { useEffect, useState } from "react";
import {logo} from "../../public/logo.png"
import {wallet} from "../../public/wallet.png"

const Header = (signerInput, {children}) =>{
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState("");

    // console.log("childre", children)//did not give anything

    useEffect( () => {
        if (signerInput) {
            setSigner(signerInput.prop1)
            getAddress()
        }
    })

    const getAddress = async () => {
        if(signer){
            const address = await signer.getAddress();
            setAddress(address);
        }
        
    }
    return (
        <div className={styles.Header}>
            <img className = {styles.headerName} src="/logo.png"></img>
            <div className={styles.headerAddr}>
                <div className={styles.wallet}>
                    <img src="/wallet.png"></img>
                    <p className={styles.addr}>{address.substr(0, 6) + "..." + address.substr(address.length - 4)}</p>
                </div>
                
            </div>
        </div>
    )
}
export default Header