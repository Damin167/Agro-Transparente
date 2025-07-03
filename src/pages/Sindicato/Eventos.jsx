import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./Eventos.module.css";
import Loading from "../../components/Loading";

export default function EventosSindicato() {
  const [eventos, setEventos] = useState([]);
  const [form, setForm] = useState({
    id: null,
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    local: "",
  });
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [participantes, setParticipantes] = useState([]);
  const [mostrarModalParticipantes, setMostrarModalParticipantes] = useState(false);

  useEffect(() => {
    fetchEventos();
  }, []);

  async function fetchEventos() {
    setCarregando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("sindicato_id", user.id)
      .order("data_inicio", { ascending: true });

    if (!error) setEventos(data);
    setCarregando(false);
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvarEvento = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const eventoData = {
      titulo: form.titulo,
      descricao: form.descricao,
      data_inicio: form.data_inicio,
      data_fim: form.data_fim,
      local: form.local,
      sindicato_id: user.id,
    };

    if (form.id) {
      const { error } = await supabase
        .from("eventos")
        .update(eventoData)
        .eq("id", form.id);

      if (error) {
        alert("Erro ao atualizar evento");
        console.error(error);
        return;
      }

      alert("Evento atualizado com sucesso!");
    } else {
      const { error } = await supabase.from("eventos").insert([eventoData]);

      if (error) {
        alert("Erro ao criar evento");
        console.error(error);
        return;
      }

      alert("Evento criado com sucesso!");
    }

    setForm({
      id: null,
      titulo: "",
      descricao: "",
      data_inicio: "",
      data_fim: "",
      local: "",
    });
    setMostrarFormulario(false);
    fetchEventos();
  };


  const editarEvento = (evento) => {
    const formatarData = (data) => {
      if (!data) return "";
      const d = new Date(data);
      return d.toISOString().slice(0, 16);
    };

    setForm({
      id: evento.id,
      titulo: evento.titulo,
      descricao: evento.descricao || "",
      data_inicio: formatarData(evento.data_inicio),
      data_fim: formatarData(evento.data_fim),
      local: evento.local,
    });

    setMostrarFormulario(true);
  };


  const verParticipantes = async (eventoId) => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("participacoes_eventos")
      .select(`
        produtor_id,
        produtores (
          nome, telefone, cidade
        )
      `)
      .eq("evento_id", eventoId);

    if (error) {
      alert("Erro ao carregar participantes");
      console.error(error);
      setCarregando(false);
      return;
    }

    setParticipantes(data || []);
    setMostrarModalParticipantes(true);
    setCarregando(false);
  };

  const excluirEvento = async (id) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este evento?");
    if (!confirmar) return;

    const { error } = await supabase.from("eventos").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir evento");
      console.error(error);
      return;
    }

    alert("Evento excluído com sucesso!");
    fetchEventos();
  };

  if (carregando) return <Loading />;

  return (
    <div className={`pagina ${styles.container}`}>
      <div className={styles.headerLinha}>
          <h2>📅 Eventos do Sindicato</h2>
          <button
            className={styles.botaoNovoEvento}
            onClick={() => {
              setMostrarFormulario(true);
              setForm({ id: null, titulo: "", descricao: "", data_inicio: "", data_fim: "", local: "" });
            }}
          >
            ➕ Novo Evento
          </button>
        </div>


        {mostrarFormulario && (
        <>
          <div className={styles.overlay} />
          <div className={styles.modalFormulario}>
            <h3>{form.id ? "Editar Evento" : "Novo Evento"}</h3>
            <br />

            <form className={styles.formulario} onSubmit={salvarEvento}>
              <input
                name="titulo"
                placeholder="Título"
                value={form.titulo}
                onChange={handleChange}
                required
              />
              <input
                name="descricao"
                placeholder="Descrição"
                value={form.descricao}
                onChange={handleChange}
              />
              <div className={styles.inputLinha}>
                <span>Início</span>
                <input
                  type="datetime-local"
                  name="data_inicio"
                  value={form.data_inicio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.inputLinha}>
                <span>Fim</span>
                <input
                  type="datetime-local"
                  name="data_fim"
                  value={form.data_fim}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                name="local"
                placeholder="Local"
                value={form.local}
                onChange={handleChange}
                required
              />
              <div className={styles.botoesFormulario}>
                <button type="button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                <button type="submit">Salvar Evento</button>
              </div>
            </form>
          </div>
        </>
      )}


      <div className={styles.listaEventos}>
        {eventos.length === 0 ? (
          <p>Nenhum evento cadastrado.</p>
        ) : (
          eventos.map((evento) => (
            <div key={evento.id} className={styles.eventoCard}>
              <h3>{evento.titulo}</h3>
              <br />
              <p>
                <strong>📍 Local:</strong> {evento.local}
              </p>
              <p>
                <strong>📅 Início:</strong> {evento.data_inicio}
                <br /> 
                <strong>📅 Fim:</strong> {evento.data_fim}
              </p>
              {evento.descricao && <p>{evento.descricao}</p>}

              <button onClick={() => editarEvento(evento)}>✏️ Editar</button>
              <button onClick={() => verParticipantes(evento.id)}>👥 Ver Participantes</button>
              <button
                style={{
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => excluirEvento(evento.id)}
              >
                🗑️ Excluir
              </button>
            </div>
          ))
        )}
      </div>

      {mostrarModalParticipantes && (
        <>
          <div className={styles.overlay} />
          <div className={styles.modal}>
            <h3>Participantes do Evento</h3>
            <button onClick={() => setMostrarModalParticipantes(false)}>Fechar</button>
            {participantes.length === 0 ? (
              <p>Nenhum participante inscrito.</p>
            ) : (
              <ul>
                {participantes.map((p) => (
                  <li key={p.produtor_id}>
                    {p.produtores.nome} - {p.produtores.cidade} - {p.produtores.telefone}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
