import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./PesquisaSindicato.module.css";
import Loading from "../../components/Loading";

export default function PesquisaSindicato() {
  const [sindicatos, setSindicatos] = useState([]);
  const [afiliacoes, setAfiliacoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [modalEventos, setModalEventos] = useState(false);
  const [inscricoes, setInscricoes] = useState([]);
  const [sindicatoSelecionado, setSindicatoSelecionado] = useState(null);

  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: produtor, error: erroProdutor } = await supabase
        .from("produtores")
        .select("id")
        .eq("usuario_id", user.id)
        .single();

      if (erroProdutor || !produtor) {
        alert("Erro ao identificar produtor.");
        setCarregando(false);
        return;
      }

      setUsuarioId(produtor.id);

      const [sindRes, afilRes] = await Promise.all([
        supabase.from("sindicatos").select("*"),
        supabase
          .from("afiliacoes")
          .select("sindicato_id")
          .eq("produtor_id", produtor.id),
      ]);

      if (sindRes.error || afilRes.error) {
        alert("Erro ao carregar sindicatos ou afiliações");
        return;
      }

      setSindicatos(sindRes.data);
      setAfiliacoes(afilRes.data.map((a) => a.sindicato_id));
      setCarregando(false);
    }

    carregarDados();
  }, []);

  const filtrarSindicatos = busca.trim()
  ? sindicatos.filter((s) =>
      s.nome.toLowerCase().includes(busca.toLowerCase()) ||
      s.cidade?.toLowerCase().includes(busca.toLowerCase()) ||
      s.estado?.toLowerCase().includes(busca.toLowerCase())
    )
  : sindicatos.filter((s) => afiliacoes.includes(s.id));

  const afiliar = async (sindicato_id) => {
    const { error } = await supabase.from("afiliacoes").insert([
      { produtor_id: usuarioId, sindicato_id }
    ]);

    if (error) {
      alert("Erro ao se afiliar.");
      console.error(error);
    } else {
      alert("Afiliado com sucesso!");
      setAfiliacoes([...afiliacoes, sindicato_id]);
    }
  };

  const cancelarAfiliacao = async (sindicato_id) => {
    const { error } = await supabase
      .from("afiliacoes")
      .delete()
      .eq("produtor_id", usuarioId)
      .eq("sindicato_id", sindicato_id);

    if (error) {
      alert("Erro ao cancelar afiliação.");
    } else {
      alert("Afiliação cancelada.");
      setAfiliacoes(afiliacoes.filter((id) => id !== sindicato_id));
    }
  };

  const verEventos = async (sindicato_id) => {
    setCarregando(true);
    setSindicatoSelecionado(sindicato_id);

    const [evRes, inscRes] = await Promise.all([
      supabase
        .from("eventos")
        .select("*")
        .eq("sindicato_id", sindicato_id)
        .order("data_inicio", { ascending: true }),
      supabase
        .from("participacoes_eventos")
        .select("evento_id")
        .eq("produtor_id", usuarioId)
    ]);

    if (evRes.error || inscRes.error) {
      alert("Erro ao carregar eventos ou inscrições.");
      setCarregando(false);
      return;
    }

    setEventos(evRes.data);
    setInscricoes(inscRes.data.map((i) => i.evento_id));
    setModalEventos(true);
    setCarregando(false);
  };

  const inscreverNoEvento = async (evento_id) => {
    const { error } = await supabase
      .from("participacoes_eventos")
      .insert([{ produtor_id: usuarioId, evento_id }]);

    if (error) {
      if (error.code === "23505") {
        alert("Você já está inscrito neste evento.");
      } else {
        alert("Erro ao se inscrever.");
        console.error(error);
      }
      return;
    }

    alert("Inscrição realizada com sucesso!");
    setInscricoes([...inscricoes, evento_id]);
  };

  const cancelarInscricao = async (evento_id) => {
    const { error } = await supabase
      .from("participacoes_eventos")
      .delete()
      .eq("produtor_id", usuarioId)
      .eq("evento_id", evento_id);

    if (error) {
      alert("Erro ao cancelar inscrição.");
    } else {
      alert("Inscrição cancelada.");
      setInscricoes(inscricoes.filter((id) => id !== evento_id));
    }
  };

  if (carregando) return <Loading />;

  return (
    <div className={`pagina ${styles.container}`}>
      <h2>🔍 Pesquisar Sindicatos</h2>
      <input
        type="text"
        placeholder="Buscar por nome, cidade ou estado"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className={styles.inputBusca}
      />

      <div className={styles.cardGrid}>
        {filtrarSindicatos.length === 0 ? (
          <p>Nenhum sindicato encontrado.</p>
        ) : (
          filtrarSindicatos.map((s) => (
            <div key={s.id} className={styles.card}>
              <h3>{s.nome}</h3>
              <p>📍 {s.cidade} - {s.estado}</p>
              <div className={styles.botoes}>
                <button onClick={() => verEventos(s.id)}>📅 Ver Eventos</button>
                {afiliacoes.includes(s.id) ? (
                  <button onClick={() => cancelarAfiliacao(s.id)}>❌ Cancelar Afiliação</button>
                ) : (
                  <button onClick={() => afiliar(s.id)}>🤝 Afiliar-se</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {modalEventos && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>📅 Eventos Disponíveis</h3>
              <button
                className={styles.botaoFechar}
                onClick={() => setModalEventos(false)}
                aria-label="Fechar"
              >
                Fechar
              </button>
            </div>

            {eventos.length === 0 ? (
              <p>Nenhum evento encontrado.</p>
            ) : (
              <ul className={styles.listaEventosModal}>
                {eventos.map((ev) => (
                  <li key={ev.id} className={styles.eventoCardModal}>
                    <strong>{ev.titulo}</strong>
                    <br />
                     – De {ev.data_inicio} até {ev.data_fim}
                    <br />
                    📍 {ev.local}
                    <br />
                    {ev.descricao && <span>{ev.descricao}</span>}
                    <br />
                    {inscricoes.includes(ev.id) ? (
                      <button onClick={() => cancelarInscricao(ev.id)}>🚫 Cancelar Inscrição</button>
                    ) : (
                      <button onClick={() => inscreverNoEvento(ev.id)}>🎟️ Inscrever-se</button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
