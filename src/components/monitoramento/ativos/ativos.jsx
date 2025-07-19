import React, { useEffect, useRef, useState, useMemo } from 'react';
import anychart from 'anychart';
import dayjs from 'dayjs';

const estados = ['SP', 'MT', 'MS', 'GO', 'BA'];

const MarketTerminalCharts = () => {
  const containerChart = useRef(null);
  const [estadoSelecionado, setEstadoSelecionado] = useState(estados[0]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [resultados, setResultados] = useState({});

  // ✅ Gera meses dinâmicos com dayjs
  const meses = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = dayjs().startOf('month').subtract(i, 'month');
      return {
        label: date.format('MMM YYYY'),
        value: date.format('YYYY-MM-DD'),
      };
    });
  }, []);

  // ✅ Inicializa com o mês mais recente
  useEffect(() => {
    if (meses.length) {
      setMesSelecionado(meses[0].value);
      setDataFiltro(meses[0].value);
    }
  }, [meses]);

  // ✅ Atualiza dataFiltro quando mês muda
  useEffect(() => {
    if (mesSelecionado) {
      const dataInicio = dayjs(mesSelecionado).startOf('month').format('YYYY-MM-DD');
      const dataFim = dayjs(mesSelecionado).endOf('month').format('YYYY-MM-DD');
      fetchData(dataInicio, dataFim);
    }
  }, [mesSelecionado]);


  // ✅ Busca dados do backend
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

  // Carrega dados ao montar ou mudar dataFiltro
  useEffect(() => {
    if (dataFiltro) {
      fetchData(dataFiltro);
    }
  }, [dataFiltro]);

  // Desenha o gráfico
  useEffect(() => {
    if (!containerChart.current) return;

    const dadosEstado = resultados[estadoSelecionado];
    if (!dadosEstado || !dadosEstado.boi || !dadosEstado.vaca || !dadosEstado.novilha) {
      console.warn('Dados ainda não disponíveis para o estado:', estadoSelecionado);
      return;
    }

    const chart = anychart.line();

    chart.background().fill("#000000");
    chart.title()
      .text(`Mercado Bovino - ${estadoSelecionado}`)
      .fontColor("#00FF00")
      .fontSize(18)
      .background({ fill: "black" });

    chart.xAxis().labels().fontColor("#AAAAAA");
    chart.yAxis().labels().fontColor("#AAAAAA");
    chart.xAxis().stroke("#444444");
    chart.yAxis().stroke("#444444");
    chart.xGrid().stroke("#222222");
    chart.yGrid().stroke("#222222");

    chart.line(dadosEstado.boi).name("Boi").stroke("#00FF00", 2);
    chart.line(dadosEstado.vaca).name("Vaca").stroke("#00FFFF", 2);
    chart.line(dadosEstado.novilha).name("Novilha").stroke("#FFFF00", 2);

    chart.legend().enabled(true).fontColor("#00FF00").fontSize(14).background().fill("#111");
    chart.tooltip().background().fill("#111111");
    chart.tooltip().fontColor("#00FF00");

    chart.container(containerChart.current);
    chart.draw();

    return () => chart.dispose();
  }, [estadoSelecionado, resultados]);

  // ✅ Últimos preços
  const dadosEstado = resultados[estadoSelecionado] || {};
  const latestBoi = dadosEstado.boi?.at(-1)?.value ? dadosEstado.boi.at(-1).value.toFixed(2) : '...';
  const latestVaca = dadosEstado.vaca?.at(-1)?.value ? dadosEstado.vaca.at(-1).value.toFixed(2) : '...';
  const latestNovilha = dadosEstado.novilha?.at(-1)?.value ? dadosEstado.novilha.at(-1).value.toFixed(2) : '...';

  return (
    <div className="relative bg-primary min-h-screen text-green-400 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-green-800 bg-primary bg-opacity-90 sticky top-0 z-40">
        <div className="text-green-300 font-bold text-lg">
          Estado: <span className="text-green-400">{estadoSelecionado}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-green-300">Mês:</label>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="bg-black text-green-400 border border-green-500 rounded px-2 py-1"
          >
            {meses.map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-black border border-green-500 rounded-lg p-4 flex flex-col items-center">
          <h2 className="text-lg font-bold">🟢 Boi</h2>
          <p className="text-3xl mt-2">R${latestBoi}</p>
        </div>
        <div className="bg-black border border-green-500 rounded-lg p-4 flex flex-col items-center">
          <h2 className="text-lg font-bold">🟢 Vaca</h2>
          <p className="text-3xl mt-2">R${latestVaca}</p>
        </div>
        <div className="bg-black border border-green-500 rounded-lg p-4 flex flex-col items-center">
          <h2 className="text-lg font-bold">🟢 Novilha</h2>
          <p className="text-3xl mt-2">R${latestNovilha}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-4">
        <div ref={containerChart} className="w-full h-[600px] border border-green-700 rounded-lg" />
      </div>

      {/* Botão flutuante */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        <div
          className={`
            flex flex-col gap-2 mb-2
            rounded-lg border border-green-500 bg-black shadow-lg p-3
            transform
            ${menuAberto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
            transition-all duration-300 ease-in-out
          `}
        >
          {estados.map((uf) => (
            <button
              key={uf}
              onClick={() => {
                setEstadoSelecionado(uf);
                setMenuAberto(false);
              }}
              className="px-4 py-2 rounded-full border border-green-500 text-green-300 hover:bg-green-900 transition"
            >
              {uf}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className={`
            w-12 h-12 rounded-full
            bg-green-500 text-black text-2xl font-bold
            flex items-center justify-center
            shadow-lg
            hover:bg-green-400
            transition-all duration-300 ease-in-out
            ${menuAberto ? 'rotate-90' : ''}
          `}
          aria-label="Abrir menu de estados"
        >
          ≡
        </button>
      </div>
    </div>
  );
};

export default MarketTerminalCharts;
