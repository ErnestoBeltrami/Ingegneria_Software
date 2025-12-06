import { useEffect,useState} from "react";
import HeaderCittadino from "./HeaderCittadino/HeaderCittadino.jsx";
import MostraVotazione from "./MostraVotazione/MostraVotazione.jsx";
function DashboardCittadino() {

  const datiDashboard = {
    votazioni: [
      {
        id: 12,
        titolo: "Bilancio Partecipativo",
        descrizione: "Decidi come investire i fondi",
        stato: "aperta",
        inizio: "2025-10-01",
        fine: "2025-10-20"
      },
      {
        id: 13,
        titolo: "Nuovo Centro Sportivo",
        descrizione: "Vuoi che venga costruito?",
        stato: "aperta",
        inizio: "2025-09-20",
        fine: "2025-10-10"
      }
    ],

    sondaggi: [
      {
        id: 31,
        titolo: "Trasporti in città",
        descrizione: "Dicci cosa migliorare",
        stato: "aperto"
      }
    ]
  };

  const [votazioni,setVotazioni] = useState([]);
  const [sondaggi,setSondaggi] = useState([]);
  
  useEffect(() => {
    // Simula il caricamento dei dati
    setVotazioni(datiDashboard.votazioni);
    setSondaggi(datiDashboard.sondaggi);
  }, []);


  return (
    <div className="dashboard_cittadino">
      <HeaderCittadino/>
      <section  className="hd_dashboard_cittadino">
        <h1> Benvenuto, Cittadino! </h1>
        <h3>Sei pronto a partecipare al cambiamento della tua città oggi?</h3>
      </section>
      <section className="sez_secondaria">
        <div className="cards_row">
          {/* Qui andranno le card cliccabili */}
          <div className="card_cliccabile">
            Votazione conluse
          </div>
          <div className="card_cliccabile">
            Bacheca iniziative
          </div>
        </div>
      </section>
      <p>Qui ci vanno i filtri</p>
      <section className="sez_terziaria">
          {/* Qui andranno le card delle votazioni e dei sondaggi renderizzati in base al filtri */}
          <div className="cards_row">
            {votazioni.map((v) => (
              <MostraVotazione key={v.id} titolo={v.titolo} termine={v.fine}/>
            ))}
          </div>
      </section>
    </div>
  );
}
export default DashboardCittadino;  