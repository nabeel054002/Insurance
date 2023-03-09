import styles from "../styles/Home.module.css";
import Link from "next/link";

const Footer = () =>{
    return (
        <div className={styles.footer}>
             <footer>
              <div className={styles.footerContent}>
                  <div className = {styles.footerSocials}>
                    <h2>
                      RiskSpectrum
                    </h2>
                    <Link href="instagram.com">Instagram</Link>
                    <Link href="twitter.com">Twitter</Link>
                  </div>
                  <div className = {styles.footerDescription}>
                    <h2>Description</h2>
                    <p></p>
                  </div>
              </div>
             </footer>
        </div>
    )
}
export default Footer;