import styles from './HeaderCittadino.module.css';
import logoutIcon from "../assets/logout.svg";
function HeaderCittadino(){
    return(
        <header className={styles.header_cittadino}>
{/*         <img src={logo} alt="Logo Progetto" className={styles.logo}/>*/}
        <h1 className={styles.title}>IoSonoTrento</h1>
            <span className={styles.user_name}> Jerry Scotti </span>
            <span className={styles.logout}> <img src={logoutIcon}/> </span>
        </header>
    );
}

export default HeaderCittadino;