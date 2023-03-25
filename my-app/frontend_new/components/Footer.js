import styles from "../styles/Home.module.css";
import Link from "next/link";

const Footer = () =>{
    return (
        <div className={styles.footer}>
             <footer>
              <div className={styles.footerContent}>
                  <div>
                    <h2>
                      RiskSpectrum
                    </h2>
                    <Link href="instagram.com">Instagram</Link>
                    <Link href="twitter.com">Twitter</Link>
                  </div>
                  <div >
                    <h2>Made with &#10084;<br/> by Nabeel</h2>
                  </div>
              </div>
             </footer>
        </div>
    )
}
export default Footer;