import { BrowserRouter } from "react-router-dom";
import { UsuarioActualProvider } from "./context/UsuarioActualContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AccessibilityProvider } from "./context/AccessibilityContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <UsuarioActualProvider>
            <AppRoutes />
          </UsuarioActualProvider>
        </BrowserRouter>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
