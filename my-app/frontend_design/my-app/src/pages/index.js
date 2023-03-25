import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.mainContent}>
          <div className={styles.contentWrite}>
            <h1 className={styles.headingWrite}>RISKSPECTRUM</h1><br/>
            <p>Our protocol aims to adjust the risk exposed with any particular couple of investments, in this implementation it is anly two. The investments are made on behalf of the users by the protocol by the user pooled in tokens The user gets x/2 of each SafoBet and BearerOfAll tranche tokens if the user invests &gt; number of tokens, that will be used for investments. The main features of the 2 tranches:</p><br/>
            <br/><p>SafeBet is the token that gets higher priority in the payouts during both liguld and noniliguid. The BearerOfAll on the other hand, takes lower priority and is exposed to all of the risks in all the occasions.</p>
            <br/>
            <br/>
            <div className={styles.buttonsWrite}>
              <button className={styles.varyRisk}><p>VARY RISK!</p></button>
              <button className={styles.createRiskSpectrum}><p>CREATE RISK SPECTRUM!</p></button>
            </div>
            <br/>

          </div>
          <div>
            <img src="/sideimg.png"></img>
          </div>
        </div>
      </main>
    </>
  )
}
