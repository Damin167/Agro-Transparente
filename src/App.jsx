import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AppRoutes from "./routes";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = [
    "/login",
    "/register",
    "/cadastro-dados-produtor",
    "/cadastro-dados-sindicato",
  ].includes(location.pathname);

  return (
    <div className="app-container">
      {!isAuthPage && <Header />}
      <main>{children}</main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default AppWrapper;
