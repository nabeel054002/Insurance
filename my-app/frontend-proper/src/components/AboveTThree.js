import {Balances} from './Balances'
import {useState, useEffect, useRef} from "react";
import styles from "../styles/Home.module.css"
import {utils} from "ethers"

export const AboveTThree = ({
  AfromAAVE,
  AfromCompound,
  BfromAAVE,
  BfromCompound,
  userABalance,
  userBBalance,
  contract
})=>{

  const zero = BigNumber.from("0");
  const [AfromAAVE, setAfromAAVE] = useState(zero);
  const [AfromCompound, setAfromCompound] = useState(zero);
  const [BfromCompound, setBfromCompound] = useState(zero);
  const [BfromAAVE, setBfromAAVE] = useState(zero);
      
  const claimInFallbackMode = async (AfromAAVE, AfromCompound, BfromAAVE, BfromCompound) =>{
    const AfromAAVEBN = utils.parseUnits(AfromAAVE.toString(), 18);
    const BfromAAVEBN = utils.parseUnits(BfromAAVE.toString(), 18);
    const AfromCompoundBN = utils.parseUnits(AfromCompound.toString(), 18);
    const BfromCompoundBN = utils.parseUnits(BfromCompound.toString(), 18);
    const tx = await contract?.claimA(AfromAAVEBN, AfromCompoundBN, {gasLimit: 1000000});
    await tx.wait();
    const tx2 = await contract?.claimB(BfromAAVEBN, BfromCompoundBN, {gasLimit: 1000000});
    await tx2.wait();
  }
    return(<div>
      <h2 className={styles.titleOptions}>Fallback-claim your tokens</h2><br/><br/>
      <h3 className={styles.insurancesDetail}>
            Due to illiquidity of the invested tokens, the state of the insurance is not in the Liquid mode.<br></br>
            We are offering redemptions for both the SafeBet and the BearerOfAll tranches</h3>
      <div style={{
        display: "flex",
      }} className={styles.centerRow}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "40vw",
          
        }}>
          <h2 className={styles.insurancesDetail}> Claim your SafeBet tranche tokens</h2>
          <h3  className={styles.balance}>You have {utils.formatUnits(userABalance.toString(), 18)} SafeBet tranche tokens</h3>
            <p className= {styles.insurancesDetail}>How much of your SafeBet tranche tokens do you want to redeem from AAVE?</p>
            <br/>
            <input className={styles.inputMini} label="AfromAAVE" placeholder="Amount from AAVE"onChanage={(e)=>{setAfromCompound(e.target.value)}} ></input>
          <p className={styles.insurancesDetail}>How much of your SafeBet tranche tokens do you want to redeem from Compound?</p> 
          <br/>
          <input className={styles.inputMini} label = "AfromCompound" placeholder="Amount from Compound" onChanage={(e)=>{setAfromCompound(e.target.value)}}></input>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width:"40vw"

        }}>
          <h2 className={styles.insurancesDetail}>Claim your BearerOfAll tranche tokens</h2>
          <h3 className={styles.balance}>You have {utils.formatUnits(userBBalance.toString(), 18)} BearerOfAll tranche tokens</h3>
            <p className={styles.insurancesDetail}>How much of your BearerOfAll tranche tokens do you want to redeem from AAVE?</p>
            <br></br>
            <input className={styles.inputMini} label="BfromAAVE" placeholder="Amount from AAVE" onChange = {(e)=>{setBfromAAVE(e.target.value)}}></input>
          <p style = {{width:"30vw"}}className={styles.insurancesDetail}>How much of your BearerOfAll tranche tokens do you want to redeem from Compound?</p>
          <br/>
          <input className={styles.inputMini} placeholder="Amount from Compound" label="BfromCompound" onChange = {(e)=>{
            setBfromCompound(e.target.value)
          }}></input>
        </div>
      </div>
        
        <div className={styles.centerRow}>
          <button className={styles.mybutton} type = "submit"  onClick = {() => {
          const tx = claimInFallbackMode(AfromAAVE, AfromCompound, BfromAAVE, BfromCompound);
        }}>Claim!</button>
        </div>
    </div>)
  };