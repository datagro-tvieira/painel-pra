import React, { useEffect, useRef, useState } from 'react';
import anychart from 'anychart';

export const DistribuicaoPage = ({ dataFiltro }) => {
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const [ufs, setUfs] = useState(['SP']);
  const [resultados, setResultados] = useState({});
  const [ufSelecionada, setUfSelecionada] = useState('SP');
  const [categoria, setCategoria] = useState('boi');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [larguraJanela, setLarguraJanela] = useState(window.innerWidth);

   useEffect(() => {
        function handleResize() {
          setLarguraJanela(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
  
        return () => window.removeEventListener('resize', handleResize);
      }, []);
  
    const alturaGrafico = larguraJanela < 768 ? 300 : larguraJanela < 1900 ? 400 : 600;

  const fetchData = async () => {
    try {
      setIsDataLoaded(false);
      const response = await fetch(
        `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/distribuicao?obter=distribuicao&categoria=${categoria}&data=${dataFiltro}`
      );
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const result = await response.json();
      setUfs(Object.keys(result || {}));
      setResultados(result || {});
      setUfSelecionada(Object.keys(result || {})[0] || 'SP');
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoria, dataFiltro]);

  useEffect(() => {
    if (isDataLoaded) {
      renderPieChart();
      renderBarChart();
    }
  }, [isDataLoaded, ufSelecionada]);

  const renderPieChart = () => {
    if (!pieChartRef.current) return;
    pieChartRef.current.innerHTML = '';
    const data = resultados[ufSelecionada] || [];

    const chart = anychart.pie(
      data.map((item) => [item.planta, item.negocios])
    );
    chart.title('Número de Negócios por Planta').background().fill('#2A3529');
    chart.container(pieChartRef.current);
    chart.labels().position('outside').fontColor('#FFFFFF').fontSize(12);
    chart.legend().enabled(true).fontColor('#FFFFFF').position('bottom').itemsLayout('horizontal');
    chart.draw();
  };

  const renderBarChart = () => {
    if (!barChartRef.current) return;
    barChartRef.current.innerHTML = '';
    const data = resultados[ufSelecionada] || [];

    const barData = anychart.data.set(
      data.map((item) => [item.planta, item.min, item.med, item.max])
    );

    const chart = anychart.column();
    chart.column(barData.mapAs({ x: 0, value: 1 })).name('Min').normal().fill('#F97316');
    chart.column(barData.mapAs({ x: 0, value: 2 })).name('Med').normal().fill('#22D3EE');
    chart.column(barData.mapAs({ x: 0, value: 3 })).name('Max').normal().fill('#10B981');
    chart.title(`Distribuição - ${ufSelecionada}`);
    chart.background().fill('#2A3529');
    chart.container(barChartRef.current);
    chart.xAxis().title('Plantas').labels().fontColor('#FFFFFF');
    chart.yAxis().title('Preço (R$/@)').labels().fontColor('#FFFFFF');
    chart.legend().enabled(true).fontColor('#FFFFFF').position('bottom').itemsLayout('horizontal');
    chart.draw();
  };

  return (
    <div className="min-h-screen p-4 bg-[#2A3529] text-white">
      <h2 className="text-2xl font-bold mb-4">Distribuição - {ufSelecionada}</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {['boi', 'vaca', 'novilha'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`px-4 py-2 rounded transition-all ${
              categoria === cat
                ? 'bg-[#0B0E1A] text-[#14FFE7] font-bold'
                : 'bg-[#394B74] hover:bg-[#0B0E1A]'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="mr-2 font-semibold">Estado:</label>
        <select
          className="bg-white text-black rounded px-2 py-1"
          value={ufSelecionada}
          onChange={(e) => setUfSelecionada(e.target.value)}
        >
          {ufs.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-600 mb-8">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-[#394B74] sticky top-0">
            <tr>
              {['Planta', 'Negócios', 'Cab1', 'Cab2', 'Cab3', 'Mín (R$/@)', 'Méd (R$/@)', 'Máx (R$/@)', 'Cap', 'Escala', 'Outliers'].map((header, i) => (
                <th key={i} className="px-4 py-2 text-left font-bold text-white">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resultados[ufSelecionada]?.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-700 hover:bg-[#394B74]">
                <td className="px-4 py-2">{item.planta}</td>
                <td className="px-4 py-2 text-right">{item.negocios}</td>
                <td className="px-4 py-2 text-right">{item.cab1}</td>
                <td className="px-4 py-2 text-right">{item.cab2}</td>
                <td className="px-4 py-2 text-right">{item.cab3}</td>
                <td className="px-4 py-2 text-right">{item.min?.toFixed(2) ?? '-'}</td>
                <td className="px-4 py-2 text-right">{item.med?.toFixed(2) ?? '-'}</td>
                <td className="px-4 py-2 text-right">{item.max?.toFixed(2) ?? '-'}</td>
                <td className="px-4 py-2 text-center">{item.cap === 1 ? 'Não' : (item.cap).toFixed(4) }</td>
                <td className="px-4 py-2 text-right">{item.escala ?? '-'}</td>
                <td className="px-4 py-2 text-right">{item.outliers ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div ref={pieChartRef} className="h-[400px] w-full bg-[#394B74] rounded-xl p-4 shadow-lg" />
        </div>
        <div>
          <div ref={barChartRef} className="h-[400px] w-full bg-[#394B74] rounded-xl p-4 shadow-lg" />
        </div>
      </div>
    </div>
  );
};
