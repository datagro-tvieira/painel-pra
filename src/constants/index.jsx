import {FileChartColumnIncreasing, ChartColumn, Home, Calculator, Package, PackagePlus, Settings, ShoppingBag, LogOut, UserPlus, Monitor, List } from "lucide-react";

// import ProfileImage from "@/assets/profile-image.jpg";
// import 'ProductImage' from "@/assets/product-image.jpg";

export const navbarLinks = [
    {
        title: "Gerencial",
        links: [
            {
                label: "Home",
                icon: Home,
                path: "/",
            },
            {
                label: "Relatórios",
                icon: FileChartColumnIncreasing,
                path: "/relatorios",
            },
            {
                label: "Cálculo",
                icon: Calculator,
                path: "/calculos",
            },
        ],
    },
    {
        title: "Monitoramento",
        links: [
            {
            label: "Display",
            icon: Monitor,
            path: "/dashboards",
            },
            {
            label: "Consolidado",
            icon: ChartColumn,
            path: "/quantidades",
            },
            {
            label: "Resumo diário",
            icon: List,
            path: "/realtime",
            }
        ],
    },
    {
        title: "Logout",
        links: [
            {
                label: "Logout",
                icon: LogOut,
                path: "/login",
            },
        ],
    }
   
];
