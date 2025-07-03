import { Link } from "react-router-dom";
import styles from "./HomeSindicato.module.css";

export default function HomeSindicato() {
  return (
    <div className={`pagina ${styles.container}`}>
      <h2>👷‍♂️ Bem-vindo Sindicato</h2>
      <p className={styles.subtitle}>
        Gerencie seus eventos e visualize seus afiliados
      </p>

      <div className={styles.cardGrid}>
        <Link to="/eventos" className={styles.card}>
          <span>📅</span>
          <strong>Eventos e Reuniões</strong>
          <p>Crie e gerencie os seus eventos</p>
        </Link>

        <Link to="/afiliados" className={styles.card}>
          <span>👥</span>
          <strong>Produtores Afiliados</strong>
          <p>Veja quem são seus afiliados</p>
        </Link>

        <Link to="/relatorios-sindicato" className={styles.card}>
          <span>📈</span>
          <strong>Relatórios</strong>
          <p>Acompanhe participação e engajamento em eventos</p>
        </Link>
      </div>
    </div>
  );
}
