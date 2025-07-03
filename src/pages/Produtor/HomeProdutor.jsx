import { Link } from "react-router-dom";
import styles from "./HomeProdutor.module.css";

export default function Home() {
  return (
    <div className={`pagina ${styles.container}`}>
      <h2>🌿 Bem-vindo Produtor</h2>
      <p className={styles.subtitle}>
        Escolha uma das opções abaixo para continuar
      </p>

      <div className={styles.cardGrid}>
        <Link to="/producao" className={styles.card}>
          <span>🌽</span>
          <strong>Produção Agrícola</strong>
          <p>Registre e visualize os dados de colheita</p>
        </Link>

        <Link to="/pesquisa-sindicatos" className={styles.card}>
          <span>🤝</span>
          <strong>Sindicatos</strong>
          <p>Veja os sindicatos cadastrados e seus eventos</p>
        </Link>

        <Link to="/pesquisa" className={styles.card}>
          <span>🔍</span>
          <strong>Pesquisa</strong>
          <p>Encontre dados de cultivos gerais</p>
        </Link>

        <Link to="/relatorios-produtor" className={styles.card}>
          <span>📊</span>
          <strong>Relatórios</strong>
          <p>Visualize gráficos e relatórios resumidos</p>
        </Link>
      </div>
    </div>
  );
}
