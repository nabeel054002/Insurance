import Web3Modal from "web3modal"
import Head from "next/head";
import { useRouter } from 'next/router';
import styles from "../../../styles/Home.module.css";
import {useState, useEffect, useRef} from "react";
import {BigNumber, Contract, ethers, utils} from "ethers";
import { factoryAddr, factoryAbi, implementationAbi, TrancheAbi, daiAbi, assistAbi } from "../../../constants";

const Post = () => {

  let AfromAAVE = 0;
  let AfromCompound = 0;
  let BfromAAVE = 0;
  let BfromCompound = 0;
  let amountOfDAI = 0;
  let amountOfDAI_dash = 0;
  let proxyAddr = "";


  const router = useRouter()
  const { id } = router.query;
  let slicerIdx = 0;

  console.log("ID is this", id)

  for(let i = 0; i < id.length; i++){
    if(id.substring(i,i+5) === "PAUSE"){
      slicerIdx = i;
    }
  }
  const implementationAddr = id.substring(0, slicerIdx)
  proxyAddr = id.substring(slicerIdx+5, id.length)
  console.log("slicerIdx", id.substring(0, slicerIdx))
  console.log("rest", id.substring(slicerIdx+5, id.length))

  const [signer, setSigner] = useState(null);
  const [web3provider, setWeb3provider] = useState(null);

  // const [proxyAddr, setProxyAddr] = useState("");
//   const getProxyAddr = async () =>{
//     const signer = await getProviderOrSigner(true);
//     const factoryContract = new Contract(factoryAddr, factoryAbi, signer);
//     proxyAddr = await factoryContract.riskSpectrumContracts(implementationAddr);

// }
  
  console.log("proxyAddr globally is referneced as", proxyAddr)
  console.log("imp thing", implementationAddr)
  

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
            console.log("useeffect reached")
            setSigner(await getProviderOrSigner(true));
            getTimes();
            updateBlockTimestamp();//need to see if this is necessary
            getUserTrancheBalance();
            // getProxyAddr();
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
      
      const zero = BigNumber.from("0")
      const [blockTimeStamp, setBlockTimeStamp] = useState(0)
      const [S, setS] = useState(zero);
      const [tOne, setTOne] = useState(zero);
      const [tTwo, setTTwo] = useState(zero);
      const [tThree, setTThree] = useState(zero);
      const [isInvested, setIsInvested] = useState(false);//wouldnt exactly be needed
      const [inLiquidMode, setInLiquidMode] = useState(false);
      const [userABalance, setUserABalance] = useState(zero);
      const [userBBalance, setUserBBalance] = useState(zero);
      const [cBalance, setCBalance] = useState(zero);
    
      
    
      const Loading = () => {
        return (
          <div className={styles.loading}>
            <h1>{S}</h1>
            <h1>{tOne}</h1>
            <h1>{tTwo}</h1>
          </div>
        )
      }
    
      const getTimes = async () =>{
        //to be run only once 
        const signer = await getProviderOrSigner(true);
        // if(proxyAddr.length == 0){await getProxyAddr()}
        // console.log("proxyAddr is ", proxyAddr)
        const contract = new ethers.Contract(proxyAddr, implementationAbi, signer);
        console.log(contract)
        // const contract = new ethers.Contract("SplitInsuranceV2", proxyAddr, signer);
        console.log("Contract is", contract)
        let s = (await contract.S())
        console.log("S is ", s)
        setS(s)
        setTOne((await contract.T1()));
        setTTwo((await contract.T2()));
        setTThree((await contract.T3()));
      }
      
      const mintForDAI_dash = async(value) => {
        console.log("entered")
        const signer = await getProviderOrSigner(true);
        // if(proxyAddr.length == 1){await getProxyAddr()}
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const valueBN = utils.parseUnits(value, 18);
        const dai = new Contract("0x6b175474e89094c44da98b954eedeac495271d0f", daiAbi, signer);
        console.log("assist contract is ",await contract.AssistContract())
        const tx2 = await dai.approve(await contract.assistContracAddr(), valueBN);
        const tx = await contract.splitRiskInvestmentPeriod(valueBN, {
          gasLimit: 1000000,
        });
        await tx.wait()
    
      }
    
      const mintForDAI = async (value) => {
        const signer = await getProviderOrSigner(true)
        const contract = new ethers.Contract(proxyAddr, implementationAbi, signer);
        const valueBN = utils.parseUnits(value, 18);
        const dai = new Contract("0x6b175474e89094c44da98b954eedeac495271d0f", daiAbi, signer);
        const tx3 = await dai.approve(await contract.assistContracAddr(), valueBN);
        await tx3.wait();
        //idhar tak theek hai 
        const assist = new Contract(await contract.AssistContract(), assistAbi, signer);
        const tx = await contract.splitRisk(valueBN, {
          gasLimit: 30000000,
        });
        await tx.wait();
        const implementation = new Contract(implementationAddr, implementationAbi, signer)
        console.log("value of c in actual", await implementation.c())
        console.log("value of c in assists contract is",await assist.c())
        await updateCBalance();
    }
    
      const updateBlockTimestamp = async () =>{
        // const provider = new ethers.providers.InfuraProvider("https://eth-mainnet.g.alchemy.com/v2/1jL4KovovKlEyn-QtmIhBAFbarVNUd_M");
    
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new ethers.providers.Web3Provider(provider);
        web3Provider.getBlock('latest').then((block)=>{
            const t = (block.timestamp)
            setBlockTimeStamp(t)
        })
        const signer = await getProviderOrSigner(true);
        // if(proxyAddr.length == 1){await getProxyAddr()
        // }
        const contract = new ethers.Contract(proxyAddr, implementationAbi, signer);
        const isInvested = (await contract.isInvested())
        const inLiquidMode = (await contract.inLiquidMode())
        setIsInvested(isInvested)
        setInLiquidMode(inLiquidMode)
      }
    
    
    
      const getUserTrancheBalance = async () =>{
        const signer = await getProviderOrSigner(true);
        const addrUser = (await signer.getAddress())
        // if(proxyAddr.length == 1){await getProxyAddr()}
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const AtrancheAddr = (await contract.A());
        const BtrancheAddr = (await contract.B());
        const AtrancheContract = new Contract(AtrancheAddr, TrancheAbi, signer);
        const AtrancheBalance = await AtrancheContract.balanceOf(addrUser);
        setUserABalance(AtrancheBalance);
        const BtrancheContract = new Contract(BtrancheAddr, TrancheAbi, signer);
        const BtrancheBalance = await BtrancheContract.balanceOf(addrUser);
        setUserBBalance(BtrancheBalance);
      }
    
      useEffect(()=>{
        updateBlockTimestamp();
        updateCBalance();
      }, [isInvested, inLiquidMode])
    
      const updateCBalance = async () =>{
        const signer = await getProviderOrSigner();
        // if(proxyAddr.length == 1){await getProxyAddr()}
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const cBalance = (await contract.cBalance());
        setCBalance(cBalance);
      }
    
      const claimInLiquidmode = async () =>{
        console.log("claim in liquid mode entered")
        const signer = await getProviderOrSigner();
        // if(proxyAddr.length == 1){await getProxyAddr()}
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const tx = await contract.claimAll({
          gasLimit: 1000000,
        })
        await tx.wait(); 
      }

      const invest = async () => {
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const tx = await contract.invest({
          gasLimit: 1000000,
        })
        await tx.wait();
      }

      const divest = async () =>{
        const signer = await getProviderOrSigner(true);
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const tx = await contract.divest({
          gasLimit: 1000000,
        })
        await tx.wait();

      }
    
      const claimInFallbackMode = async (AfromAAVE, AfromCompound, BfromAAVE, BfromCompound) =>{
        // if(proxyAddr.length == 1){await getProxyAddr()}
        const signer = await getProviderOrSigner(true)
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const AfromAAVEBN = utils.parseUnits(AfromAAVE.toString(), 18);
        const BfromAAVEBN = utils.parseUnits(BfromAAVE.toString(), 18);
        const AfromCompoundBN = utils.parseUnits(AfromCompound.toString(), 18);
        const BfromCompoundBN = utils.parseUnits(BfromCompound.toString(), 18);
        let tx = await contract.claimA(AfromAAVEBN, AfromCompoundBN);
        await tx.wait();
        await contract.claimB(BfromAAVEBN, BfromCompoundBN);
        await tx.wait();
      }
    
      const claimInOnlyA = async (AfromAAVE, AfromCompound) =>{
        const signer = await getProviderOrSigner(true)
        // if(proxyAddr.length == 1){await getProxyAddr()}
        const contract = new Contract(proxyAddr, implementationAbi, signer);
        const AfromAAVEBN = utils.parseUnits(AfromAAVE.toString(), 18);
        const AfromCompoundBN = utils.parseUnits(AfromCompound.toString(), 18);
        let tx = await contract.claimA(AfromAAVEBN, AfromCompoundBN, {
          gasLimit: 1000000,
        });
        await tx.wait();
      }
    
      const Balances = () =>{
        return (
          <div className={styles.balances}>
            <h3 className={styles.balance}>Tranche SafeBet Balance: {utils.formatUnits(userABalance.toString(), 18)}</h3>
            <h3 className={styles.balance}>Tranche BearerOfAll Balance: {utils.formatUnits(userBBalance.toString(), 18)}</h3>
          </div>
        )
      }
    
      //so by doing a function call the state is changing then handle that, and render differently, if it rendered so, but dont handle the change that occurs when the user lets the site open for too long
      const SScreen = ()=>{
        return (<div>
            <h2 className={styles.titleOptions}>Vary your risk exposure using RiskSpectrum</h2>
            <br/>
            <h4 className={styles.secondInsurancesDetail}>RiskSpectrum is a decentralized DeFi risk derivative protocol on the Mumbai network.<br></br>This page is to provide 2 tranche tokens to those that deposit their DAI for their investments in aDAI and cDAI</h4>  
            <br/>
            <Balances/>
            <br/>
    
            <div>
            <h4 className={styles.insurancesDetail}>To vary your risk exposure for your DAI investments in AAVE and Compound</h4>
            
            <input className = {styles.input} placeholder = "Enter DAI Amount" type="number" onChange = {(e)=>{
                amountOfDAI = (e.target.value)
            }}/><br/>
            <div className={styles.centerRow}>
                <button className={styles.mybutton} onClick={()=>{
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
    
      const TOne = ()=>{
        return (<div>
            <h2 className={styles.titleOptions}>ONGOING INVESTMENT PERIOD FOR THIS RISK SPECTRUM<br/></h2><br/>
          <h4 className={styles.insurancesDetail}>The investment period is ongoing, you will be able to withdraw your tranche tokens after this observation period.<br></br>
          Tranche tokens are the tokens that represent your share of the pooled DAI tokens</h4>
          <br/>
          <Balances/>
          {/* the invest button will only be used by chainlink keepers and not by the end user, as it is unnecessary gas costs to the customers */}
          <div className={styles.centerRow}>
            <button className={styles.mybutton} onClick={invest}>Invest</button>  
          </div>
          <br/>
            {/* to add something related to the progress of the wrapped tokens or so */}
            <h3 className={styles.titleOptions}>Wanna get more tranches ?</h3>
          <br/>
              <h3 className={styles.insurancesDetail}>You can invest in middle of the investments as well!<br></br>
              To vary your risk exposure for your DAI investments in AAVE and Compound<br>
              </br>Deposit your DAI into the RiskSpectrum protocol</h3><br/>
              <input placeholder = "Enter DAI Amount" className = {styles.input} type="number" onChange = {(e)=>{
                amountOfDAI_dash = (e.target.value)
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
    
      const TTwo = ()=>{
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
    
      const TThree = ()=>{
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
                      AfromAAVE = (e.target.value)
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
    
      const AboveTThree = ()=>{
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
                <input className={styles.inputMini} label="AfromAAVE" placeholder="Amount from AAVE"></input>
              <p className={styles.insurancesDetail}>How much of your SafeBet tranche tokens do you want to redeem from Compound?</p> 
              <br/>
              <input className={styles.inputMini} label = "AfromCompound" placeholder="Amount from Compound"></input>
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
                <input className={styles.inputMini} label="BfromAAVE" placeholder="Amount from AAVE" onChange = {(e)=>{BfromAAVE = e.target.value}}></input>
              <p style = {{width:"30vw"}}className={styles.insurancesDetail}>How much of your BearerOfAll tranche tokens do you want to redeem from Compound?</p>
              <br/>
              <input className={styles.inputMini} placeholder="Amount from Compound" label="BfromCompound" onChange = {(e)=>{
                BfromCompound = e.target.value
              }}></input>
            </div>
          </div>
            
            <div className={styles.centerRow}>
              <button className={styles.mybutton} type = "submit"  onClick = {() => {
              const tx = claimInFallbackMode(AfromAAVE, AfromCompound, BfromAAVE, BfromCompound);
            }}>Claim!</button>
            </div>
        </div>)
      }
      const Screen = () => {
        if (blockTimeStamp < S){
          return(
            <SScreen/>
          )
        }
        //get aDAI and cDAI balance
        else if (blockTimeStamp < tOne){
          return(
            <TOne/>
            // <SScreen/>
          )
        }
        else if (blockTimeStamp < tTwo){
          return(
            <TTwo/>
          )
        }
        else if (blockTimeStamp < tThree){
          return(
            <TThree/>
          )
        }
        else if (blockTimeStamp > tThree){
          if(inLiquidMode){
            return <TThree/>
          }else{
            return(
              <AboveTThree/>
              // <TThree/>
              // <TOne/>
            )
          }
          
      } else{
        return(
          <div>
            <AboveTThree/>
          </div>
        )
      }
    }
      return (
        <div>
          <Head>
            <title>RiskSpectrum</title>
            <meta
              name="description"
              content="Insurance page for RiskSpectrum"
            />
            <link rel="icon" href="/favicon.ico" />
            {/* change the icon */}
          </Head>
          <main className={styles.main}>
              <Screen/>
          </main>
        </div>
      );

}

export default Post