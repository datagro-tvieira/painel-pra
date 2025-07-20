import React, { useEffect, useState, useRef } from 'react';
import { GraficoDeBarras } from "../graficos/graficoDeBarras";
import { GraficoDePizza } from "../graficos/graficoDePizza";
import { GraficoDeColunas } from "../graficos/graficoDeColunas";
import { GraficoDeGauge } from "../graficos/graficoDeGauge";
import { RelogioCard } from "./clock.jsx";
import dlogo from "../../../assets/datagro-logo.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';

const DashBoardRelTime = () => {
  const [dashboardData, setDashboardData] = useState({ info: {}, arquivos: [] });
  const [gaugeChartData, setGaugeChartData] = useState([]); // Array para os valores
  const [gaugeChartOptions, setGaugeChartOptions] = useState({});
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [columnChartData, setColumnChartData] = useState([]);
  const dataSet = useRef({ data: () => { } });

  const fetchData = async () => {
    try {
      const [calculoDados, arquivosDados, negociosDados] = await Promise.all([
        fetch('https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/calculo?obter=dados').then(res => res.json()),
        fetch('https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/realtime?obter=arquivo').then(res => res.json()),
        fetch('https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/realtime?obter=negocios-hoje').then(res => res.json())
      ]);

      const datahoraDados = Object.keys(calculoDados.resultados);
      const datahoraDadosOntem = Object.keys(calculoDados.ontem.resultado || {}); // Garante que é um objeto

      let totalFiles = 0;
      let totalHeads = 0;
      let totalToken = 0;
      let currentValue = 0;
      let totalFilesYesterday = 0;
      let totalHeadsYesterday = 0;
      let currentValueYesterday = 0;

      if (datahoraDados.length > 0) {
        const latestDataKey = datahoraDados[datahoraDados.length - 1]; // Pega a última chave
        const latestData = calculoDados.resultados[latestDataKey];

        totalFiles = latestData.arquivos ?? 0;
        totalHeads = latestData.cabecas ?? 0;
        currentValue = latestData.total ?? 0;
        totalToken = latestData.tokens ?? 0;
      }

      if (datahoraDadosOntem.length > 0) {
        const latestDataYesterdayKey = datahoraDadosOntem[datahoraDadosOntem.length - 1]; // Pega a última chave de ontem
        const yesterdayData = calculoDados.ontem.resultado[latestDataYesterdayKey];
        totalFilesYesterday = yesterdayData.arquivos ?? 0;
        totalHeadsYesterday = yesterdayData.cabecas ?? 0;
        currentValueYesterday = yesterdayData.total ?? 0;
      }

      setDashboardData(prev => ({
        ...prev,
        info: { totalFiles, totalHeads, currentValue, totalToken }
      }));

      // Os dados para o gauge devem ser um array com os valores para cada tank
      setGaugeChartData([totalFiles, totalHeads, currentValue]);

      // Encontra o valor máximo para dimensionar o gauge
      const maxGaugeValue = Math.max(totalFiles, totalHeads, currentValue, totalFilesYesterday, totalHeadsYesterday, currentValueYesterday, 100); // Garante um mínimo de 100

      setGaugeChartOptions({
        scales: [
          { maxValue: totalFilesYesterday, offset: '-5%' },   // Escala para Arquivos
          { maxValue: totalHeadsYesterday, offset: '15%' },  // Escala para Cabeças
          { maxValue: currentValueYesterday, offset: '33%' }   // Escala para Total
        ],
        tanks: [
          { color: '#007BFF', offset: '-3%', width: '15%', name: 'Arquivos' }, // Tank para Arquivos
          { color: '#FFD700', offset: '18%', width: '15%', name: 'Cabeças' },   // Tank para Cabeças
          { color: '#C0C0C0', offset: '36%', width: '15%', name: 'Negócios' }    // Tank para Total
        ]
      });

      dataSet.current.data([totalFiles, totalHeads, currentValue]);

      const datahoraArquivos = Object.keys(arquivosDados.resultado);
      const datahoraNotificacao = arquivosDados.notificacao ? Object.keys(arquivosDados.notificacao) : [];

      if (datahoraArquivos.length > 0) {
        setDashboardData(prev => ({
          ...prev,
          arquivos: Object.values(arquivosDados.resultado)
        }));
      }

      if (negociosDados && negociosDados.retorno) { // Adicionado verificação para negociosDados.retorno
        const { cif, fob, boi, vaca, novilha, ufs } = negociosDados.retorno;

        setBarChartData([
          { x: 'CIF', value: cif },
          { x: 'FOB', value: fob }
        ]);

        setPieChartData([
          { x: 'Boi', value: boi },
          { x: 'Vaca', value: vaca },
          { x: 'Novilha', value: novilha }
        ]);

        setColumnChartData(
          Object.keys(ufs).map(key => ({
            x: key,
            value: ufs[key]
          }))
        );
      }

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
      console.log("Dados atualizados");
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container bg-background text-white min-h-full p-4">
      <div className="flex items-center justify-center mb-5">
        <h1 className="text-2xl font-bold mb-4 text-center">Resumo diário {new Date().toLocaleDateString('pt-BR')}</h1>
      </div>
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] p-4 rounded shadow-md text-center">
          <p className="text-lg">Total de Arquivos:</p>
          <h2 className="text-3xl text-text-bold-color font-bold">{dashboardData.info.totalFiles}</h2>
        </div>
        <div className="bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] p-4 rounded shadow-md text-center">
          <p className="text-lg">Total de Cabeças:</p>
          <h2 className="text-3xl text-text-bold-color font-bold">{dashboardData.info.totalHeads}</h2>
        </div>
        <div className="bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] p-4 rounded shadow-md text-center">
          <p className="text-lg">Consultas Token:</p>
          <h2 className="text-3xl text-text-bold-color font-bold">{dashboardData.info.totalToken}</h2>
        </div>
        <div className="bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] p-4 rounded shadow-md text-center">
          <p className="text-lg">Valor Total:</p>
          <h2 className="text-3xl text-text-bold-color font-bold">
            R$ {parseFloat(dashboardData.info.currentValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 h-full">
  {/* Swiper + Lista lado a lado */}
  <div className="bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] p-4 rounded shadow-md">
    <h3 className="text-center text-xl mb-4">Últimos Arquivos {new Date().toLocaleDateString('pt-BR')}</h3>
    <div className="flex flex-col md:flex-row gap-4">
      
      {/* Swiper */}
      <div className="w-full md:w-3/4 bg-primary rounded shadow-xl p-4">
        <Swiper
          modules={[Pagination, Autoplay]}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1}
          className="w-full"
        >
          {dashboardData.arquivos.map((arquivo, index) => (
            <SwiperSlide key={index}>
              <div className="bg-transparent rounded-2xl p-4 text-white shadow-inner">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between text-2xl font-bold">
                    <span className="text-yellow-400">Cliente</span>
                    <span className="text-yellow-300">{arquivo.industria || '—'}</span>
                  </div>

                  <div className="flex justify-between text-xl">
                    <span className="text-gray-300">Hora</span>
                    <span>{arquivo.data}</span>
                  </div>

                  <div className="flex justify-between text-xl">
                    <span className="text-gray-300">Valor</span>
                    <span className="font-extrabold text-green-400">
                      R$ {parseFloat(arquivo.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-xl">
                    <span className="text-gray-300">Qtd Cabeças</span>
                    <span className="font-extrabold text-blue-300">{arquivo.quantidade}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

<div className="w-full md:w-1/4 bg-primary rounded shadow-xl p-4 text-white">
  <h4 className="text-center font-bold text-lg mb-3 text-yellow-400">Indústrias</h4>

  <Swiper
    direction="vertical"
    modules={[Autoplay]}
    autoplay={{
      delay: 1000,
      disableOnInteraction: false,
    }}
    slidesPerView={2.2}
    spaceBetween={4}
    className="h-[150px]"
  >
    {dashboardData.arquivos.map((arquivo, index) => (
      <SwiperSlide key={index}>
        <div className="flex items-center gap-2 border-b border-gray-600 pb-1 font-semibold text-yellow-300 tracking-wide text-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse"></span>
          {arquivo.industria || '—'}
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
</div>


    </div>
  </div>

  {/* Gauge */}
  <div className="bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] p-4 rounded shadow-md flex items-center justify-center">
    <GraficoDeGauge data={gaugeChartData} options={gaugeChartOptions} />
  </div>
</div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#2A3529] to-[#1A1F1A]   p-4 rounded shadow-md">
          <h4 className="text-center mb-2">Negócios por Frete</h4>
          <GraficoDeBarras data={barChartData} />
        </div>
        <div className="bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] p-4 rounded shadow-md">
          <h4 className="text-center mb-2">Negócios por Categoria</h4>
          <GraficoDePizza data={pieChartData} />
        </div>
        <div className="bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] p-4 rounded shadow-md">
          <h4 className="text-center mb-2">Negócios por Estado</h4>
          <GraficoDeColunas data={columnChartData} />
        </div>
      </div>
      <div className="mt-6">
        <RelogioCard />
      </div>
      <div className="mt-6">
        <img src={dlogo} alt="Datagro Logo" className="mx-auto h-12 scale-75" />
      </div>
    </div>
  );
};

export default DashBoardRelTime;