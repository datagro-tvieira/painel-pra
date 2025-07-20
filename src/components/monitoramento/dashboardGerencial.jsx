import React, { useEffect, useRef, useState } from 'react';
import anychart from 'anychart';
import dayjs from 'dayjs';
import { useDashboardGerencial } from '@/hooks/useDashboardGerencial';

const InfoCard = ({ label, value }) => (
  <div className="bg-primary p-3 rounded-md shadow-md text-center border border-quaternary">
    <p className="text-xs text-labels uppercase tracking-wide">{label}</p>
    <h2 className="text-xl font-extrabold text-card-text mt-1">{value}</h2>
  </div>
);

const ArquivoItem = ({ arquivo }) => (
  <div className="border-b border-quaternary py-1 text-sm">
    <div className="flex justify-between text-text-bold-color">
      <span>{arquivo.industria || '—'}</span>
      <span className="text-gray-400 text-xs">{arquivo.data}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-green-400">R$ {parseFloat(arquivo.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      <span className="text-blue-300">{arquivo.quantidade} cab.</span>
    </div>
  </div>
);

const Filtros = ({ ufs, categorias, estadoSelecionado, categoriaSelecionada, mesSelecionado, onChangeUf, onChangeCategoria, onChangeMes }) => (
  <div className="flex items-center justify-end flex-wrap gap-2 mt-1">
    <select value={estadoSelecionado} onChange={onChangeUf} className="text-sm bg-button-bg hover:bg-button-hover-bg text-white rounded px-3 py-1">
      {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
    </select>
    <select value={categoriaSelecionada} onChange={onChangeCategoria} className="text-sm bg-button-bg hover:bg-button-hover-bg text-white rounded px-3 py-1">
      {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
    </select>
    <input type="month" value={mesSelecionado} onChange={onChangeMes} className="text-sm bg-button-bg hover:bg-button-hover-bg text-white rounded px-3 py-1" />
  </div>
);

const GraficoBarra = ({ data }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = '';
    const chart = anychart.bar();
    chart.background().fill('#1A1F1A');
    chart.labels(true);
    chart.data(data);
    chart.container(chartRef.current);
    chart.draw();
  }, [data]);
  return <div ref={chartRef} className="h-40 w-full" />;
};

const GraficoPizza = ({ data }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = '';
    const chart = anychart.pie();
    chart.background().fill('#1A1F1A');
    chart.innerRadius("60%");
    chart.labels(true);
    chart.data(data);
    chart.container(chartRef.current);
    chart.draw();
  }, [data]);
  return <div ref={chartRef} className="h-40 w-full" />;
};

const GraficoHistoricoPrecos = ({ dados }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!chartRef.current || !dados.length) return;
    chartRef.current.innerHTML = '';
    const chart = anychart.line();
    chart.background().fill('#1A1F1A');
    chart.line(dados);
    chart.xScale().mode('continuous');
    chart.xAxis().labels().format(function () {
      return dayjs(this.value).format('DD/MM');
    }).rotation(-45).fontColor('#F5F5DC');
    chart.yAxis().labels().fontColor('#F5F5DC');
    chart.tooltip().format("R$ {%value}");
    chart.rangeMarker().enabled(false);

    const ultimo = dados[dados.length - 1];
    if (ultimo) {
      chart.lineMarker(0).value(ultimo.value).stroke("2 red").axis(chart.yAxis());
      chart.marker([{ x: ultimo.x, value: ultimo.value }]).type("circle").size(6).fill("red").stroke("2 red");
    }
    chart.container(chartRef.current);
    chart.draw();
  }, [dados]);
  return <div ref={chartRef} className="h-80 w-full overflow-x-auto" />;
};

const GraficoIndustriaSemDados = ({ dados = [] }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = '';
    const chart = anychart.heatMap(dados);
    chart.title('Dias sem Envio por Indústria');
    chart.background().fill('#1A1F1A');
    chart.stroke('#374237');
    chart.labels().fontColor('#F5F5DC');
    chart.xAxis().labels().rotation(-45).fontColor('#F5F5DC');
    chart.container(chartRef.current);
    chart.draw();
  }, [dados]);
  return (
    <div className="w-full overflow-x-auto">
      <div ref={chartRef} className="h-60 min-w-[800px]" />
    </div>
  );
};

const DashboardGerencial = () => {
  const { info, arquivos, barChartData, pieChartData } = useDashboardGerencial();
  const [resultados, setResultados] = useState([]);
  const [diasSemNegocios, setDiasSemNegocios] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState(dayjs().format('YYYY-MM'));
  const [estadoSelecionado, setEstadoSelecionado] = useState('SP');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('boi');
  const [ufs, setUfs] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    if (mesSelecionado && estadoSelecionado && categoriaSelecionada) {
      const dataInicio = dayjs(mesSelecionado).startOf('month').format('YYYY-MM-DD');
      const dataFim = dayjs(mesSelecionado).endOf('month').format('YYYY-MM-DD');
      fetchData(dataInicio, dataFim);
    }
  }, [mesSelecionado, estadoSelecionado, categoriaSelecionada]);

  const fetchData = async (dataInicio, dataFim) => {
    try {
      const response = await fetch(`https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/indicador/resultados?obter=resultados&dataInicio=${dataInicio}&dataFim=${dataFim}`);
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const result = await response.json();
      setUfs(Object.keys(result));
      setCategorias(Object.keys(result?.[estadoSelecionado] || {}));
      const dados = result?.[estadoSelecionado]?.[categoriaSelecionada]?.map(item => ({ x: item.x, value: item.value })) || [];
      setResultados(dados);
    } catch (error) {
      console.error('Erro ao carregar dados para o gráfico:', error);
    }
  };

  useEffect(() => {
    const fetchDiasSemNegocios = async () => {
      try {
        const response = await fetch(`https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/industrias/resultados?obter=diasSemNegocios`);
        if (!response.ok) throw new Error('Erro ao buscar dias sem negócios');
        const result = await response.json();
        const dadosFormatados = result.resultado.map(item => [item.industria, item.dias]);
        setDiasSemNegocios(dadosFormatados);
      } catch (error) {
        console.error('Erro ao buscar dias sem negócios:', error);
      }
    };

    fetchDiasSemNegocios();
  }, []);

  const ultimoValor = resultados.length > 0 ? resultados[resultados.length - 1].value.toFixed(2) : '--';

  return (
    <div className="bg-background text-white w-full min-h-screen overflow-auto p-4 font-sans flex flex-col gap-4">
      <header className="flex justify-between items-center border-b border-secondary pb-2">
        <h1 className="text-xl font-bold text-secondary">Resumo Gerencial</h1>
        <span className="text-sm text-labels">Atualizado em: {new Date().toLocaleDateString('pt-BR')}</span>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <InfoCard label="Arquivos" value={info.totalFiles} />
        <InfoCard label="Cabeças" value={info.totalHeads} />
        <InfoCard label="Tokens" value={info.totalToken} />
        <InfoCard label="Valor" value={`R$ ${parseFloat(info.currentValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="col-span-1 bg-tertiary p-3 rounded-md border border-quaternary flex flex-col max-h-48 overflow-y-auto">
          <h3 className="text-text-bold-color text-sm mb-2 font-bold text-center">Últimos Arquivos</h3>
          {arquivos.slice(0, 10).map((arq, i) => <ArquivoItem key={i} arquivo={arq} />)}
        </div>

        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card-bg p-2 rounded">
            <div className="flex justify-between items-center">
              <h4 className="text-text-bold-color text-md font-bold">Negócios por Frete</h4>
              <input type="date" value={dayjs().format('YYYY-MM-DD')} onChange={() => {}} className="text-xs bg-button-bg text-white rounded px-2 py-0.5" />
            </div>
            <GraficoBarra data={barChartData} />
          </div>
          <div className="bg-card-bg p-2 rounded">
            <div className="flex justify-between items-center">
              <h4 className="text-text-bold-color text-md font-bold">Negócios por Categoria</h4>
              <input type="date" value={dayjs().format('YYYY-MM-DD')} onChange={() => {}} className="text-xs bg-button-bg text-white rounded px-2 py-0.5" />
            </div>
            <GraficoPizza data={pieChartData} />
          </div>
          <div className="bg-card-bg p-2 rounded col-span-1 md:col-span-2">
            <div className="flex justify-between items-center">
              <h4 className="text-text-bold-color text-md font-bold">Indústrias sem Dados (dias)</h4>
              <input type="date" value={dayjs().format('YYYY-MM-DD')} onChange={() => {}} className="text-xs bg-button-bg text-white rounded px-2 py-0.5" />
            </div>
            <GraficoIndustriaSemDados dados={diasSemNegocios} />
          </div>
          <div className="bg-card-bg p-2 rounded col-span-1 md:col-span-2 overflow-x-auto">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="text-text-bold-color text-md font-bold">Histórico de Preços — Último Valor: R$ {ultimoValor}</h4>
              <Filtros ufs={ufs} categorias={categorias} estadoSelecionado={estadoSelecionado} categoriaSelecionada={categoriaSelecionada} mesSelecionado={mesSelecionado} onChangeUf={e => setEstadoSelecionado(e.target.value)} onChangeCategoria={e => setCategoriaSelecionada(e.target.value)} onChangeMes={e => setMesSelecionado(e.target.value)} />
            </div>
            <GraficoHistoricoPrecos dados={resultados} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardGerencial;
