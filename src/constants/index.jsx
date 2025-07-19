import {FileChartColumnIncreasing, ChartColumn, Home, Calculator, Package, PackagePlus, Settings, ShoppingBag, LogOut, UserPlus, Monitor } from "lucide-react";

// import ProfileImage from "@/assets/profile-image.jpg";
// import 'ProductImage' from "@/assets/product-image.jpg";

export const navbarLinks = [
    {
        title: "",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/",
            },
            {
                label: "Relatorios",
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
        title: "Views",
        links: [
            {
            label: "Monitoramento",
            icon: Monitor,
            path: "/dashboards",
            },
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
