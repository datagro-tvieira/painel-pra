import React, { useEffect, useState } from 'react';
import anychart from 'anychart';
import AnyChart from 'anychart-react';

const PainelResumo = ({ label, valor, comparacao }) => {
  const icone = comparacao > 0 ? '▲' : comparacao < 0 ? '▼' : '–';
  const corClasse = comparacao > 0 ? 'text-green-400' : comparacao < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="bg-[#202a1f] rounded-2xl shadow-lg p-4 flex flex-col items-center w-full transition-all hover:shadow-2xl">
      <span className="text-sm text-gray-300 uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-semibold text-white mt-2">{valor}</span>
      <span className={`text-sm mt-1 ${corClasse}`}>{icone} {Math.abs(comparacao)}%</span>
    </div>
  );
};

const DashBoardGerencial = () => {
  const [dados, setDados] = useState(null);

//   useEffect(() => {
//     (async () => {
//       const res = await fetch('https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/calculo?obter=dados');
//       const data = await res.json();
//       setDados(data);
//     })();
//   }, []);

  const gerarGraficoPizza = () => {
    const chart = anychart.pie([
      { x: "MT", value: 45 },
      { x: "GO", value: 20 },
      { x: "MS", value: 15 },
      { x: "SP", value: 10 },
      { x: "BA", value: 10 },
    ]);
    chart.innerRadius("40%");
    chart.palette(["#a3e635", "#facc15", "#4ade80", "#38bdf8", "#f87171"]);
    chart.background().fill("#1a1a1a 0");
    return chart;
  };

  const gerarGraficoColunas = () => {
    const chart = anychart.column([
      ["SP", 21],
      ["MT", 38],
      ["MS", 19],
      ["GO", 12],
      ["BA", 10],
    ]);
    chart.background().fill("#1a1a1a 0");
    chart.yAxis().labels().fontColor("#ccc");
    chart.xAxis().labels().fontColor("#ccc");
    chart.tooltip().format("{%Value}%");
    return chart;
  };

  return (
    <div className="bg-[#131a12] text-white min-h-screen p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 flex flex-col gap-4">
        <PainelResumo label="Arquivos" valor="12" comparacao={5.6} />
        <PainelResumo label="Cabeças" valor="3.450" comparacao={-3.2} />
        <PainelResumo label="Tokens" valor="1250" comparacao={1.1} />
        <PainelResumo label="Valor Total" valor="R$ 2.345.000" comparacao={2.7} />
      </div>

      <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1f2b1a] p-4 rounded-2xl shadow-md">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">Distribuição por Estado</h3>
          <AnyChart instance={gerarGraficoPizza()} width="100%" height={300} />
        </div>
        <div className="bg-[#1f2b1a] p-4 rounded-2xl shadow-md">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">Negócios por UF</h3>
          <AnyChart instance={gerarGraficoColunas()} width="100%" height={300} />
        </div>
      </div>
    </div>
  );
};

export default DashBoardGerencial;
