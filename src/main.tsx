import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import Campanha50Porcento from "./pages/Campanha50Porcento.tsx";
import "./index.css"; // Ou App.css, dependendo da estrutura anterior
import { SimulacaoProvider } from "./context/SimulacaoContext.tsx";
import "./i18n/i18n.ts"; // Initialize i18n

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SimulacaoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/campanha-50-porcento" element={<Campanha50Porcento />} />
        </Routes>
      </BrowserRouter>
    </SimulacaoProvider>
  </React.StrictMode>
);
