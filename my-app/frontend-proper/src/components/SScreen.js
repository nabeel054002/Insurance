import {Balances} from './Balances'
import {useState, useEffect, useRef} from "react";
import styles from "../styles/Home.module.css"
import {utils, BigNumber} from "ethers"

export const SScreen = ({
    contract,
    daiContract,
    userABalance,
    userBBalance,
    getUserTrancheBalance,
    updateBlockTimestamp
})=>{
    
    const [amountOfDAI, setAmountOfDAI] = useState(0);

    const mintForDAI = async (value) => {
        try{
            const valueBN = utils.parseUnits(value, 18);
            console.log('valueBN', valueBN)
            const assistAddr = await contract.assistContracAddr()
            console.log('assistAddr', assistAddr)
            const tx3 = await daiContract.approve(assistAddr, valueBN);
            await tx3.wait();
            console.log('24')
            const tx = await contract?.splitRisk(valueBN, {
            gasLimit: 30000000,
            });
            await tx.wait();
            console.log('29')
            await getUserTrancheBalance();
            await updateBlockTimestamp();
            // console.log('updated c abalce')
        } catch(err) {
            console.log('err', err)
        }
    }


    return (<div>
        <h2 className={styles.titleOptions}>Vary your risk exposure using RiskSpectrum</h2>
        <br/>
        <h4 className={styles.secondInsurancesDetail}>RiskSpectrum is a decentralized DeFi risk derivative protocol on the Mumbai network.<br>
        </br>This page is to provide 2 tranche tokens to those that deposit their DAI for their investments in aDAI and cDAI</h4>  
        <br/>
        <Balances 
        userABalance={userABalance} 
        userBBalance={userBBalance} 
        />
        <br/>

        <div>
        <h4 className={styles.insurancesDetail}>To vary your risk exposure for your DAI investments in AAVE and Compound</h4>
        
        <input className = {styles.input} placeholder = "Enter DAI Amount" type="number" onChange = {(e)=>{
            setAmountOfDAI(e.target.value)
        }}/><br/>
        <div className={styles.centerRow}>
            <button className={styles.mybutton} onClick={()=>{
              // console.log('clicked deposit')
            mintForDAI(amountOfDAI);//redirect to success page
            }}>Deposit</button>
        </div>
        
        <h5 className={styles.insurancesDetail}>Deposit your DAI into the RiskSpectrum protocol</h5><br/>
        <p className={styles.secondInsurancesDetail}>A protocol in which a particular token is pooled in, which are used to buy 
        the return accruing interest in 2 different protocols. In exchange of pooling the tokens, there are 50% SafeBet 
        tranche tokens and 50% BearerOfAll tranche tokens that get issued to the end user that pooled the tokens, the 
        SafeBet tranche tokens have lower risk and has a really less chance of default and the BearerOfAll tranche is 
        the opposite. The risk mitigation happens through trading of SafeBet tranche and BearerOfAll tranche tokens and 
        not by the protocol giving you the tranche tokens.</p>
        
        <br/>
        
        </div>
    </div>)
  }