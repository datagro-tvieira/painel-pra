import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";
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
            { index: true, element: <DashboardRealTime /> },
            { path: "dashboards", element: <Carousel /> },
            { path: "relatorios", element: <RelatoriosPage /> },
            { path: "resumo", element: <DashboardPage /> },
            { path: "calculos", element: <CalculoPage /> },
            { path: "monitoramento", element: <MonitoramentoPage /> },
            { path: "realtime", element: <DashboardRealTime /> },
            { path: "distribuicao", element: <DistribuicaoPage /> },
            { path: "quantidades", element: <DashboardQts /> },
            { path: "ativos", element: <Ativos /> },
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

        <ThemeProvider theme="dark">
            <RouterProvider router={router} />
        </ThemeProvider>
        </MsalProvider>
    );
}

export default App;