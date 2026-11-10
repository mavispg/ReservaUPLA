import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import AmbientesPage from "../pages/AmbientesPage.jsx";
import ComponentesPage from "../pages/ComponentesPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import DetalleReservaPage from "../pages/DetalleReservaPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ReservasPage from "../pages/ReservasPage.jsx";
import UsuariosPage from "../pages/UsuariosPage.jsx";
import RutaProtegida from "./RutaProtegida.jsx";

/**
 * Rutas de la SPA. /login es pública; el resto comparte el layout privado.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RutaProtegida />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="reservas" element={<ReservasPage />} />
          <Route path="reservas/nueva" element={<Navigate to="/reservas?nueva=true" replace />} />
          <Route path="reservas/:id" element={<DetalleReservaPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="ambientes" element={<AmbientesPage />} />
          <Route path="componentes" element={<ComponentesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
