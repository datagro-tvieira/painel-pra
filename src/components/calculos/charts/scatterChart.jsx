import React, { useEffect, useRef, useState } from 'react';
import anychart from 'anychart';

export const ScatterChart = (categoria, dataFiltro) => {
  const chartContainer = useRef(null);
  const [industriaGroups, setIndustriaGroups] = useState({});
  const [ufsDisponiveis, setUfsDisponiveis] = useState([]);
  const [ufSelecionada, setUfSelecionada] = useState ('Todas');
  const [aprovadoSelecionado, setAprovadoSelecionado] = useState([]);
  const [aprovado3, setAprovado3] = useState ('Todas');
  const [larguraJanela, setLarguraJanela] = useState (window.innerWidth);

  useEffect(() => {
      function handleResize() {
        setLarguraJanela(window.innerWidth);
      }
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }, []);

  const alturaGrafico = larguraJanela < 768 ? 300 : larguraJanela < 1900 ? 400 : 600;

  const fetchData = async ({categoria, dataFiltro}) => {
    try {
      const response = await fetch(
        `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/negocios?categoria=${categoria}&paginar=0&acao=negociosPainel&dataFiltro=${dataFiltro}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) throw new Error('Erro ao buscar dados');
      const result = await response.json();
      const negocios = result.resultado || [];

      const industriaGroups = {};
      const ufs = new Set();
      const aprovado2 = new Set();

      negocios.forEach(item => {
        const id = item.id;
        const industria = item.industria || 'Desconhecida';
        const quantidade = Number(item.quantidade);
        const valor = Number(item.valor);
        const uf = item.origem || 'Desconhecida';
        const modalidade = item.modalidade;
        const aprovado = item.aprovado == 1 ? 'Sim' : (item.aprovado == -1 ? 'PA' : 'Não');

        ufs.add(uf);
        aprovado2.add(aprovado);

        if (!isNaN(quantidade) && !isNaN(valor)) 
            {
            if (!industriaGroups[industria]) industriaGroups[industria] = [];
            industriaGroups[industria].push({ id, industria, x: quantidade, y: valor, UF: uf, modalidade: modalidade, aprovado: aprovado});
            }
      });

      setIndustriaGroups(industriaGroups);
      setUfsDisponiveis(['Todas', ...Array.from(ufs)]);
      setAprovadoSelecionado(['Todas', ...Array.from(aprovado2)]);
    } catch (error) {
      console.error('Erro ao carregar dados para o gráfico:', error);
    }
  };

  const renderChart = (industriaGroups) => {
    if (!chartContainer.current) return;
    chartContainer.current.innerHTML = '';

    const chart = anychart.scatter();

     chart.background().fill("transparent");
    chart.animation(true);
    chart.title('Dispersão de Quantidade x Valor');
    chart.title().fontColor('#ffffff');

    chart.xAxis().title('Quantidade').labels().fontColor('#ffffff');
    chart.yAxis().title('Valor').labels().fontColor('#ffffff');
    chart.xAxis().title().fontColor('#ffffff');
    chart.yAxis().title().fontColor('#ffffff');

    chart.legend().enabled(true).fontColor('#ffffff');

    Object.keys(industriaGroups).forEach((industria) => {
      const dataFiltrada = industriaGroups[industria].filter(item => {
        const filtroUF = ufSelecionada === 'Todas' || item.UF === ufSelecionada;
        const filtroAprovado = aprovado3 === 'Todas' || item.aprovado === aprovado3;
        return filtroUF && filtroAprovado;
      });

      if (dataFiltrada.length > 0) {
        const series = chart.marker(dataFiltrada);
        series.name(industria);
        series.type('circle');
        series.size(6);
        series.hovered().size(9);
        series.tooltip().format(`Indústria: ${industria}\nQuantidade: {%x}\nValor: {%y}\nUF: {%UF}\nID: {%id}\nModalidade: {%modalidade}\nAprovado: {%aprovado}`);
      }
    });

    chart.listen('pointMouseOver', () => {
      if (chartContainer.current) chartContainer.current.style.cursor = 'pointer';
    });

    chart.listen('pointMouseOut', () => {
      if (chartContainer.current) chartContainer.current.style.cursor = 'default';
    });

    chart.listen('pointClick', function(e) {
      const point = e.point;
      const clickedData = {
        id: point.get('id'),
        industria: point.get('industria'),
        quantidade: point.get('x'),
        valor: point.get('y'),
        origem: point.get('UF'),
        modalidade: point.get('modalidade'),
        aprovado: point.get('aprovado')
      };
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('chartPointClick', { detail: clickedData }));
      }
    });

    chart.container(chartContainer.current);
    chart.draw();
  };

  useEffect(() => {
    fetchData(categoria, dataFiltro);
  }, [categoria, dataFiltro]);

  useEffect(() => 
    {
    renderChart(industriaGroups);
  }, [industriaGroups, categoria, ufSelecionada, dataFiltro, aprovado3]);

  return (
    <div>
     <div className="bg-transparent flex flex-wrap items-center gap-4 p-1 rounded-lg ">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <label className="text-sm text-white font-medium">Estado:</label>
          <select
            className="bg-white text-black px-3 py-1.5 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            value={ufSelecionada}
            onChange={(e) => setUfSelecionada(e.target.value)}>

            {ufsDisponiveis.map((uf, index) => (
              <option key={index} value={uf}>{uf}</option>
            ))}
            
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <label className="text-sm text-white font-medium">Aprovado:</label>
          <select
            className="bg-white text-black px-3 py-1.5 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
            value={aprovado3}
            onChange={(e) => setAprovado3(e.target.value)}
          >
            {aprovadoSelecionado.map((ap, index) => (
              <option key={index} value={ap}>{ap}</option>
            ))}
          </select>
        </div>
      </div>
      <div
        ref={chartContainer}
        className='w-full'
        style={{ height: `${alturaGrafico}px` }}
      />
    </div>
  );
};
