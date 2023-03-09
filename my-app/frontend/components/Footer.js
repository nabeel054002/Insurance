import styles from "../styles/Home.module.css";

const Footer = () =>{
    return (
        <div className={styles.footer}>
             <footer>
              <div>
                <nav>
                  <ul className={styles.fut}>
                    <li className={styles.fut_content}>
                      <h2>RiskSpectrum</h2>
                      <p>This protocol is a derivative like insurance providing protocol</p>
                      </li>
                    <li className={styles.fut_content}><h2>Description</h2></li>
                  </ul>
                </nav>
              </div>
             </footer>
        </div>
    )
}
export default Footer;