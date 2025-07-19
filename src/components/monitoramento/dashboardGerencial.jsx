import React from 'react';
import { useDashboardGerencial } from '@/hooks/useDashboardGerencial';
import { GraficoDeBarras } from './graficos/graficoDeBarras';
import { GraficoDePizza } from './graficos/graficoDePizza';
import { GraficoDeColunas } from './graficos/graficoDeColunas';

const InfoCard = ({ label, value }) => (
  <div className="bg-card-bg p-4 rounded-xl shadow-md text-center">
    <p className="text-lg">{label}</p>
    <h2 className="text-2xl text-text-bold-color font-bold">{value}</h2>
  </div>
);

const ArquivoItem = ({ arquivo }) => (
  <div className="border-b border-gray-600 py-2 flex flex-col">
    <span className="text-yellow-300 text-sm font-semibold">{arquivo.industria || '—'}</span>
    <span className="text-gray-400 text-xs">{arquivo.data}</span>
    <span className="text-green-400 text-sm">R$ {parseFloat(arquivo.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
    <span className="text-blue-300 text-sm">{arquivo.quantidade} cab.</span>
  </div>
);

const DashboardGerencial = () => {
  const { info, arquivos, barChartData, pieChartData, columnChartData } = useDashboardGerencial();

  return (
    <div className="bg-background text-white min-h-full p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-center">Resumo Gerencial</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Arquivos" value={info.totalFiles} />
        <InfoCard label="Cabeças" value={info.totalHeads} />
        <InfoCard label="Tokens" value={info.totalToken} />
        <InfoCard label="Valor" value={`R$ ${parseFloat(info.currentValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card-bg p-4 rounded-xl">
          <h3 className="text-center mb-2">Últimos Arquivos</h3>
          <div className="overflow-y-auto max-h-60 space-y-2">
            {arquivos.slice(0,5).map((arq, i) => <ArquivoItem key={i} arquivo={arq} />)}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card-bg p-4 rounded-xl">
            <h4 className="text-center mb-2">Negócios por Frete</h4>
            <GraficoDeBarras data={barChartData} />
          </div>
          <div className="bg-card-bg p-4 rounded-xl">
            <h4 className="text-center mb-2">Negócios por Categoria</h4>
            <GraficoDePizza data={pieChartData} />
          </div>
          <div className="bg-card-bg p-4 rounded-xl">
            <h4 className="text-center mb-2">Negócios por Estado</h4>
            <GraficoDeColunas data={columnChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGerencial;
