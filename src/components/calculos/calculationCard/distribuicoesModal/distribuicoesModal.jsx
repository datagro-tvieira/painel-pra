import React, { useRef, useState } from 'react';
import { ChartPie, FileSpreadsheet } from 'lucide-react';
import ExcelViewer from '../excelViewer';
import { DistribuicaoPage } from '../../../../routes/distribuicao/page';
import domtoimage from 'dom-to-image';

const DistribuicoesModal = ({ show, onClose, categoria, dataFiltro }) => {
  const [viewDistribuicoes, setViewDistribuicoes] = useState('p');
  const [fullscreenDistribuicoes, setFullscreenDistribuicoes] = useState(false);
  const distribuicoesRef = useRef();

  if (!show) return null;

  const baixarImagemDistribuicoes = async () => {
    if (!distribuicoesRef.current) return;

    try {
      setFullscreenDistribuicoes(true);
      await new Promise(requestAnimationFrame);
      const dataUrl = await domtoimage.toPng(distribuicoesRef.current);
      const link = document.createElement('a');
      link.download = 'distribuicoes.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
    } finally {
      setFullscreenDistribuicoes(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className={`bg-card-bg p-6 rounded-lg shadow-lg relative transition-all duration-300 ${fullscreenDistribuicoes ? 'h-[200vh]' : 'w-[80%] h-[85%]'}`}
      >
        <div className="flex gap-4 mb-2">
          Visualizar
          <button onClick={() => setViewDistribuicoes('p')}>
            <FileSpreadsheet className={`text-${viewDistribuicoes === 'p' ? 'text-bold-color' : 'white'}`} />
          </button>
          <button onClick={() => setViewDistribuicoes('g')}>
            <ChartPie className={`text-${viewDistribuicoes === 'g' ? 'text-bold-color' : 'white'}`} />
          </button>
        </div>
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-xl font-bold dark:text-white">Distribuições</h2>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-button-hover-bg text-black font-bold rounded-full hover:bg-slate-400"
              onClick={baixarImagemDistribuicoes}
            >
              Baixar imagem
            </button>
            <button
              className="px-4 py-2 bg-button-hover-bg text-black font-bold rounded-full hover:bg-slate-400"
              onClick={onClose}
            >
              X
            </button>
          </div>
        </div>
        <div
          ref={distribuicoesRef}
          className={`justify-center items-center mb-4 w-full ${fullscreenDistribuicoes ? '' : 'overflow-y-auto h-[85%]'}`}
        >
          {viewDistribuicoes === 'p' ? (
            <ExcelViewer url={`https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/arquivos?acao=distribuicao&categoria=${categoria}&data=${dataFiltro}`} size={fullscreenDistribuicoes}/>
          ) : (
            <DistribuicaoPage dataFiltro={dataFiltro} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DistribuicoesModal;
