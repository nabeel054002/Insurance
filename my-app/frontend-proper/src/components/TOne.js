import {Balances} from './Balances'
import {useState, useEffect, useRef} from "react";
import styles from "../styles/Home.module.css"
import {utils} from "ethers"

export const TOne = ({
  contract,
  daiContract,
  userABalance,
  userBBalance,
  getUserTrancheBalance,
  updateBlockTimestamp,
  getIsInvested,
  isInvested
})=>{

  const [amountOfDAI_dash, setAmountOfDAI_dash] = useState(0);
        
  const mintForDAI_dash = async(value) => {
    console.log("entered", value, typeof value)
    const valueBN = utils.parseUnits(value, 18);
    console.log('valueBN', valueBN)
    const assistContractAddr = await contract.AssistContract()
    console.log("assist contract is ", assistContractAddr)
    const tx2 = await daiContract.approve(assistContractAddr, valueBN);
    await tx2.wait()
    console.log('tx2', tx2)
    console.log('contract', contract, contract.splitRiskInvestmentPeriod)
    try {const tx = await contract.splitRiskInvestmentPeriod(valueBN.toString(), {
      gasLimit: 30000000,
    });
    console.log('tx', tx)
    await tx.wait()} catch{(er)=>console.log('er', er)}
    console.log('finished Investing')
    await getUserTrancheBalance();
    await updateBlockTimestamp();

  }

  const invest = async () => {
    const tx = await contract?.invest({
      gasLimit: 1000000,
    })
    await tx.wait();
    console.log('invested!')
    getIsInvested();
  }

  return (<div>
      <h2 className={styles.titleOptions}>ONGOING INVESTMENT PERIOD FOR THIS RISK SPECTRUM<br/></h2><br/>
    <h4 className={styles.insurancesDetail}>The investment period is ongoing, you will be able to withdraw your tranche tokens after this observation period.<br></br>
    Tranche tokens are the tokens that represent your share of the pooled DAI tokens</h4>
    <br/>
    <Balances 
      userABalance={userABalance} 
      userBBalance={userBBalance} 
    />
    {/* the invest button will only be used by chainlink keepers and not by the end user, as it is unnecessary gas costs to the customers */}
    {!isInvested ? (<div className={styles.centerRow}>
      <button className={styles.mybutton} onClick={invest}>Invest</button>  
    </div>) : null}
    <br/>
      {/* to add something related to the progress of the wrapped tokens or so */}
      <h3 className={styles.titleOptions}>Wanna get more tranches ?</h3>
    <br/>
        <h3 className={styles.insurancesDetail}>You can invest in middle of the investments as well!<br></br>
        To vary your risk exposure for your DAI investments in AAVE and Compound<br>
        </br>Deposit your DAI into the RiskSpectrum protocol</h3><br/>
        <input placeholder = "Enter DAI Amount" className = {styles.input} type="number" onChange = {(e)=>{
          setAmountOfDAI_dash(e.target.value)
        }}/>
        <br/>
        <div className={styles.centerRow}>
          <button className={styles.mybutton} onClick={()=>{
          console.log("Clicked")
          mintForDAI_dash(amountOfDAI_dash);//redirect to success page
        }}>Deposit</button></div>
        <p className={styles.secondInsurancesDetail}>
          A protocol in which a particular token is pooled in, which are used to buy 
        the return accruing interest in 2 different protocols. In exchange of pooling the tokens, there are 50% SafeBet 
        tranche tokens and 50% BearerOfAll tranche tokens that get issued to the end user that pooled the tokens, the 
        SafeBet tranche tokens have lower risk and has a really less chance of default and the BearerOfAll tranche is 
        the opposite. The risk mitigation happens through trading of SafeBet tranche and BearerOfAll tranche tokens and 
        not by the protocol giving you the tranche tokens.
        <br></br>
        The investments are currently active, if you want to invest in the middle of the investments, you can do so.
        The tranche tokens will be issued to you at a weighted average of the interest bearing tokens. 
        </p>
        
  </div>)
}