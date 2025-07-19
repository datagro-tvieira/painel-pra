import { useEffect, useState } from 'react';

export const useDashboardGerencial = () => {
  const [info, setInfo] = useState({ totalFiles: 0, totalHeads: 0, totalToken: 0, currentValue: 0 });
  const [arquivos, setArquivos] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [columnChartData, setColumnChartData] = useState([]);

  const fetchData = async () => {
    try {
      const [calculoDados, arquivosDados, negociosDados] = await Promise.all([
        fetch('https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/calculo?obter=dados').then(res => res.json()),
        fetch('https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/realtime?obter=arquivo').then(res => res.json()),
        fetch('https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/realtime?obter=negocios-hoje').then(res => res.json())
      ]);

      const datahoraDados = Object.keys(calculoDados.resultados || {});
      if (datahoraDados.length > 0) {
        const latestKey = datahoraDados[datahoraDados.length - 1];
        const dados = calculoDados.resultados[latestKey];
        setInfo({
          totalFiles: dados.arquivos ?? 0,
          totalHeads: dados.cabecas ?? 0,
          totalToken: dados.tokens ?? 0,
          currentValue: dados.total ?? 0
        });
      }

      const datahoraArquivos = Object.keys(arquivosDados.resultado || {});
      if (datahoraArquivos.length > 0) {
        setArquivos(Object.values(arquivosDados.resultado));
      }

      if (negociosDados && negociosDados.retorno) {
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
          Object.keys(ufs).map(key => ({ x: key, value: ufs[key] }))
        );
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return { info, arquivos, barChartData, pieChartData, columnChartData };
};
