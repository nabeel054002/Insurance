import Link from "next/link";
import styles from "../styles/Home.module.css";

export const RiskSpectrumOption = ({
    implementationAddr,
    proxyAddr,
    description
}) => {
    const linkUrl = "/insurances/" + implementationAddr + "PAUSE" + proxyAddr;
    return(
        <Link href={linkUrl}>
          <div className = {styles.riskSpectrum}>
            <div className={styles.riskSpectrumLeft}>
              <div className={styles.riskSpectrumLeftContent}>
                <h3 className={styles.titleRiskSpectrum}>RiskSpectrum {implementationAddr.substr(0,6)}</h3>
                <h5 className={styles.investingToken}>INVESTING TOKEN</h5><h5 className={styles.investingTokenName}>{description[0]}</h5>
              </div>
            </div>
            <div className={styles.riskSpectrumRight}>
              <div className={styles.riskSpectrumRightContent}>
                <h5 className={styles.protocolsAre}>Protocols are</h5>
                <h5 className={styles.protocolName}>{description[1]}</h5><br></br>
                <h5 className={styles.protocolName}>{description[2]}</h5>
              </div>
            </div>
        </div></Link>
    )
}