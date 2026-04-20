import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// monta o app no elemento root do index.html
createRoot(document.getElementById("root")!).render(<App />);
