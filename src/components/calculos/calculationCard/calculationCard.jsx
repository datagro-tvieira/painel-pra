import React, { useEffect, useState } from 'react';
import { Calculator, FileChartColumnIncreasing, FileDown, RefreshCcw, SquareActivity } from 'lucide-react';
import { Atom } from 'react-loading-indicators';
import dayjs from 'dayjs';
import { useInterval } from 'react-use';
import SimulacaoModal from './simulacaoModal/simulacaoModal';
import HistoricoModal from './historicoModal/historicoModal';
import DistribuicoesModal from './distribuicoesModal/distribuicoesModal';

export const CalculationCard = ({categoria, dataFiltro}) => {
    const [Ufs, setUFs] = useState(['SP', 'GO', 'MG', 'MS', 'MT', 'PA', 'RO', 'TO', 'BA']);
    const [UFSelecionada, setUFSelecionada] = useState('SP');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resultados, setResultados] = useState({});
    const [calcular, setCalcular] = useState (false);
    const [erro, setErro] = useState(false);
    const [mensagemPersistir, setMensagemPersistir] = useState(false);
    const [loading, setLoading] = useState(false);
    const [outlier, setOutlier] = useState(true);
    const [distribuicoes, setDistribuicoes] = useState(false);
    const [colapsos, setColapsos] = useState({});
    const [simulacao, setSimulacao] = useState([]);

    const fetchData = async (categoria, dataFiltro) => {
        try {
            const response = await fetch(
                `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/indicador/resultados?obter=calculos&categoria=${categoria}&dataFiltro=${dataFiltro}`,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );
            if (!response.ok) throw new Error('Erro ao buscar dados');
            const result = await response.json();
            setUFs(Object.keys(result.retorno || {}));
            setResultados(result.retorno || {});
        } catch (error) {
            console.error('Erro ao carregar dados para o gráfico:', error);
        }
    }

    const datasFormatadas = (datasObj) => {
        if (!datasObj) return [];
        try {
            const obj = typeof datasObj === 'string' ? JSON.parse(datasObj) : datasObj;
            return Object.entries(obj).map(([dia, valor]) => ({ dia, valor }));
        } catch {
            return [];
        }
    };

    const capFormatado = (capObj) => {
        if (!capObj) return [];
        try {
            const obj = typeof capObj === 'string' ? JSON.parse(capObj) : capObj;
            return Object.entries(obj).map(([industria, valor]) => ({ industria, valor }));
        } catch {
            return [];
        }
    }

    useInterval(() => {
        fetchData(categoria, dataFiltro);
        console.log('5min');
    }, 300000);

    useEffect(() => {
        fetchData(categoria, dataFiltro);
        console.log('Atualizado');
    }, [categoria, loading, dataFiltro]);

    const historicModal = () => setIsModalOpen(true);

    const calcularModal = () => dataFiltro == dayjs().format('YYYY-MM-DD') ? setCalcular(true) : setCalcular(false);
    const closeModalCalcular = () => { setCalcular(false); setErro(false); setOutlier(true); setSimulacao([]); setMensagemPersistir(false); };

    const closeModal = () => setIsModalOpen(false);
    const closeMadalDistribuicoes = () => setDistribuicoes(false);

    const toggleColapso = (uf) => {
        setColapsos((prev) => ({ ...prev, [uf]: !prev[uf] }));
    };

    // Agrupar UFs raiz e sub-UFs
    const ufAgrupadas = React.useMemo(() => {
        const grupos = {};
        Object.keys(resultados || {}).forEach((uf) => {
            const [raiz] = uf.split('-');
            if (!grupos[raiz]) grupos[raiz] = [];
            if (uf !== raiz) grupos[raiz].push(uf);
        });
        return grupos;
    }, [resultados]);

    return (
        <>
            <SimulacaoModal
                show={calcular && dataFiltro == dayjs().format("YYYY-MM-DD")}
                onClose={closeModalCalcular}
                UFSelecionada={UFSelecionada}
                outlier={outlier}
                setOutlier={setOutlier}
                categoria={categoria}
                simulacao={simulacao}
                setSimulacao={setSimulacao}
                mensagemPersistir={mensagemPersistir}
                setMensagemPersistir={setMensagemPersistir}
                setLoading={setLoading}
                loading={loading}
                setErro={setErro}
                erro={erro}
            />

            <HistoricoModal
                show={isModalOpen}
                onClose={closeModal}
                log={resultados[UFSelecionada]?.log}
            />

            <DistribuicoesModal
                show={distribuicoes}
                onClose={closeMadalDistribuicoes}
                categoria={categoria}
                dataFiltro={dataFiltro}
            />

            <div className='flex flex-col  mt-6 bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] relative '> 
                <div className='flex flex-wrap items-center justify-between px-4 '>
                    <div className='flex flex-wrap gap-2 my-2 items-start'>
                        {Object.entries(ufAgrupadas).map(([ufBase, subUfs]) => {
                            const isSelecionada = UFSelecionada === ufBase;
                            const hasSubUfs = subUfs.length > 0;
                            const isColapsado = colapsos[ufBase];

                            return (
                                <div key={ufBase} className="relative flex flex-col items-start mb-2 text-black">
                                    <button
                                        className={`w-[40px] h-[32px]  rounded-lg transition-colors ${UFSelecionada === ufBase ? 'bg-button-hover-bg text-black' : 'bg-[#F5F5DC] hover:bg-button-hover-bg hover:text-black'}`}
                                        onClick={() => {
                                            if (hasSubUfs) {
                                                toggleColapso(ufBase);
                                            } else {
                                                setUFSelecionada(ufBase);
                                            }
                                        }}
                                        >
                                        <span className="text-sm font-bold flex items-center justify-center">
                                            {hasSubUfs && <span className="mr-1">{isColapsado ? '▾' : '▸'}</span>}
                                            {ufBase}
                                        </span>
                                    </button>

                                    {hasSubUfs && isColapsado && (
                                        <div className="absolute top-[36px] left-0 bg-[#F5F5DC] text-black rounded shadow-lg z-10 w-max">
                                            {[ufBase, ...subUfs].map((uf) => (
                                                <div
                                                    key={uf}
                                                    className={`px-3 py-1 cursor-pointer hover:bg-button-hover-bg hover:text-black text-sm ${UFSelecionada === uf ? 'bg-button-hover-bg text-black font-bold' : ''
                                                        }`}
                                                    onClick={() => {
                                                        setUFSelecionada(uf);
                                                        toggleColapso(ufBase);
                                                    }}
                                                >
                                                    {uf}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                    <span className="text-white mt-2">Último cálculo em &nbsp; {resultados[UFSelecionada]?.datahora}</span>

                    <div className='flex items-center space-x-1 bg-button-hover-bg rounded-md p-1'>
                        <button title='Atualizar' onClick={async () => {

                            setSimulacao([]);
                            setLoading(true);

                            const response = await fetch(
                                `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/calcular?obter=calcular&outlier=${outlier === true ? 1 : 0}&uf=${UFSelecionada}&resumo=0`,
                                { method: 'GET', headers: { 'Content-Type': 'application/json' } });
                            
                            if (!response.ok) setErro(true);
                            setLoading(false);
                            setMensagemPersistir(true);
                            await fetchData(categoria, dataFiltro);
                        }}>
                        <RefreshCcw className='text-black hover:text-gray-600'/>
                        </button>
                    </div>

                    <div className='flex items-center space-x-1 bg-button-hover-bg rounded-md p-1'>

                        <button title='calcular' onClick={calcularModal}>
                            <Calculator className='text-black hover:text-gray-600' />
                        </button>

                        <button title='Histórico detalhado' onClick={historicModal}>
                            <SquareActivity className='text-black hover:text-gray-600' />
                        </button>
                        <button title='Baixar Memória de cálculo' onClick={() => {
                            const link = document.createElement('a');
                            link.href = `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/arquivos?acao=m_calculo&categoria=${categoria}&data=${dataFiltro}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}>
                            <FileDown className='text-black hover:text-gray-600' />
                        </button>

                        <button title='Distribuições' onClick={() => { setDistribuicoes(true) }}>
                            <FileChartColumnIncreasing className='text-black hover:text-gray-600' />
                        </button>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center mb-4">
                        <Atom color="#FFD700" size="medium" text="Atualizando..." textColor="" />
                    </div>
                ) :(
                <div className="flex flex-wrap md:flex-nowrap bg-transparent rounded-lg gap-2 p-4 justify-center md:justify-start ">
                    {[
                        { titulo: 'Negócios', valor: resultados[UFSelecionada]?.negocios },
                        { titulo: 'Outliers', valor: resultados[UFSelecionada]?.outliers },
                        { titulo: 'Escala', valor: '18,03' },
                        { titulo: 'Desvio Padrão', valor: resultados[UFSelecionada]?.dp?.toFixed(2) },
                    ].map((item, idx) => (
                        <>
                        <div key={idx} className='w-full sm:w-40 md:w-40 lg:w-36 h-24 text-center bg-white dark:bg-transparent border border-gray-200 dark:border-none rounded shadow-sm'>
                            <span className="block text-md font-bold text-gray-900 dark:text-white">{item.titulo}</span>
                            <p className="text-2xl md:text-xl lg:text-2xl text-gray-300 my-4">{item.valor}</p>
                        </div>
                        <div className='border border-gray-200 opacity-10'></div>
                        </>                       
                    ))}
                    {/* Cabecas */}
                    <div className='w-full sm:w-40 md:w-40 lg:w-36 h-24 text-center bg-white dark:bg-transparent border border-gray-200 dark:border-none rounded shadow-sm'>
                        <span className="block text-md font-bold text-gray-900 dark:text-white">Cabeças</span>
                        
                        <div className="rounded-lg p-2 space-y-1 h-20 overflow-y-auto">
                            {[resultados[UFSelecionada]?.cab1, resultados[UFSelecionada]?.cab2, resultados[UFSelecionada]?.cab3].map((valor, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-gray-300">
                                    <span>Cab {idx + 1}</span>
                                    <span className="font-medium">{valor}</span>
                                </div>
                            ))}

                            <div className="border-t border-gray-600 mt-1 pt-1 flex justify-between text-sm dark:text-white font-bold">
                                <span>Total</span>
                                <span>{resultados[UFSelecionada]?.total}</span>
                            </div>
                        </div>
                    </div>
                    <div className='border border-gray-200 opacity-10'></div>

                    {/* Datas */}
                    <div className='w-full sm:w-40 md:w-40 lg:w-36 h-24 text-center bg-white dark:bg-transparent border border-gray-200 dark:border-none rounded shadow-sm'>
                        <span className="block text-md font-bold text-gray-900 dark:text-white">Datas</span>
                        <div className="overflow-y-auto h-20 ">
                            {datasFormatadas(resultados[UFSelecionada]?.datas).map(({ dia, valor }, idx) => (
                                <p key={idx} className="text-sm text-gray-300 my-1">{`${dia}: ${valor}`}</p>
                            ))}
                        </div>
                    </div>
                    <div className='border border-gray-200 opacity-10'></div>

                    {/* Cap */}
                    <div className='w-full sm:w-40 md:w-40 lg:w-36 h-24 text-center bg-white dark:bg-transparent border border-gray-200 dark:border-none rounded shadow-sm'>
                        <span className="block text-md font-bold text-gray-900 dark:text-white">Cap</span>
                        <div className="overflow-y-auto h-20">
                            {capFormatado(resultados[UFSelecionada]?.cap).map(({ industria, valor }, idx) => (
                                <p key={idx} className="text-md text-gray-300 my-1">{`${industria}: ${valor.toFixed(4)}`}</p>
                            ))}
                        </div>
                    </div>
                    <div className='border border-gray-200 opacity-10'></div>

                    {/* Min/Max */}
                    <div className='w-full sm:w-40 md:w-40 lg:w-36 h-24 text-center bg-white dark:bg-transparent border border-gray-200 dark:border-none rounded shadow-sm'>
                        <span className="block text-md font-bold text-gray-900 dark:text-white">Min/Max</span>
                        <div className="overflow-y-auto h-20">
                            <p className="text-md text-gray-300 my-1">Min: {resultados[UFSelecionada]?.min?.toFixed(2)}</p>
                            <p className="text-md text-gray-300 my-1">Max: {resultados[UFSelecionada]?.max?.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className='border border-gray-200 opacity-10'></div>

                    <div className='w-full sm:w-40 md:w-40 lg:w-36 h-24 text-center bg-white dark:bg-transparent border border-gray-200 dark:border-none rounded shadow-sm lg:ml-auto'>
                        <span className="block text-md font-bold text-gray-900 dark:text-white">Indicador {UFSelecionada}</span>
                        <div className="my-1">
                            <p className='text-sm text-text-bold-color'>R$/@</p>
                            <p className="text-2xl md:text-xl lg:text-2xl xl:text-3xl dark:text-text-bold-color">{resultados[UFSelecionada]?.valor.toFixed(2)}</p>
                        </div>
                    </div>

                </div>
                )}
            </div>

        </>
    );
};