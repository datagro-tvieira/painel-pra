import React from 'react';
import { Atom } from 'react-loading-indicators';

const SimulacaoModal = ({
  show,
  onClose,
  UFSelecionada,
  outlier,
  setOutlier,
  categoria,
  simulacao,
  setSimulacao,
  mensagemPersistir,
  setMensagemPersistir,
  setLoading,
  loading,
  setErro,
  erro,
}) => {
  if (!show) return null;

  const handleSimular = async (persistir = false) => {
    try {
      setSimulacao([]);
      setMensagemPersistir(false);
      setLoading(true);

      const response = await fetch(
        `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/calcular?obter=calcular&outlier=${outlier === true ? 1 : 0}&uf=${UFSelecionada}&resumo=${persistir ? 0 : 1}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      setLoading(false);
      if (!response.ok) setErro(true);
      const result = await response.json();

      setSimulacao(result || []);
      if (persistir) {
        setMensagemPersistir(true);
      }
    } catch (error) {
      setLoading(false);
      console.error('Erro ao calcular:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className=" bg-card-bg p-6 rounded-lg shadow-lg w-[80%]">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-xl font-bold text-white">Simulação de Cálculo</h2>
          <button className="px-4 py-2 bg-button-hover-bg text-black font-bold rounded-full hover:bg-slate-400" onClick={onClose}>X</button>
        </div>
        <div className='flex flex-wrap md:flex-nowrap space-x-2 mb-6 w-full md:w-1/2'>
          <span className='font-bold'> {UFSelecionada} {outlier ? 'com outliers' : 'sem outliers'}  </span>
          <button
            className={`px-4 rounded-full font-bold ${outlier ? 'bg-button-hover-bg text-black' : 'bg-[#F5F5DC] text-black hover:bg-button-hover-bg hover:text-black'}`}
            onClick={() => setOutlier(!outlier)}>
            {outlier ? 'Ativado' : 'Desativado'}
          </button>
        </div>
        <p className="text-base text-white mb-4">Deseja recalcular os dados para <span className="font-bold"> {UFSelecionada} </span> - <span className="font-bold">{categoria.toUpperCase()}</span> {outlier ? 'COM Outliers' : 'SEM Outliers'} ?</p>
        <button
          className={`${loading ? 'hidden' : ''} px-4 py-2 bg-text-bold-color text-black font-bold rounded-full hover:bg-slate-400`}
          onClick={() => handleSimular(false)}
        >
          {loading ? '' : 'Simular'}
        </button>

        {simulacao?.output && (
          <a
            className="px-4 py-2 text-button-hover-bg font-bold rounded-full hover:cursor-pointer hover:underline mt-2 "
            onClick={() => handleSimular(true)}
          >
            Persistir cálculo
          </a>
        )}

        {mensagemPersistir && (
          <div className="text-button-hover-bg mt-4">
            <p>ATENÇÃO: VALOR ATUALIZADO!</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center mt-4">
            <Atom color="#FFD700" size="medium" text="calculando..." textColor="" />
          </div>
        )}

        {erro && (
          <div className="text-red-500 mt-4">
            <p>Erro ao simular. Tente novamente mais tarde.</p>
          </div>
        )}

        {simulacao?.output && (
          <div className="mt-4 px-2">
            <h3 className="text-lg font-bold text-white mb-4">Simulação</h3>

            <div className="overflow-x-auto pb-2">
              <div
                className="
                                flex space-x-4
                                w-full
                                pb-2
                                "
              >
                {Object.entries(simulacao.output).flatMap(([uf, codigos]) =>
                  Object.entries(codigos).map(([codigo, item]) => (
                    <div
                      key={codigo}
                      className="
                                        bg-[#1f2937]
                                        rounded-lg
                                        px-4 py-3
                                        shadow
                                        hover:shadow-md
                                        transition
                                        duration-300
                                        min-w-[220px]
                                        text-left
                                        flex-shrink-0
                                    "
                    >
                      <div className="border-b border-gray-600 pb-1 mb-2">
                        <h4 className="text-white text-base font-semibold truncate">{codigo}</h4>
                        <div className="flex justify-between items-center gap-1 mt-3">
                          <div className="flex gap-1">
                            <p className="text-xs">{item.display === "b" ? "Bônus "+ (item.categoria).toUpperCase() : (item.categoria).toUpperCase()},</p>
                            <p className="text-xs">{(uf).toUpperCase()}</p>
                            <p className="text-xs">{(item.regiao || "").toUpperCase()}</p>
                          </div>
                          <p className="text-xs">{item.data}</p>
                        </div>
                      </div>

                      <div className='flex flex-col items-center mb-2'>
                        <p className="text-white text-xl font-semibold">{item.indicador?.toFixed(2) ?? 'N/A'}</p>
                      </div>

                      <div className="text-gray-300 text-sm space-y-1 break-words">
                        <div className="flex justify-between">
                          <span className="font-semibold">Min:</span>
                          <span>{item.min?.toFixed(4) ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Max:</span>
                          <span>{item.max?.toFixed(4) ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Desvio Padrão:</span>
                          <span>{item.desvioPadrao?.toFixed(4) ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Outliers:</span>
                          <span>{item.outliers ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Cap:</span>
                          <span className="text-right">
                            {item.cap == null
                              ? 'N/A'
                              : Array.isArray(item.cap)
                                ? (item.cap.length ? item.cap.join(', ') : '[]')
                                : typeof item.cap === 'object'
                                  ? Object.entries(item.cap).map(([key, val]) => `${key}: ${(val).toFixed(4)}`).join(', ')
                                  : item.cap}
                          </span>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulacaoModal;
