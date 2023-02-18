import styles from "../styles/Home.module.css"
import { useEffect, useState } from "react";


const Header = (signerInput, {children}) =>{
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState("");


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
        <div>
            <div className={styles.container}>
                <div className={styles.header}>
                <h1 className={styles.topName}>InsuraTranch</h1>    
                <h1 className={styles.addrName}>{(address).substr(0,5) + "..." + address.substr(address.length-4, )}</h1>        
                </div>
                
            </div>
        {children}
        </div>
    )
}
export default Header