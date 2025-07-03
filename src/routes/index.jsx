import { Routes, Route, Navigate } from "react-router-dom";
import HomeProdutor from "../pages/Produtor/HomeProdutor";
import HomeSindicato from "../pages/Sindicato/HomeSindicato";
import Producao from "../pages/Produtor/Producao";
import CadastroSindicato from "../pages/Sindicato/CadastroSindicato";
import CadastroProdutor from "../pages/Produtor/CadastroProdutor";
import Pesquisa from "../pages/Produtor/Pesquisa";
import Relatorios from "../pages/Relatorios/Relatorios";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import PerfilProdutor from "../pages/Produtor/Pefil";
import PerfilSindicato from "../pages/Sindicato/PerfilSindicato";
import EventosSindicato from "../pages/Sindicato/Eventos";
import Afiliados from "../pages/Sindicato/Afiliados";
import RelatoriosSindicato from "../pages/Sindicato/RelatoriosSindicato";
import PesquisaSindicato from "../pages/Produtor/PesquisaSindicato";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      {/* 👨‍🌾 Produtor */}
      <Route path="/home-produtor" element={<HomeProdutor />} />
      <Route path="/producao" element={<Producao />} />
      <Route path="/pesquisa" element={<Pesquisa />} />
      <Route path="/pesquisa-sindicatos" element={<PesquisaSindicato />} />
      <Route path="/perfil-produtor" element={<PerfilProdutor />} />
      <Route path="/relatorios-produtor" element={<Relatorios />} />

      {/* 🏢 Sindicato */}
      <Route path="/home-sindicato" element={<HomeSindicato />} />
      <Route path="/perfil-sindicato" element={<PerfilSindicato />} />
      <Route path="/eventos" element={<EventosSindicato />} />
      <Route path="/afiliados" element={<Afiliados />} />
      <Route path="/relatorios-sindicato" element={<RelatoriosSindicato />} />

      {/* 🚧 Telas de cadastro de dados iniciais */}
      <Route path="/cadastro-dados-produtor" element={<CadastroProdutor />} />
      <Route path="/cadastro-dados-sindicato" element={<CadastroSindicato />} />
    </Routes>
  );
}
