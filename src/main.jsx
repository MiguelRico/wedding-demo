import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/fonts.css";
import "./index.css";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

async function startApplication() {
  if (import.meta.env.VITE_IMPORT_DATA_ON_START === "true") {
    try {
      await fetch("/api/admin/seed", { method: "POST" });
    } catch (error) {
      console.error("No se pudieron importar los datos iniciales:", error);
    }
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}

startApplication();
