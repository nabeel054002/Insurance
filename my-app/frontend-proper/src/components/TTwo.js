import {Balances} from './Balances'
import {useState, useEffect, useRef} from "react";
import styles from "../styles/Home.module.css"
import {utils} from "ethers"

export const TTwo = (
  contract
)=>{

  const divest = async () =>{
    const tx = await contract?.divest({
      gasLimit: 1000000,
    })
    await tx.wait();
  }
  return (<div>
    <h3 className={styles.titleOptions}>The divest call is to made today</h3><br></br><br></br>
    <h3 className={styles.insurancesDetail}>The liquidation of aDAI and cDAI into the DAI are to be made today.<br>
    </br>The payouts and the option to claim your DAI tokens will be available from tomorrow. :)</h3>
    <h3 className={styles.insurancesDetail}>Based on the outecome of the divest call, there will be 4 differemt cases<br></br></h3>
    <ul>
      <div>
        <li className={styles.insurancesDetail}>Profitable and Liquid</li>
        <p className={styles.secondInsurancesDetail}>The divest call was successful and the net amount of DAI is more than the initial amount of DAI that was invested.<br>
        </br>In this case both the tranches will have the same preference and each tranche will be entitled to the same amount of payouts.<br>
        </br>This is more likely the case in the more famous and profitable cases</p>
      </div>
      <div>
        <li className={styles.insurancesDetail}>Not so much of loss making and Liquid</li>
        <p className={styles.secondInsurancesDetail}>The divest call was successful and the net amount of DAI is less than the initial amount but more than half of the amount<br>
        </br> of DAI invested. In this case if any of the protocols are profitable, then the profits of that plus the initial amount of DAI invested<br>
        </br>in each protocol will go to the SafeBet tranche token, and the rest of the DAI that we get in return will be given as payouts to the  <br>
        </br>holders of the BearerOfAll tranches.</p>
      </div>
      <div>
        <li className={styles.insurancesDetail}>Loss making and Liquid</li>
        <p className={styles.secondInsurancesDetail}>The divest call was successful and the net amount of DAI is less than half of the DAI invested<br>
        </br>In this case the net amount of Investing Token that we get upon liquidation of the two protocols is completely<br>
        </br>distributed amongst only the SafeBet tranches and the BearerOfAll tranche holders dont recieve anything.</p>
      </div>
      <div>
        <li className={styles.insurancesDetail}>Illiquid Case</li>
        <p className={styles.secondInsurancesDetail}>The divest call was unsuccessful, in the sense that the protocol(s) were illiquid<br>
        </br>In this case the aDAI and cDAI are distributed evenly. The preference between SafeBet and BearerOfAll tranches comes from <br>
        </br>that the SafeBet tranche holders will be able to get the payouts in the interest bearing tokens before the BearerOfAll tranche <br>
        </br>holders get to do so.</p>
      </div>
    </ul>
    <div className={styles.centerRow}>
      <button className={styles.mybutton} onClick = {divest}>Divest!</button>
    </div>
    </div>)
}