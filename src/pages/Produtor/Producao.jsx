import { useState, useEffect } from "react";
import {
  buscarProducoesDoUsuario,
  adicionarProducao,
  atualizarProducao,
  excluirProducao,
} from "../../services/producaoService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Producao.module.css";
import Loading from "../../components/Loading";

const iconePadrao = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Producao() {
  const [dadosProducao, setDadosProducao] = useState([]);
  const [novoItem, setNovoItem] = useState({
    tipo: "",
    volume_plantado: "",
    unidade_plantado: "",
    volume_colhido: "",
    unidade_colhido: "",
    sazonalidade: "",
    cidade: "",
    estado: "",
    latitude: "",
    longitude: "",
    data_plantio: "",
    data_colheita: "",
    observacoes: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [pontoSelecionado, setPontoSelecionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [carregando, setCarregando] = useState(true);



  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      const producoes = await buscarProducoesDoUsuario();
      setDadosProducao(producoes);
      setCarregando(false);
    }

    carregarDados();
  }, []);

  const handleChange = (e) => {
    setNovoItem({ ...novoItem, [e.target.name]: e.target.value });
  };

  const limparFormulario = () => {
    setNovoItem({
      tipo: "",
      volume_plantado: "",
      unidade_plantado: "",
      volume_colhido: "",
      unidade_colhido: "",
      sazonalidade: "",
      cidade: "",
      estado: "",
      latitude: "",
      longitude: "",
      data_plantio: "",
      data_colheita: "",
      observacoes: "",
    });
    setEditandoId(null);
  };

  const adicionarOuAtualizar = async () => {
    const dadosConvertidos = {
      ...novoItem,
      volume_plantado: parseFloat(novoItem.volume_plantado),
      volume_colhido: parseFloat(novoItem.volume_colhido),
      latitude: parseFloat(novoItem.latitude),
      longitude: parseFloat(novoItem.longitude),
    };

    if (editandoId) {
      const sucesso = await atualizarProducao(editandoId, dadosConvertidos);
      if (sucesso) {
        setDadosProducao((prev) =>
          prev.map((item) =>
            item.id === editandoId ? { ...item, ...dadosConvertidos } : item
          )
        );
        alert("Produção atualizada com sucesso!");
        limparFormulario();
        setMostrarFormulario(false);
      }
    } else {
      const nova = await adicionarProducao(dadosConvertidos);
      if (nova) {
        setDadosProducao((prev) => [...prev, nova]);
        alert("Produção cadastrada com sucesso!");
        limparFormulario();
        setMostrarFormulario(false);
      }
    }
  };


  const editarItem = (item) => {
    setNovoItem({ ...item });
    setEditandoId(item.id);
    setMostrarFormulario(true);
  };

  const excluirItemLocal = async (id) => {
    if (confirm("Deseja excluir esta produção?")) {
      const sucesso = await excluirProducao(id);
      if (sucesso) {
        setDadosProducao((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  const visualizarMapaIndividual = (item) => {
    if (item.latitude && item.longitude) {
      setPontoSelecionado({ nome: item.tipo, coordenadas: [item.latitude, item.longitude] });
      setMostrarMapa(true);
    } else {
      alert("Esta produção não possui coordenadas.");
    }
  };

  const visualizarTodasProducoes = () => {
    setPontoSelecionado(null);
    setMostrarMapa(true);
  };

  if (carregando) return <Loading />;

  return (
    <div className={styles.pagina}>
      <h2>🌾 Produções</h2>
      <p>Visualize, edite e adicione suas produções agrícolas</p>

      <table className={styles.tabelaProducao}>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Plantado</th>
            <th>Colhido</th>
            <th>Cidade</th>
            <th>Estado</th>
            <th>Plantio</th>
            <th>Colheita</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dadosProducao.map((item) => (
            <tr key={item.id}>
              <td>{item.tipo}</td>
              <td>{item.volume_plantado} {item.unidade_plantado}</td>
              <td>{item.volume_colhido} {item.unidade_colhido}</td>
              <td>{item.cidade}</td>
              <td>{item.estado}</td>
              <td>{item.data_plantio}</td>
              <td>{item.data_colheita}</td>
              <td className={styles.botoesAcoes}>
                <button onClick={() => editarItem(item)}>✏️</button>
                <button onClick={() => excluirItemLocal(item.id)}>🗑️</button>
                <button onClick={() => visualizarMapaIndividual(item)}>🌍</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.botoesTopo}>
        <button
          className={styles.botaoAbrirModal}
          onClick={() => {
            limparFormulario();
            setMostrarFormulario(true);
          }}
        >
          🌱 Nova Produção
        </button>

        <button className={styles.botaoAbrirModal} onClick={visualizarTodasProducoes}>
          🌎 Ver Todas no Mapa
        </button>
      </div>

      {mostrarFormulario && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalFormulario}>
            <div className={styles.modalCabecalho}>
              <h3>{editandoId ? "✏️ Editar Produção" : "🌱 Nova Produção"}</h3>
            </div>

            <div className={styles.formularioGrid}>
              <input name="tipo" value={novoItem.tipo} onChange={handleChange} placeholder="Tipo" />
              <input name="sazonalidade" value={novoItem.sazonalidade} onChange={handleChange} placeholder="Sazonalidade" />

              <input name="volume_plantado" value={novoItem.volume_plantado} onChange={handleChange} placeholder="Volume Plantado" />
              <select name="unidade_plantado" value={novoItem.unidade_plantado} onChange={handleChange}>
                <option value="" disabled>Unidade (Plantado)</option>
                <option value="kg">kg</option>
                <option value="toneladas">toneladas</option>
                <option value="sacas">sacas</option>
              </select>

              <input name="volume_colhido" value={novoItem.volume_colhido} onChange={handleChange} placeholder="Volume Colhido" />
              <select name="unidade_colhido" value={novoItem.unidade_colhido} onChange={handleChange}>
                <option value="" disabled>Unidade (Colhido)</option>
                <option value="kg">kg</option>
                <option value="toneladas">toneladas</option>
                <option value="sacas">sacas</option>
              </select>

              <input name="cidade" value={novoItem.cidade} onChange={handleChange} placeholder="Cidade" />
              <input name="estado" value={novoItem.estado} onChange={handleChange} placeholder="Estado" />
              <input name="latitude" value={novoItem.latitude} onChange={handleChange} placeholder="Latitude" />
              <input name="longitude" value={novoItem.longitude} onChange={handleChange} placeholder="Longitude" />

              <div className={styles.dataGroup}>
                <label>Plantio:</label>
                <input type="date" name="data_plantio" value={novoItem.data_plantio} onChange={handleChange} />
              </div>
              <div className={styles.dataGroup}>
                <label>Colheita:</label>
                <input type="date" name="data_colheita" value={novoItem.data_colheita} onChange={handleChange} />
              </div>

              <div className={styles.linhaFinal}>
                <input
                  name="observacoes"
                  value={novoItem.observacoes}
                  onChange={handleChange}
                  placeholder="Observações"
                  className={styles.inputObservacoes}
                />

                <button onClick={adicionarOuAtualizar} className={styles.botaoAdicionar}>
                  {editandoId ? "Salvar" : "Adicionar"}
                </button>

                <button
                  onClick={() => {
                    limparFormulario();
                    setMostrarFormulario(false);
                  }}
                  className={styles.botaoCancelar}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarMapa && (
        <MapContainer
          center={[-22.9, -47.1]}
          zoom={6}
          style={{ height: "400px", width: "100%", marginTop: "2rem" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />
          {pontoSelecionado ? (
            <Marker position={pontoSelecionado.coordenadas} icon={iconePadrao}>
              <Popup>{pontoSelecionado.nome}</Popup>
            </Marker>
          ) : (
            dadosProducao.map((item) =>
              item.latitude && item.longitude ? (
                <Marker
                  key={item.id}
                  position={[item.latitude, item.longitude]}
                  icon={iconePadrao}
                >
                  <Popup>
                    <strong>{item.tipo}</strong> <br />
                    {item.volume_colhido} {item.unidade_colhido} - {item.cidade},{" "}
                    {item.estado}
                  </Popup>
                </Marker>
              ) : null
            )
          )}
        </MapContainer>
      )}
    </div>
  );
}
