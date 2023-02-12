import styles from "../styles/Home.module.css"
const Thing = ({children}) =>{
    return (
        <div>
        <header><div className={styles.header}>
                <h1 className={styles.heading}>InsuraTranch</h1>            
            </div></header>
        {children}
        </div>
    )
}
export default Thing