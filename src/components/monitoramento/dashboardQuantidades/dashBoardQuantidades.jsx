import React, { useEffect, useRef, useState } from "react";
import anychart from "anychart";
import e from "../../../assets/ejbs.png";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';


// Mapeia imagens conhecidas
const imagesMap = {
  "JBS": e,
  "Minerva Foods": e,
  "Frialto": e,
  "Marfrig": e,
  "Prima": e,
  "Plena": e,
  "Zanchetta": e,
  "BarraMansa": e,
  "Nutripura": e,
  "FrigoSul": e,
  "Cooperfrigo": e,
  "MasterBoi": e,
  "Astra": e,
  "Better Beef": e,
  "FrigoEstrela": e,
  "Frisa": e,
  "Frigol": e,
  "Naturafrig": e,
};

// Fallback image
const defaultImage = e;

const formatValorLabel = (cabecas) => {
  const valor = parseFloat(cabecas);
  if (valor >= 1_000_000_000) return `${(valor / 1_000_000_000).toFixed(2)} bi Cabs`;
  if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(2)} mi Cabs`;
  if (valor >= 1_000) return `${(valor / 1_000).toFixed(0)} mil Cabs`;
  return `${valor}`;
};

const formatValorLabelChart = (cabecas) => {
  const valor = parseFloat(cabecas);
  if (valor >= 1_000_000_000) return `${(valor / 1_000_000_000).toFixed(2)} bi`;
  if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(2)} mi`;
  if (valor >= 1_000) return `${(valor / 1_000).toFixed(0)} mil`;
  return `${valor}`;
};

const formatMoney = (valor) => {
  const num = parseFloat(valor);
  if (num >= 1_000_000_000) return `R$ ${(num / 1_000_000_000).toFixed(2)} bi`;
  if (num >= 1_000_000) return `R$ ${(num / 1_000_000).toFixed(2)} mi`;
  if (num >= 1_000) return `R$ ${(num / 1_000).toFixed(0)} mil`;
  return `R$ ${num}`;
};

const Card = ({ item }) => {
  const [logo, setLogo] = useState(null);

  const values = [
    item.cabecasAnterior2,
    item.cabecasAnterior,
    item.cabecasAtual
  ].filter(v => v != null && v !== undefined && v !== "" && v !== 0);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        if (item.logo?.startsWith("data:image")) {
          setLogo(item.logo);
          return;
        }

        if (item.logo) {
          const response = await fetch(`https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/logo?acao=logo&img=${item.logo}`);
          if (!response.ok) throw new Error("Failed to fetch logo");

          const base64 = await response.text();
          setLogo(base64);
        } else {
          setLogo(defaultImage);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
        setLogo(defaultImage);
      }
    };

    fetchLogo();
  }, [item.logo]);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const chartData = [
    { name: new Date().getFullYear() - 2, value: item.cabecasAnterior2 / range },
    { name: new Date().getFullYear() - 1, value: item.cabecasAnterior / range },
    { name: new Date().getFullYear(), value: item.cabecasAtual / range },
  ];

  return (
    <div
      className="
        rounded-2xl shadow-lg
        p-3
        flex flex-col
        bg-[#1A1F1A] text-[#F5F5DC]
        w-xl
        mx-auto
        border border-gray-800
      "
    >
      {/* Logo */}
      <div
        className="
          bg-white rounded-xl
          flex items-center justify-center
          p-3 mb-3
          h-32 sm:h-36 md:h-30
          overflow-hidden
        "
      >
        <img
          src={logo}
          alt={item.name}
          className="h-full max-w-full object-contain"
        />
      </div>

      {/* Name */}
      <div className="text-center text-lg sm:text-xl font-semibold text-gray-200 mb-2">
        {item.name}
      </div>

      {/* Current year value */}
      <div className="rounded-lg px-3 py-2 text-center mb-2">
        <p className="text-yellow-400 text-xs sm:text-sm font-medium">
          {new Date().getFullYear()}
        </p>
        <p className="text-2xl sm:text-2xl font-bold text-green-400 truncate">
          {item.valorLabel}
        </p>
        <p className="text-xs sm:text-sm text-gray-400">
          {new Date().getFullYear() - 1}: {formatValorLabel(item.cabecasAnterior)}
        </p>
      </div>

      {/* Mini line chart */}
      <div className="rounded-lg p-1 mb-2">
        <ResponsiveContainer width="100%" height={30}>
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4ade80"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Values */}
      <div className="flex flex-col items-center text-xs sm:text-sm">
        <div className="text-green-400">
          2025: {item.valorAtual}
        </div>
        <div className="text-red-400">
          2024: {item.valorAnterior}
        </div>
      </div>
    </div>
  );
};

export const DashboardFrigorificos = () => {
  const [cardsData, setCardsData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/industrias/resultados?obter=negocios");
        if (!response.ok) throw new Error("Network response was not ok");

        const rawData = await response.json();

        const formatted = Object.entries(rawData).map(([name, values]) => ({
          name,
          valorLabel: formatValorLabel(values?.[new Date().getFullYear()]?.cabecas || 0),
          valorAtual: formatMoney(values?.[new Date().getFullYear()]?.valor || 0),
          valorAnterior: formatMoney(values?.[new Date().getFullYear() - 1]?.valor || 0),
          valorAnterior2: formatMoney(values?.[new Date().getFullYear() - 2]?.valor || 0),
          cabecasAtual: values?.[new Date().getFullYear()]?.cabecas || 0,
          cabecasAnterior: values?.[new Date().getFullYear() - 1]?.cabecas || 0,
          cabecasAnterior2: values?.[new Date().getFullYear() - 2]?.cabecas || 0,
          logo: values?.logo || null,
          cabecas: parseFloat(values?.[new Date().getFullYear()]?.cabecas || 0),
          valor: parseFloat(values?.[new Date().getFullYear()]?.valor || 0),
        }));

        setCardsData(formatted);
      } catch (error) {
        console.error("Fetch error:", error);
        setCardsData([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!cardsData || cardsData.length === 0) return;

    const chart = anychart.column();
    const chartData = cardsData.map((item) => [item.name, item.cabecas]);

    chart.data(chartData);

    const logScale = anychart.scales.log();
    chart.yScale(logScale);
    chart.title(`Quantidade de Cabeças por Frigorífico ${new Date().getFullYear()}`);
    chart.barGroupsPadding(0.3);
    chart.tooltip(false);
    chart.labels(true);
    chart.labels().fontColor("white").fontSize(14).fontWeight("bold").position("top").anchor("top").format(function() {
      return formatValorLabelChart(this.getData("value"));
    });
    chart.background().fill("#1A1F1A");
    chart.xAxis().labels().fontSize(12).fontColor("#F5F5DC").rotation(-45).hAlign("right").padding(5);
    chart.yAxis().labels().fontColor("#F5F5DC");
    chart.palette(["#FFD700"]);
    chart.container(chartRef.current);
    chart.draw();

    return () => chart.dispose();
  }, [cardsData]);

  return (
    <div style={{ backgroundColor: "#2A3529", minHeight: "100vh" }} className="p-4">
      {cardsData.length > 0 && (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={15}
          slidesPerView={7}
          loop
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            1600: { slidesPerView: 7, spaceBetween: 15 },
            1200: { slidesPerView: 5, spaceBetween: 12 },
            800: { slidesPerView: 3, spaceBetween: 10 },
            500: { slidesPerView: 2, spaceBetween: 8 },
            0: { slidesPerView: 1, spaceBetween: 5 },
          }}
          className="mb-6 px-2"
        >
          {cardsData.map((item, index) => (
            <SwiperSlide
              key={index}
              className="flex items-center justify-center p-2"
            >
              <Card item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <div className="rounded-xl p-4 mt-8" style={{ backgroundColor: "#1A1F1A" }}>
        <div ref={chartRef} style={{ height: "500px", width: "100%" }} className="h-full"/>
      </div>
    </div>
  );
};
