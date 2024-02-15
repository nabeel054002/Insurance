import {Balances} from './Balances'
import {useState, useEffect, useRef} from "react";
import styles from "../styles/Home.module.css"
import {utils} from "ethers"

export const TThree = (
  inLiquidMode,
  contract
)=>{  
    const claimInOnlyA = async (AfromAAVE, AfromCompound) =>{
      const AfromAAVEBN = utils.parseUnits(AfromAAVE.toString(), 18);
      const AfromCompoundBN = utils.parseUnits(AfromCompound.toString(), 18);
      const tx = await contract?.claimA(AfromAAVEBN, AfromCompoundBN, {
        gasLimit: 1000000,
      });
      await tx.wait();
    }

    const claimInLiquidmode = async () =>{
      const tx = await contract?.claimAll({
        gasLimit: 1000000,
      })
      await tx.wait(); 
    }
    /////for now we will only observer this
    if(inLiquidMode){
      return(<div>
        <h3 className={styles.titleOptions}>LIQUID CASE</h3><br></br>
        <h3 className={styles.insurancesDetail}>The divest call has been made, the conversion of SafeBet and BearerOfAll tranches are both available.<br>
        </br><br></br><br></br>Claim your tranche tokens and convert them into DAI</h3><br></br><br></br><br></br>
          <div className={styles.balances}><h3 className={styles.balance}>You have {utils.formatUnits(userABalance.toString(), 18)} SafeBet tranche tokens</h3>
          <h3 className={styles.balance}>You have {utils.formatUnits(userBBalance.toString(), 18)} BearerOfAll tranche tokens</h3>
            </div><br></br>
          <h3 className={styles.insurancesDetail}>Claim the DAI tokens that you are entitled to!</h3>  
          <div className={styles.centerRow}><button className={styles.mybutton} onClick={()=>(claimInLiquidmode())}>Claim!</button>
            </div>
      </div>)
    }else{
      return(<div>
        <h3 className={styles.titleOptions}>ILLIQUID CASE - DIVEST CALL unsuccessful</h3>
        <h3 className={styles.insurancesDetail}>The divest call was attempted, but unfortunately the protocols(s) were not in liquid mode<br>
        </br>You can claim your higher priority SafeBet tranche tokens now!</h3>
        <div><br/>
          <h4 className={styles.secondInsurancesDetail}>
            Fallback-claim the DAI tokens that you are entitled to for your SafeBet tranches!<br/>
          You now have to decide which of your traches go to redeem which protocol
          You have an option between aDAI and cDAI
          </h4><br/>
          <br/>
          <h3 style={{
            marginLeft:"35vw",
            width:"30vw",
          }} className={styles.balance}>You have {utils.formatUnits(userABalance.toString(), 18)} SafeBet tranche tokens</h3>      
          <br/>
            <br/>
            <div style={{
              display: "flex",
              width: "100%",
            }}>
              <div className={styles.inputWindow}>
              <h5 className={styles.insurancesDetail}>How many of your superior tranches do you wanna exchange for aDAI?</h5>
                <div style = {{
                  width:"50vw",
                }} className={styles.centerRow}><input className={styles.inputMini} placeholder="Amount from AAVE" onChange = {(e)=>{
                setAfromAAVE(e.target.value)
                // need to keep a max check
                  }}></input>
                </div>
            </div>
            <div className={styles.inputWindow}>
              <h5 className={styles.insurancesDetail}>How many of your superior tranches do you wanna exchange for cDAI?</h5>  
                <div style={{
                  width:"50vw",
                }} className={styles.centerRow}>
                  <input className={styles.inputMini} placeholder="Amount from Compound" onChange = {(e)=>{
                  AfromCompound = e.target.value
              }}></input> 
                </div>
            </div>
            </div>
            
              <div className={styles.centerRow}>
                <button className={styles.mybutton} onClick = {()=>{
                  claimInOnlyA(AfromAAVE, AfromCompound);
                }}>Claim!</button>
              </div>
              
        </div>
      </div>)
    }
  }
