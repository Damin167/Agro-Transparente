import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./Relatorios.module.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Loading from "../../components/Loading";

export default function Relatorios() {
  const [dados, setDados] = useState([]);
  const [anoSelecionado, setAnoSelecionado] = useState("todos");
  const [carregando, setCarregando] = useState(true);

  const cores = ["#4caf50", "#2196f3", "#ff9800", "#e91e63", "#9c27b0", "#795548"];

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("producoes")
        .select("*")
        .eq("usuario_id", user.id);

      if (!error && data) {
        setDados(data);
      }
      setCarregando(false);
    }

    carregarDados();
  }, []);

  const dadosFiltrados = dados.filter((item) => {
    if (anoSelecionado === "todos") return true;
    return item.data_colheita?.startsWith(anoSelecionado);
  });

  const anos = [
    ...new Set(dados.map((d) => d.data_colheita?.slice(0, 4)).filter(Boolean)),
  ];

  const tiposUnicos = Array.from(
    new Set(dadosFiltrados.map((item) => item.tipo).filter(Boolean))
  );

  const agrupadosLinha = {};
  dadosFiltrados.forEach((item) => {
    const mes = item.data_colheita?.slice(0, 7);
    const tipo = item.tipo || "Desconhecido";
    const volume = Number(item.volume_colhido || 0);
    if (!mes) return;
    if (!agrupadosLinha[mes]) agrupadosLinha[mes] = {};
    if (!agrupadosLinha[mes][tipo]) agrupadosLinha[mes][tipo] = 0;
    agrupadosLinha[mes][tipo] += volume;
  });

  const dadosGraficoLinha = Object.entries(agrupadosLinha)
    .map(([mes, tipos]) => ({ mes, ...tipos }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  const dadosBarras = tiposUnicos.map((tipo) => {
    const registros = dadosFiltrados.filter((d) => d.tipo === tipo);
    const total = registros.reduce((sum, d) => sum + Number(d.volume_colhido || 0), 0);

    const detalhes = {};
    registros.forEach((d) => {
      const chave = anoSelecionado === "todos"
        ? d.data_colheita?.slice(0, 4)
        : d.data_colheita?.slice(5, 7); // mês
      if (!chave) return;
      detalhes[chave] = (detalhes[chave] || 0) + Number(d.volume_colhido || 0);
    });

    return {
      tipo,
      volume: total,
      detalhes,
    };
  });

  const totalColhidoGeral = dadosBarras.reduce((sum, d) => sum + d.volume, 0);
  const dadosPizza = dadosBarras.map((d) => ({
    ...d,
    percentual: ((d.volume / totalColhidoGeral) * 100).toFixed(1),
  }));

  const exportarCSV = () => {
    let csvData = [];

    if (anoSelecionado === "todos") {
      const agrupadoPorAno = {};

      dadosFiltrados.forEach((item) => {
        const Ano = item.data_colheita?.slice(0, 4);
        const Tipo = item.tipo || "Desconhecido";
        const Volume = Number(item.volume_colhido || 0);

        if (!Ano) return;

        const chave = `${Tipo}_${Ano}`;
        if (!agrupadoPorAno[chave]) {
          agrupadoPorAno[chave] = {
            Tipo,
            Ano,
            Volume: 0,
          };
        }

        agrupadoPorAno[chave].Volume += Volume;
      });

      csvData = Object.values(agrupadoPorAno);
    } else {
      csvData = dadosFiltrados.map((item) => ({
        Tipo: item.tipo || "Desconhecido",
        Mês: item.data_colheita?.slice(0, 7),
        Volume: Number(item.volume_colhido || 0),
      }));
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "relatorio_producao.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = async () => {
    const input = document.getElementById("grafico");
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.text("Relatório de Produção", 14, 15);
    pdf.addImage(imgData, "PNG", 10, 25, pdfWidth, pdfHeight > 250 ? 190 : pdfHeight);
    pdf.save("relatorio_producao.pdf");
  };

  const renderTooltipDetalhado = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const linhas = Object.entries(data.detalhes).map(
        ([key, val]) => `${anoSelecionado === "todos" ? "Ano" : "Mês"} ${key}: ${val}`
      );
      return (
        <div style={{ background: "#fff", border: "1px solid #ccc", padding: 10 }}>
          <strong>{data.tipo}</strong>
          <br />
          Total: {data.volume}
          <br />
          {linhas.map((linha, idx) => (
            <div key={idx}>{linha}</div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`pagina ${styles.container}`}>
      <h2>📊 Relatórios de Produção</h2>

      <div className={styles.filtros}>
        <div className={styles.filtroEsquerda}>
          <label>Filtrar por ano:</label>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(e.target.value)}
          >
            <option value="todos">Todos</option>
            {anos.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.botoesDireita}>
          <button onClick={exportarCSV}>📥 Exportar CSV</button>
          <button onClick={exportarPDF}>🖨️ Exportar PDF</button>
        </div>
      </div>

      {carregando ? (
        <Loading />
      ) : dadosFiltrados.length === 0 ? (
        <p>Nenhuma produção encontrada para o período.</p>
      ) : (
        <div id="grafico" className={styles.graficosContainer}>
          <div className={styles.graficoWrapper}>
            <h3>📈 Gráfico de Linha</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosGraficoLinha}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                {tiposUnicos.map((tipo, index) => (
                  <Line
                    key={tipo}
                    type="monotone"
                    dataKey={tipo}
                    stroke={cores[index % cores.length]}
                    name={tipo}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.graficoWrapper}>
            <h3>📊 Gráfico de Barras</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={dadosBarras}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={30}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip content={renderTooltipDetalhado} />
                <Legend />
                <Bar dataKey="volume" name="Volume Colhido">
                  {dadosBarras.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.graficoWrapper}>
            <h3>🍕 Gráfico de Pizza</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  dataKey="volume"
                  nameKey="tipo"
                  outerRadius={100}
                  label={({ name, percentual }) => `${name} (${percentual}%)`}
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltipDetalhado} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
