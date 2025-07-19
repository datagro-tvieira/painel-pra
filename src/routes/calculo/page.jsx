import React, { useEffect, useState } from 'react';
import { ScatterChart } from '@/components/calculos/charts/scatterChart';
import { CalculationCard } from '@/components/calculos/calculationCard/calculationCard';
import { NegotiationsTable } from '@/components/calculos/negotiationsTable/negotiationsTable';
import { Warning } from '@/components/calculos/warning/warning';
import { Eye, EyeClosed } from 'lucide-react';
import CustomInput from '../../components/relatorios/calendar/DateInput';
import dayjs from 'dayjs';

export const CalculoPage = () => {
  const [categoria, setCategoria] = useState('boi');
  const [showArquivos, setShowArquivos] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD');

  return (
    <>
      <div className="flex flex-col bg-primary text-white p-6 min-h-full ">

        <div className="flex flex-wrap gap-6 md:flex-nowrap justify-center flex-1">
          {/* Gráfico - ocupa tudo se a tabela não estiver visível */}
          <div className={`${showArquivos ? 'md:w-2/5' : 'w-full'} bg-card-bg rounded-lg p-2 flex items-center justify-center grow`}>
            <div className="w-full ">
              <ScatterChart categoria={categoria} dataFiltro={dataSelecionada} />
            </div>
          </div>

          {showArquivos && (
            <>
              {/* Tabela - 3/5 da largura */}
              <NegotiationsTable categoria={categoria} dataFiltro={dataSelecionada} />
            </>
          )}
        </div>
        <CalculationCard categoria={categoria} dataFiltro={dataSelecionada} />
      </div>

      <button
        id="floating-button"
        className="fixed bottom-4 right-4 z-50 bg-[#394B74] hover:bg-[#0B0E1A] text-white p-4 rounded-full shadow-lg"
        onClick={() => setShowMenu(!showMenu)}
      >
        ☰
      </button>

      {showMenu && (
        <div
          id="floating-menu"
          className="fixed bottom-20 md:bottom-4 right-4 md:right-20 z-50 bg-tertiary rounded-lg shadow-lg px-4 py-2 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3"
        >
          <button
            className={`${categoria === 'boi' ? 'bg-text-bold-color font-bold' : 'text-black font-bold'} bg-[#F5F5DC] rounded-xl p-2 text-sm`}
            onClick={() => setCategoria('boi')}
            title="Boi"
          >
            BOI
          </button>
          <button
            className={`${categoria === 'vaca' ? 'bg-text-bold-color font-bold' : 'text-black font-bold'} bg-[#F5F5DC] rounded-xl p-2 text-sm`}
            onClick={() => setCategoria('vaca')}
            title="Vaca"
          >
            VACA
          </button>
          <button
            className={`${categoria === 'novilha' ? 'bg-text-bold-color font-bold' : 'text-black font-bold'} bg-[#F5F5DC] rounded-xl p-2 text-sm`}
            onClick={() => setCategoria('novilha')}
            title="Novilha"
          >
            NOVILHA
          </button>

          {dayjs(dataSelecionada).isSame(dayjs(), 'day') ? (
            <span className="bg-red-600 rounded-full w-3 h-3 animate-pulse"></span>
          ) : (
            <button
              onClick={() => setDataSelecionada(dayjs().format('YYYY-MM-DD'))}
              className="text-white underline text-sm"
              title="Voltar para hoje"
            >
              🔴
            </button>
          )}

          <CustomInput
            onDateChange={(date) => setDataSelecionada(formatDate(date))}
            value={dataSelecionada}
            className="w-24 text-black rounded"
          />

          <button
            className="text-white"
            onClick={() => setShowArquivos(!showArquivos)}
            title={showArquivos ? "Ocultar Arquivos" : "Mostrar Arquivos"}
          >
            {showArquivos ? <Eye /> : <EyeClosed />}
          </button>
        </div>
      )}
      
      <Warning />
    </>
  );
};
