import { useEffect } from "react"
import styles from "../styles/Home.module.css"
import {utils} from "ethers"

export const Balances = ({
  userABalance, 
  userBBalance,
  cBalance,
}) =>{
    //get it from the fn and cbalance inuseeffect

    const getUsersBalance = async () => {

    }
    useEffect(()=>{
      getUsersBalance()
    }, cBalance)
    return (
      <div className={styles.balances}>
        <h3 className={styles.balance}>Tranche SafeBet Balance: {utils.formatUnits(userABalance?.toString(), 18)}</h3>
        <h3 className={styles.balance}>Tranche BearerOfAll Balance: {utils.formatUnits(userBBalance?.toString(), 18)}</h3>
      </div>
    )
  }