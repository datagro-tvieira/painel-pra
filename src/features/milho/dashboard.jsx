import { useEffect, useState, useRef } from 'react';
import anychart from 'anychart';
import { Factory, FileText, Handshake, Beef, DollarSign } from 'lucide-react';
import CountUp from 'react-countup';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(null);
  const [porData, setPorData] = useState(null);
  const [error, setError] = useState(null);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/resumo?obter=resumo'
        );
        if (!response.ok) throw new Error('Erro ao carregar dados');
        const data = await response.json();
        setTotal(data.total);
        setPorData(data.porData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = porData
    ? Object.entries(porData)
        .filter(([ano]) => parseInt(ano) >= 2000)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([ano, valores]) => ({
          ano,
          qtdNegocios: parseInt(valores.qtdNegocios),
          totalCabecas: parseInt(valores.totalCabecas),
          total: parseFloat(valores.total),
        }))
    : [];

  const formatValorLabel = (valor) => {
    const num = parseFloat(valor);
    if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)} tri`;
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)} bi`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)} mi`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)} mil`;
    return `${num}`;
  };

  const formatValorLabelChart = (valor) => formatValorLabel(valor);

  const formatMoney = (valor) => {
    const num = parseFloat(valor);
    if (num >= 1_000_000_000_000) return `R$ ${(num / 1_000_000_000_000).toFixed(2)} tri`;
    if (num >= 1_000_000_000) return `R$ ${(num / 1_000_000_000).toFixed(2)} bi`;
    if (num >= 1_000_000) return `R$ ${(num / 1_000_000).toFixed(2)} mi`;
    if (num >= 1_000) return `R$ ${(num / 1_000).toFixed(0)} mil`;
    return `R$ ${num}`;
  };

  useEffect(() => {
    if (chartContainerRef.current && chartData.length > 0) {
      if (!chartRef.current) {
        const chart = anychart.column();
        chart.background().fill('#2A3529');
        chart.title('Histórico Comparativo por Ano');
        chart.xAxis().title('Ano');
        chart.yAxis().title('Valores');
        chart.yAxis().labels().format(function () {
          return formatValorLabelChart(this.value);
        });
        chart.tooltip().format('Ano: {%x}\n{%SeriesName}: {%Value}');
        chart.legend(true);
        chart.palette(['#4ade80', '#60a5fa', '#facc15']);
        chart.yScale('log');
        chart.container(chartContainerRef.current);
        chartRef.current = chart;
      }

      const chart = chartRef.current;
      chart.removeAllSeries();

      const seriesNegocios = chart.column(
        chartData.map((d) => ({ x: d.ano, value: d.qtdNegocios }))
      );
      seriesNegocios.name('Qtd Negócios');
      seriesNegocios.labels().enabled(true).format(function () {
        return formatValorLabel(this.value);
      }).fontSize(14).fontWeight('bold').fontColor('#ffffff').position('top');

      const seriesCabecas = chart.column(
        chartData.map((d) => ({ x: d.ano, value: d.totalCabecas }))
      );
      seriesCabecas.name('Total Cabeças');
      seriesCabecas.labels().enabled(true).format(function () {
        return formatValorLabel(this.value);
      }).fontSize(14).fontWeight('bold').fontColor('#ffffff').position('top');

      const seriesTotal = chart.column(
        chartData.map((d) => ({ x: d.ano, value: d.total }))
      );
      seriesTotal.name('Total (R$)');
      seriesTotal.labels().enabled(true).format(function () {
        return formatMoney(this.value);
      }).fontSize(14).fontWeight('bold').fontColor('#ffffff').position('top');

      chart.draw();
    }
  }, [chartData]);

  const formatNumber = (value) =>
    parseFloat(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

  const cards = total
    ? [
        { title: 'Indústrias', rawValue: total.qtdIndustrias, icon: Factory, format: formatNumber },
        { title: 'Arquivos', rawValue: total.qtdArquivos, icon: FileText, format: formatNumber },
        { title: 'Negócios', rawValue: total.qtdNegocios, icon: Handshake, format: formatNumber },
        { title: 'Cabeças', rawValue: total.qtdCabecas, icon: Beef, format: formatNumber },
        { title: 'Total (R$)', rawValue: total.total, icon: DollarSign, format: (v) => `R$ ${formatNumber(v)}` },
      ]
    : [];

  if (loading) return <div className="text-white">Carregando...</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;
  if (!total || !porData) return <div className="text-gray-400">Nenhum dado disponível</div>;

  return (
    <div className="p-4 bg-milho-primary text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-card-bg rounded-xl p-4 flex flex-col gap-4 w-full hover:bg-[#1f441d] transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-quaternary p-2 rounded-lg">
                <card.icon size={24} className="text-text-bold-color" />
              </div>
              <h3 className="text-white text-lg">{card.title}</h3>
            </div>
            <div className="bg-quaternary rounded-lg p-4 text-2xl font-bold text-white flex items-center justify-center whitespace-nowrap">
              <CountUp
                end={parseFloat(card.rawValue)}
                duration={1.5}
                separator="."
                decimals={2}
                decimal=","
                formattingFn={(val) => card.format(val)}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: '500px',
          borderRadius: '12px',
          padding: '16px'
        }}
      />
    </div>
  );
};

export default DashboardPage;
