import styles from "./MostraVotazione.module.css";

function MostraVotazione({key, titolo, termine}){
    return(
        <div key={key} className={styles.mostra_votazione}>
            <h1 className={styles.titolo_votazione}> {titolo} </h1>
            <div className={styles.mostra_votazione_footer}>
                <span className={styles.termine}> Termine: {termine} </span>
                <button className={styles.btn_vota}>
                    Vota
                </button>         
            </div>
        </div>
    );
}

export default MostraVotazione 