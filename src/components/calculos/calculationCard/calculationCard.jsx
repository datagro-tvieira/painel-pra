import React, { useEffect, useState } from 'react'
import { Calculator, ChartPie, FileChartColumnIncreasing, FileDown, FileSpreadsheet, SquareActivity } from 'lucide-react';
import ExcelViewer from './excelViewer';
import { DistribuicaoPage } from '../../../routes/distribuicao/page';
import { Atom } from 'react-loading-indicators';
import { da, se } from 'date-fns/locale';
import dayjs from 'dayjs';
import domtoimage from 'dom-to-image'; 
import { useInterval } from 'react-use';

export const CalculationCard = ({categoria, dataFiltro}) => {
    const [Ufs, setUFs] = useState(['SP', 'GO', 'MG', 'MS', 'MT', 'PA', 'RO', 'TO', 'BA']);
    const [UFSelecionada, setUFSelecionada] = useState('SP');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resultados, setResultados] = useState({});
    const [calcular, setCalcular] = useState (false);
    const [erro, setErro] = useState(false);
    const [mensagemCalculo, setMensagemCalculo] = useState(false);
    const [mensagemPersistir, setMensagemPersistir] = useState(false);
    const [loading, setLoading] = useState(false);
    const [outlier, setOutlier] = useState(true);
    const [distribuicoes, setDistribuicoes] = useState(false);
    const [colapsos, setColapsos] = useState({});
    const [viewDistribuicoes, setViewDistribuicoes] = useState('p');
    const [simulacao, setSimulacao] = useState([]);
    const distribuicoesRef = React.useRef();
    const [fullscreenDistribuicoes, setFullscreenDistribuicoes] = useState(false);

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

    const baixarImagemDistribuicoes = async () => {
        if (!distribuicoesRef.current) return;

        try {
            // 1. Expandir modal
            setFullscreenDistribuicoes(true);

            // 2. Espera o layout aplicar
            await new Promise(requestAnimationFrame);

            // 3. Gera imagem
            const dataUrl = await domtoimage.toPng(distribuicoesRef.current);

            // 4. Baixa a imagem
            const link = document.createElement('a');
            link.download = 'distribuicoes.png';
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
        } finally {
            // 5. Volta ao estado normal
            setFullscreenDistribuicoes(false);
        }
        };


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
    const closeModalCalcular = () => { setCalcular(false); setErro(false); setMensagemCalculo(false); setOutlier(true); setSimulacao([]); setMensagemPersistir(false); };

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
            {calcular && dataFiltro == dayjs().format('YYYY-MM-DD') && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className=" bg-card-bg p-6 rounded-lg shadow-lg w-[80%]">
                        <div className="flex justify-between items-center w-full mb-4">
                            <h2 className="text-xl font-bold text-white">Simulação de Cálculo</h2>
                            <button className="px-4 py-2 bg-button-hover-bg text-black font-bold rounded-full hover:bg-slate-400" onClick={closeModalCalcular}>X</button>
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
                            onClick={async () => {
                                try {
                                    setSimulacao([]);
                                    setMensagemCalculo(false);
                                    setLoading(true);
                                    setMensagemPersistir(false);

                                    const response = await fetch (
                                        `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/calcular?obter=calcular&outlier=${outlier === true ? 1 : 0}&uf=${UFSelecionada}&resumo=1`,
                                        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
                                    );
                                    setLoading(false);
                                    if (!response.ok) setErro(true);
                                    const result = await response.json();                                   
                                    setSimulacao(result || []);

                                    if (!erro) setMensagemCalculo(true);
                                } catch (error) {
                                    setLoading(false);
                                    console.error('Erro ao calcular:', error);
                                }
                            }}
                        >
                            {loading ? '' : 'Simular'}
                        </button>
                        
                        {simulacao?.output && (
                            <a
                                className="px-4 py-2 text-button-hover-bg font-bold rounded-full hover:cursor-pointer hover:underline mt-2 "
                                onClick={async () => {
                                        setSimulacao([]);
                                        setMensagemCalculo(false);
                                        setLoading(true);
                                        
                                        const response = await fetch (
                                        `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/calcular?obter=calcular&outlier=${outlier === true ? 1 : 0}&uf=${UFSelecionada}&resumo=0`,
                                        { method: 'GET', headers: { 'Content-Type': 'application/json' } });

                                        if (!response.ok) setErro(true);
                                        setLoading(false);
                                        setMensagemPersistir(true);
                                    }}
                             >
                                Persistir cálculo
                            </a>
                        )}

                    { mensagemPersistir && (
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
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-card-bg  p-6 rounded-lg shadow-lg w-[50%]">
                        <div className="flex justify-between items-center w-full mb-4">
                            <h2 className="text-xl font-bold dark:text-white">Histórico detalhado</h2>
                            <button className="px-4 py-2 bg-button-hover-bg text-black font-bold rounded-full hover:bg-slate-400" onClick={closeModal}>X</button>
                        </div>
                        <div className="overflow-y-auto h-96">
                            {resultados[UFSelecionada]?.log?.split('\n').map((line, idx) => (
                                <p key={idx} className="text-base text-gray-300 my-1">{line}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {distribuicoes && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div
                className={`
                    bg-card-bg p-6 rounded-lg shadow-lg relative transition-all duration-300
                    ${fullscreenDistribuicoes ? 'h-[200vh]' : 'w-[80%] h-[85%]'}
                `}
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
                        onClick={closeMadalDistribuicoes}
                    >
                        X
                    </button>
                    </div>
                </div>
                <div
                    ref={distribuicoesRef}
                    className={`
                    justify-center items-center mb-4 w-full
                    ${fullscreenDistribuicoes ? '' : 'overflow-y-auto h-[85%]'}
                    `}
                >
                    {viewDistribuicoes === 'p' ? (
                    <ExcelViewer url={`https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/arquivos?acao=distribuicao&categoria=${categoria}&data=${dataFiltro}`} size={fullscreenDistribuicoes}/>
                    ) : (
                    <DistribuicaoPage dataFiltro={dataFiltro} />
                    )}
                </div>
                </div>
            </div>
            )}

            <div className='flex flex-col  mt-6 bg-card-bg relative '> 
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

                <div className="flex flex-wrap md:flex-nowrap bg-card-bg rounded-lg gap-2 p-4 justify-center md:justify-start ">
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

            </div>

        </>
    );
};