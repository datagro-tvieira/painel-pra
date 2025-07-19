import { useIsAuthenticated } from "@azure/msal-react";
import { Navigate, Outlet } from "react-router-dom";

export const AuthGuard = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    // Não autenticado? Redireciona para /login
    return <Navigate to="/login" replace />;
  }

  // Autenticado? Deixa renderizar filhos
  return <Outlet />;
};
