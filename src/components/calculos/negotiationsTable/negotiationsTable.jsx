import { set } from 'date-fns';
import { FunnelX, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export const NegotiationsTable = (categoria, dataFiltro) => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [inputPage, setInputPage] = useState('');
    const [industriaList, setIndustriaList] = useState([]);
    const [selectedIndustriaId, setSelectedIndustriaId] = useState('');
    const [filters, setFilters] = useState({
        id: '', industria: '', data: '', quantidade: '', origem: '', valor: '', aprovado: '', frete: '', mod: ''
    });
    const [industriaSearch, setIndustriaSearch] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [update, setUpdate] = useState(false);
    const [modalNegocio, setModalNegocio] = useState(false);
    const [negociosResumo, setNegociosResumo] = useState([]);

    const fetchData = async (pageNumber, industriaId = '', { categoria, dataFiltro }) => {
        try {
            let url = `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/negocios?pagina=${pageNumber}&paginar=1&categoria=${categoria}&acao=negociosPainel&dataFiltro=${dataFiltro}`;
            if (industriaId) {
                url += `&industriaId=${industriaId}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Erro ao buscar os dados');
            const result = await response.json();
            setData(result.resultado || []);
            setTotalPages(result.paginas || 1);

            if (industriaList.length === 0) {
                const industriaRequest = await fetch(
                    `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/industrias/resultados?obter=listar`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const industriaData = await industriaRequest.json();
                if (!industriaRequest.ok) throw new Error('Erro ao buscar as indústrias');
                setIndustriaList(industriaData.resultado.retorno || []);
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    useEffect(() => {
        fetchData(page, selectedIndustriaId, categoria);
    }, [page, selectedIndustriaId, categoria, dataFiltro]);

    useEffect(() => {
        const handleChartClick = async (event) => {
            const { industria, id } = event.detail;

            const response = await fetch(
                `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/negocios?acao=buscarPorId&id=${id}&completo=0`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (!response.ok) {
                console.error('Erro ao buscar dados por ID');
                return;
            }

            const result = await response.json();
            const negocioData = result.resultado;

            const industriaSelecionada = industriaList.find(i => i.nome === industria);
            const industriaId = industriaSelecionada?.id || '';

            setSelectedIndustriaId(industriaId);
            setData([negocioData]);
            //    setFilters({
            //         id: negocioData.id?.toString() || '',
            //         industria: industria, // já validado pelo `industriaList`
            //         data: dayjs(negocioData.data).format('YYYY'), // ou outro formato que seu dropdown aceite
            //         quantidade: String(Number(negocioData.quantidade)), // certifique-se que bate com dropdown
            //         origem: negocioData.origem || '',
            //         valor: String(Number(negocioData.valor)), // evite float com vírgula
            //         aprovado: String(negocioData.aprovado === true ? 1 : 0),
            //         frete: negocioData.frete || '',
            //         mod: negocioData.modalidade || '',
            //         });

            // setPage(1);
        };

        window.addEventListener('chartPointClick', handleChartClick);
        return () => window.removeEventListener('chartPointClick', handleChartClick);
    }, []);


    useEffect(() => {
        const handleAlertInfoClick = (event) => {
            const { id, origem, destino, ufOrigem, ufDestino, log } = event.detail;

            setFilters((prev) => ({
                ...prev,
                id,
                origem,
                destino,
                ufOrigem,
                ufDestino,
                log,
            }));
        };

        window.addEventListener('alertInfoClick', handleAlertInfoClick);
        return () => window.removeEventListener('alertInfoClick', handleAlertInfoClick);
    }, []);

    const negotiationModal = async (id) => {
        try {
            const response = await fetch(
                `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/negocios?acao=buscarPorId&id=${id}&completo=1`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (!response.ok) throw new Error('Erro ao buscar dados por ID');
            const result = await response.json();
            const negocioData = result.resultado;
            setNegociosResumo([negocioData]);

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));

        if (field === 'industria') {
            const industriaSelecionada = industriaList.find(i => i.nome === value);
            const industriaId = industriaSelecionada?.id || '';
            setSelectedIndustriaId(industriaId);
            setPage(1); // Reinicia para página 1 ao trocar filtro
        }
    };

    const getUniqueValues = (field) => {
        return [...new Set(data.map(item => item[field]))].filter(v => v !== undefined);
    };

    const filteredData = data.filter(row =>
        (filters.id ? row.id.toString() === filters.id : true) &&
        (filters.industria ? row.industria === filters.industria : true) &&
        (filters.data ? row.data === filters.data : true) &&
        (filters.quantidade ? row.quantidade?.toString() === filters.quantidade : true) &&
        (filters.origem ? row.origem === filters.origem : true) &&
        (filters.valor ? row.valor?.toString() === filters.valor : true) &&
        (filters.aprovado !== '' ? row.aprovado === (filters.aprovado === 'true') : true) &&
        (filters.frete ? row.frete?.toString() === filters.frete : true) &&
        (filters.mod ? row.mod?.toString() === filters.mod : true)
    );

    const renderIndustriaSearch = () => (
        <div className="flex mb-4 text-white">
            <select
                className="w-[50%] h-[35px] mt-2 ml-2 px-1 bg-quaternary rounded text-white"
                value={filters.industria}
                onChange={(e) => handleFilterChange('industria', e.target.value)}
                placeholder="Buscar indústria..."
            >
                <option value="">Todas</option>
                {industriaList
                    .filter(i => i.nome.toLowerCase().includes(industriaSearch.toLowerCase()))
                    .map((ind) => (
                        <option key={ind.id} value={ind.nome}>{ind.nome}</option>
                    ))}
            </select>

            <div className="flex items-center ml-2">
                <button
                    onClick={ClearFilters}
                    title='Limpar filtros'>
                    <FunnelX />
                </button>
            </div>
            <div className="flex justify-center items-center ml-2">
                {(categoria.categoria).toUpperCase()}
            </div>
            <div className=" justify-end flex w-full">
                <button
                    onClick={() => {
                        setEditMode(!editMode)
                        handleSave()
                    }}
                    className={`${editMode ? 'bg-red-600' : 'bg-blue-600'} px-4 py-2 rounded text-white `}
                >
                    {editMode ? 'Salvar' : 'Editar'}
                </button>
            </div>
        </div>
    );

    const renderSelect = (field) => (
        <select
            className="w-full px-1 bg-quaternary rounded text-white"
            value={filters[field]}
            onChange={(e) => handleFilterChange(field, e.target.value)}
        >
            <option value="">Todos</option>
            {getUniqueValues(field).map((val, idx) => (
                <option key={idx} value={val}>
                    {typeof val === 'boolean' ? (val ? 'Sim' : 'Não') : val}
                </option>
            ))}
        </select>
    );

    const handlePageInput = () => {
        const parsed = parseInt(inputPage, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
            setPage(parsed);
            setInputPage('');
        }
    };

    const renderPagination = () => (
        <div className="flex flex-wrap justify-center items-center gap-2 py-3 text-white">
            <button onClick={() => setPage(1)} className="bg-tertiary px-3 py-1 rounded" disabled={page === 1}>Primeira</button>
            <button onClick={() => page > 1 && setPage(page - 1)} className="bg-tertiary px-3 py-1 rounded" disabled={page === 1}>Anterior</button>
            <span className="text-white">Página {page} de {totalPages}</span>
            <button onClick={() => page < totalPages && setPage(page + 1)} className="bg-tertiary px-3 py-1 rounded" disabled={page === totalPages}>Próxima</button>
            <button onClick={() => setPage(totalPages)} className="bg-tertiary px-3 py-1 rounded" disabled={page === totalPages}>Última</button>

            <div className="flex items-center gap-1 ml-4">
                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    className="w-20 px-2 py-1 rounded bg-tertiary text-white border border-gray-600"
                    placeholder="Página"
                />
                <button onClick={handlePageInput} className="bg-blue-600 px-4 py-1 rounded text-white">Ir</button>
            </div>
        </div>
    );

    // Estado para armazenar os dados editados
    const [editedRows, setEditedRows] = useState({});

    // Função para lidar com mudanças nos inputs editáveis
    const handleEditChange = (index, field, value) => {
        setEditedRows(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [field]: value
            }
        }));
    };

    const ClearFilters = () => {
        setIndustriaSearch('');
        setSelectedIndustriaId('');
        setFilters({
            id: '', industria: '', data: '', quantidade: '', origem: '', valor: '', aprovado: '', frete: '', mod: ''
        });
        fetchData(page, selectedIndustriaId, categoria);
        setPage(1);

    }

    const updateDataApi = async (updatedData) => {
        try {
            const response = await fetch('https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/negocios?acao=atualizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ negocios: updatedData }),
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar os dados');
            }

            response.ok ? setUpdate(true) : setUpdate(false);
            // Limpa o estado de atualização após 3 segundos
            setTimeout(() => setUpdate(false), 3000);

            const result = await response.json();

            console.log('Dados atualizados com sucesso:', result);
        } catch (error) {
            console.error('Erro ao atualizar os dados:', error);
        }
    };

    // Função para salvar os dados editados no array principal (data)
    const handleSave = () => {
        const updatedData = data.map((item, idx) => {
            if (editedRows[idx]) {
                return { ...item, ...editedRows[idx] };
            }
            return item;
        });
        setData(updatedData);
        // Envia os dados editados para a API
        Object.entries(editedRows).forEach(([index, changes]) => {
            const itemToUpdate = { ...data[index], ...changes };
            updateDataApi(itemToUpdate);
        });
        // Limpa os dados editados e sai do modo edição
        setEditedRows({});
    };

    return (
        <div className="flex flex-col w-full md:w-3/5 bg-gradient-to-br from-[#2A3529] to-[#1A1F1A] rounded-lg">
            {update && (
                <div className="bg-green-500 text-white p-2 rounded">
                    Dados atualizados com sucesso!
                </div>
            )}

            {renderIndustriaSearch()}

            <div className="w-full overflow-x-auto">
                <table className="min-w-[700px] w-full text-sm text-left text-white">
                    <thead className="bg-tertiary border-b border-gray-600 text-center sticky top-0">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Indústria</th>
                            <th className="px-4 py-2">Data do negócio</th>
                            <th className="px-4 py-2">Quantidade</th>
                            <th className="px-4 py-2">Origem</th>
                            <th className="px-4 py-2">Valor</th>
                            <th className="px-4 py-2">Aprovado</th>
                            <th className="px-4 py-2">Frete</th>
                            <th className="px-4 py-2">Mod</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                        <tr>
                            <th className="px-4 py-1">{renderSelect('id')}</th>
                            <th className="px-4 py-1">{renderSelect('industria')}</th>
                            <th className="px-4 py-1">{renderSelect('data')}</th>
                            <th className="px-4 py-1">{renderSelect('quantidade')}</th>
                            <th className="px-4 py-1">{renderSelect('origem')}</th>
                            <th className="px-4 py-1">{renderSelect('valor')}</th>
                            <th className="px-4 py-1">{renderSelect('aprovado')}</th>
                            <th className="px-4 py-1">{renderSelect('frete')}</th>
                            <th className="px-4 py-1">{renderSelect('modalidade')}</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {filteredData.map((item, i) => (
                            <tr key={i} className="border-b border-gray-700">
                                <td className="px-4 text-xs py-2">{item.id}</td>
                                <td className="px-4 py-2">{item.industria}</td>
                                <td className="px-4 text-xs py-2">
                                    {editMode ? (
                                        <input
                                            className='bg-transparent border'
                                            type='text'
                                            defaultValue={item.data}
                                            onChange={e => handleEditChange(i, 'data', e.target.value)}
                                        />
                                    ) : (
                                        item.data
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {editMode ? (
                                        <input
                                            className='bg-transparent border'
                                            type='text'
                                            defaultValue={item.quantidade}
                                            onChange={e => handleEditChange(i, 'quantidade', e.target.value)}
                                        />
                                    ) : (
                                        item.quantidade
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {editMode ? (
                                        <input
                                            className='bg-transparent border'
                                            type='text'
                                            defaultValue={item.origem}
                                            onChange={e => handleEditChange(i, 'origem', e.target.value)}
                                        />
                                    ) : (
                                        item.origem
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {editMode ? (
                                        <input
                                            className='bg-transparent border'
                                            type='text'
                                            defaultValue={item.valor}
                                            onChange={e => handleEditChange(i, 'valor', e.target.value)}
                                        />
                                    ) : (
                                        item.valor
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {editMode ? (
                                        <input
                                            className='bg-transparent border'
                                            type='text'
                                            defaultValue={item.aprovado}
                                            onChange={e => handleEditChange(i, 'aprovado', e.target.value)}
                                        />
                                    ) : (
                                        item.aprovado
                                    )}
                                </td>
                                <td>
                                    {editMode ? (
                                        <input
                                            className='bg-transparent border'
                                            type='text'
                                            defaultValue={item.frete}
                                            onChange={e => handleEditChange(i, 'frete', e.target.value)}
                                        />
                                    ) : (
                                        item.frete
                                    )}
                                </td>
                                <td>
                                    {editMode ? (
                                        <input
                                            className='bg-transparent border'
                                            type='text'
                                            defaultValue={item.modalidade}
                                            onChange={e => handleEditChange(i, 'modalidade', e.target.value)}
                                        />
                                    ) : (
                                        item.modalidade
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => { setModalNegocio(true); negotiationModal(item.id); }}>
                                        <Info />
                                    </button>

                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center text-gray-400 py-4">
                                    Nenhum resultado encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {renderPagination()}
            {modalNegocio && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#1f2a24] p-6 rounded-2xl shadow-2xl w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center w-full mb-4">
                            <h2 className="text-xl font-bold text-white">📝 Detalhes do Negócio</h2>
                            <button className="px-4 py-2 bg-button-hover-bg text-black font-bold rounded-full hover:bg-slate-400" onClick={() => { setModalNegocio(false) }}>X</button>
                        </div>
                        {negociosResumo.map((negocio, index) => {
                            const bonusParsed = negocio.bonus ? JSON.parse(negocio.bonus) : {};
                            return (
                                <div key={index} className="bg-card-bg p-5 rounded-xl text-white grid grid-cols-1 md:grid-cols-2 gap-4 border border-green-900">
                                    <p><strong>ID:</strong> {negocio.idNegocio}</p>
                                    <p><strong>Indústria:</strong> {negocio.industria}</p>
                                    <p><strong>Recebimento:</strong> {dayjs(negocio.dtRecebimento).format('DD/MM/YYYY HH:mm')}</p>
                                    <p><strong>Aprovação:</strong> {negocio.dtAprovacao ? dayjs(negocio.dtAprovacao).format('DD/MM/YYYY') : '—'}</p>
                                    <p><strong>Data Negócio:</strong> {dayjs(negocio.dtNegocio).format('DD/MM/YYYY')}</p>
                                    <p><strong>Data Abate:</strong> {dayjs(negocio.dtAbate).format('DD/MM/YYYY')}</p>
                                    <p><strong>Quantidade:</strong> {negocio.quantidade}</p>
                                    <p><strong>Operação:</strong> {negocio.operacao === 'C' ? 'Compra' : 'Venda'}</p>
                                    <p><strong>Modalidade:</strong> {negocio.modalidade === 'B' ? 'Balcão' : 'Termo'}</p>
                                    <p><strong>Categoria:</strong> {negocio.categoria_name}</p>
                                    <p><strong>Origem:</strong> {negocio.origem} - {negocio.origemUf}</p>
                                    <p><strong>Destino:</strong> {negocio.destino} - {negocio.destinoUf}</p>
                                    <p><strong>Planta:</strong> {negocio.planta_name}</p>
                                    <p><strong>Frete:</strong> {negocio.frete}</p>
                                    <p><strong>Dias Pagos:</strong> {negocio.diasPgto} dias</p>
                                    <p><strong>Valor Base:</strong> R$ {Number(negocio.valorBase).toFixed(2)}</p>
                                    <p><strong>Valor Original:</strong> R$ {Number(negocio.valorOriginal).toFixed(2)}</p>
                                    <p><strong>Aprovado:</strong> {negocio.aprovado === 1 ? 'Sim' : (negocio.aprovado === -1 ? 'PA' : 'Não')}</p>
                                    <p><strong>Bônus:</strong> {bonusParsed.bonus || '—'} {bonusParsed.vbonus ? `- R$ ${bonusParsed.vbonus}` : ''}</p>
                                </div>
                            );
                        })}

                        <div className="flex justify-end gap-3 mt-6">
                            {/* <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => setModalNegocio(false)}
            >
            Fechar
            </button> */}
                            <button
                                className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400 transition"
                                onClick={() => {
                                    // Coloque aqui o gatilho para edição (ex: abrir outro modal)
                                    console.log("Editar negócio");
                                }}
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
