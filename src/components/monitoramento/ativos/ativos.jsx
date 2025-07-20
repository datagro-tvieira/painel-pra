import React, { useEffect, useRef, useState, useMemo } from 'react';
import anychart from 'anychart';
import dayjs from 'dayjs';
import boi from '../../../assets/boi-bg.png';

const estados = ['SP', 'MT', 'MS', 'GO', 'BA'];

const MarketTerminalCharts = () => {
  const containerChart = useRef(null);
  const [estadoSelecionado, setEstadoSelecionado] = useState(estados[0]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [resultados, setResultados] = useState({});

  const meses = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = dayjs().startOf('month').subtract(i, 'month');
      return {
        label: date.format('MMM YYYY'),
        value: date.format('YYYY-MM-DD'),
      };
    });
  }, []);

  useEffect(() => {
    if (meses.length) {
      setMesSelecionado(meses[0].value);
      setDataFiltro(meses[0].value);
    }
  }, [meses]);

  useEffect(() => {
    if (mesSelecionado) {
      const dataInicio = dayjs(mesSelecionado).startOf('month').format('YYYY-MM-DD');
      const dataFim = dayjs(mesSelecionado).endOf('month').format('YYYY-MM-DD');
      fetchData(dataInicio, dataFim);
    }
  }, [mesSelecionado]);

  const fetchData = async (dataInicio, dataFim) => {
    try {
      const response = await fetch(
        `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/indicador/resultados?obter=resultados&dataInicio=${dataInicio}&dataFim=${dataFim}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const result = await response.json();
      setResultados(result || {});
    } catch (error) {
      console.error('Erro ao carregar dados para o gráfico:', error);
    }
  };

  useEffect(() => {
    if (!containerChart.current) return;

    const dadosEstado = resultados[estadoSelecionado];
    if (!dadosEstado || !dadosEstado.boi || !dadosEstado.vaca || !dadosEstado.novilha) {
      console.warn('Dados ainda não disponíveis para o estado:', estadoSelecionado);
      return;
    }

    const chart = anychart.line();

    chart.background().fill({ keys: ['#1A1F1A', '#2A3529'], angle: 135 });
    chart.title().text(`📈 Mercado Bovino — ${estadoSelecionado}`)
      .fontColor('#FFD700')
      .fontSize(22);

    chart.xAxis().labels().fontColor('#F5F5DC');
    chart.yAxis().labels().fontColor('#F5F5DC');
    chart.xAxis().stroke('#374237');
    chart.yAxis().stroke('#374237');
    chart.xGrid().stroke('#242b24');
    chart.yGrid().stroke('#242b24');

    chart.line(dadosEstado.boi).name('Boi').stroke({keys: ['#00C853', '#2A3529'], angle: 90}, 3);
    chart.line(dadosEstado.vaca).name('Vaca').stroke({keys: ['#FFD700', '#394B74'], angle: 90}, 3);
    chart.line(dadosEstado.novilha).name('Novilha').stroke({keys: ['#F5F5DC', '#1A1F1A'], angle: 90}, 3);

    chart.legend().enabled(true).fontColor('#FFFFFF').fontSize(14).background().fill('#2A3529');
    chart.tooltip().background().fill('#2A3529');
    chart.tooltip().fontColor('#FFFFFF');

    chart.container(containerChart.current);
    chart.draw();

    return () => chart.dispose();
  }, [estadoSelecionado, resultados]);

  const dadosEstado = resultados[estadoSelecionado] || {};
  const latestBoi = dadosEstado.boi?.length ? dadosEstado.boi[dadosEstado.boi.length - 1]?.value?.toFixed(2) : '...';
  const latestVaca = dadosEstado.vaca?.length ? dadosEstado.vaca[dadosEstado.vaca.length - 1]?.value?.toFixed(2) : '...';
  const latestNovilha = dadosEstado.novilha?.length ? dadosEstado.novilha[dadosEstado.novilha.length - 1]?.value?.toFixed(2) : '...';

  return (
    <div className="relative bg-cover bg-center min-h-screen text-card-text font-mono" style={{ backgroundImage: boi, backgroundBlendMode: 'overlay', backgroundColor: '#1A1F1Acc' }}>
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-tertiary/90  sticky top-0 z-40 shadow-md">
        <div className="text-lg font-bold">
          📍 Estado: <span className="text-secondary">{estadoSelecionado}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">📅</span>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="bg-card-bg text-secondary border border-secondary rounded px-3 py-1 hover:bg-quaternary"
          >
            {meses.map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="bg-primary rounded-lg p-4 shadow-lg text-center">
          <h2 className="text-xl font-bold text-secondary">🟢 Boi</h2>
          <p className="text-4xl font-extrabold text-text-bold-color mt-2">R${latestBoi}</p>
        </div>
        <div className="bg-primary rounded-lg p-4 shadow-lg text-center">
          <h2 className="text-xl font-bold text-secondary">🟢 Vaca</h2>
          <p className="text-4xl font-extrabold text-text-bold-color mt-2">R${latestVaca}</p>
        </div>
        <div className="bg-primary rounded-lg p-4 shadow-lg text-center">
          <h2 className="text-xl font-bold text-secondary">🟢 Novilha</h2>
          <p className="text-4xl font-extrabold text-text-bold-color mt-2">R${latestNovilha}</p>
        </div>
      </div>

      <div className="px-6 pb-10">
        <div ref={containerChart} className="w-full h-[600px] mt-5 rounded-lg shadow-lg backdrop-blur-sm" />
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <div className={`flex flex-col gap-2 mb-3 rounded-lg border border-secondary bg-card-bg shadow-xl p-3 transform ${menuAberto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} transition-all duration-300 ease-in-out`}>
          {estados.map((uf) => (
            <button
              key={uf}
              onClick={() => {
                setEstadoSelecionado(uf);
                setMenuAberto(false);
              }}
              className="px-4 py-2 rounded-full border border-secondary text-secondary hover:bg-button-hover-bg transition"
            >
              {uf}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className={`w-14 h-14 rounded-full bg-secondary text-background text-3xl font-bold flex items-center justify-center shadow-lg hover:bg-button-hover-bg transition-all duration-300 ease-in-out ${menuAberto ? 'rotate-90' : ''}`}
          aria-label="Abrir menu de estados"
        >
          ≡
        </button>
      </div>
    </div>
  );
};

export default MarketTerminalCharts;
