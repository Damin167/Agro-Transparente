import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./Pesquisa.module.css";
import Loading from "../../components/Loading";

export default function Pesquisa() {
  const [producoes, setProducoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [campoFiltro, setCampoFiltro] = useState("tipo");
  const [favoritos, setFavoritos] = useState(new Set());
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);

      const {
        data: { user },
        error: errUser,
      } = await supabase.auth.getUser();
      if (errUser || !user) {
        console.error("Usuário não autenticado");
        setUserId(null);
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data: producoesData, error: errProducoes } = await supabase
        .from("producoes")
        .select("*");
      if (errProducoes) {
        console.error(errProducoes);
        setLoading(false);
        return;
      }
      setProducoes(producoesData);

      const { data: favData, error: errFav } = await supabase
        .from("favoritos")
        .select("producao_id")
        .eq("usuario_id", user.id);

      if (errFav) {
        console.error(errFav);
        setLoading(false);
        return;
      }

      setFavoritos(new Set(favData.map((f) => f.producao_id)));

      setLoading(false);
    }

    carregarDados();
  }, []);

  async function toggleFavorito(producaoId) {
    if (!userId) {
      alert("Você precisa estar logado para favoritar.");
      return;
    }

    const isFavorito = favoritos.has(producaoId);
    setFavoritos((prev) => {
      const novo = new Set(prev);
      if (isFavorito) novo.delete(producaoId);
      else novo.add(producaoId);
      return novo;
    });

    if (isFavorito) {
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("usuario_id", userId)
        .eq("producao_id", producaoId);
      if (error) {
        console.error("Erro ao remover favorito:", error);
        // Reverter alteração local
        setFavoritos((prev) => {
          const novo = new Set(prev);
          novo.add(producaoId);
          return novo;
        });
      }
    } else {
      const { error } = await supabase.from("favoritos").insert([
        {
          usuario_id: userId,
          producao_id: producaoId,
        },
      ]);
      if (error) {
        console.error("Erro ao adicionar favorito:", error);
        setFavoritos((prev) => {
          const novo = new Set(prev);
          novo.delete(producaoId);
          return novo;
        });
      }
    }
  }

  const producoesFiltradas = producoes.filter((p) => {
    if (campoFiltro === "favoritos") {
      return favoritos.has(p.id);
    }

    if (!busca.trim()) return false;
    const valorCampo = p[campoFiltro]?.toLowerCase() || "";
    return valorCampo.includes(busca.toLowerCase());
  });

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <h2>🔍 Pesquisa de Produções</h2>

      <div className={styles.barraBusca}>
        {campoFiltro !== "favoritos" && (
          <input
            type="text"
            placeholder={`Buscar por ${campoFiltro}`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.inputBusca}
          />
        )}

        <select
          value={campoFiltro}
          onChange={(e) => {
            setCampoFiltro(e.target.value);
            setBusca("");
          }}
          className={styles.selectFiltro}
        >
          <option value="tipo">Tipo</option>
          <option value="cidade">Cidade</option>
          <option value="estado">Estado</option>
          <option value="sazonalidade">Sazonalidade</option>
          <option value="favoritos">⭐ Favoritos</option>
        </select>
      </div>

      <div className={styles.cardGrid}>
        {campoFiltro !== "favoritos" && busca && producoesFiltradas.length === 0 ? (
          <p>Nenhuma produção encontrada.</p>
        ) : producoesFiltradas.length === 0 && campoFiltro === "favoritos" ? (
          <p>Nenhum favorito marcado ainda.</p>
        ) : (
          producoesFiltradas.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{p.tipo}</h3>
                <button
                  className={styles.favorito}
                  onClick={() => toggleFavorito(p.id)}
                  aria-label={favoritos.has(p.id) ? "Remover favorito" : "Adicionar favorito"}
                >
                  {favoritos.has(p.id) ? "⭐" : "☆"}
                </button>
              </div>
              <p>📍 {p.cidade}, {p.estado}</p>
              <p>🌱 Sazonalidade: {p.sazonalidade}</p>
              <p>📦 Plantado: {p.volume_plantado} {p.unidade_plantado}</p>
              <p>🚜 Colhido: {p.volume_colhido} {p.unidade_colhido}</p>
              <p>📅 Plantio: {p.data_plantio}</p>
              <p>📅 Colheita: {p.data_colheita}</p>
              {p.observacoes && <p>📝 {p.observacoes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
