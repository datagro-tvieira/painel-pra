import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";
import { CultureProvider } from "@/contexts/culture-context";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { config } from "./utils/config";



import {Layout} from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import { RelatoriosPage } from "./routes/relatorios/page";
import { CalculoPage } from "./routes/calculo/page";
import { MonitoramentoPage } from "./routes/monitoramento/page";
import { DashboardRealTime } from "./routes/telas/dashboardRealTime";
import { DistribuicaoPage } from "./routes/distribuicao/page";
import { DashboardQts } from "./routes/telas/dashboardQts";
import Login from "./routes/login/login";
import { Ativos } from "./routes/telas/ativos";
import { AuthGuard } from "@/components/authGuard";
import { Carousel } from "./routes/telas/carousel";
import ResumosPage from "./routes/resumos/page";
import BoiDashboardPage from '@/pages/dashboard/boi';
import MilhoDashboardPage from '@/pages/dashboard/milho';
import LeiteDashboardPage from '@/pages/dashboard/leite';
import EtanolDashboardPage from '@/pages/dashboard/etanol';
function App() {
    const msalInstance = new PublicClientApplication(config);

    msalInstance.handleRedirectPromise().catch(console.error);
const router = createBrowserRouter(
  [
    {
      path: "/",
      // element: <AuthGuard />,
      children: [
        {
          path: "",
          element: <Layout />,
          children: [
            // { index: true, element: <DashboardPage /> },
            { index: true, element: <ResumosPage /> },
            { path: "dashboards", element: <Carousel /> },
            { path: "relatorios", element: <RelatoriosPage /> },
            { path: "resumo", element: <DashboardPage /> },
            { path: "calculos", element: <CalculoPage /> },
            { path: "monitoramento", element: <MonitoramentoPage /> },
            { path: "realtime", element: <DashboardRealTime /> },
            { path: "distribuicao", element: <DistribuicaoPage /> },
            { path: "quantidades", element: <DashboardQts /> },
            { path: "ativos", element: <Ativos /> },
            { path: "dashboard/boi", element: <BoiDashboardPage /> },
            { path: "dashboard/milho", element: <MilhoDashboardPage /> },
            { path: "dashboard/leite", element: <LeiteDashboardPage /> },
            { path: "dashboard/etanol", element: <EtanolDashboardPage /> },
            { path: "inventory", element: <h1 className="title">Inventory</h1> },
            { path: "settings", element: <h1 className="title">Settings</h1> },
            { path: "resumos", element: <ResumosPage /> },
          ]
        }
      ]
    },
    {
      path: "/login",
      element: <Login />,
    },
   
  ],
  { basename: "/backofficev2" }
);

    return (
        <MsalProvider instance={msalInstance}>
        <CultureProvider>
        <ThemeProvider theme="dark">
            <RouterProvider router={router} />
        </ThemeProvider>
        </CultureProvider>
        </MsalProvider>
    );
}

export default App;