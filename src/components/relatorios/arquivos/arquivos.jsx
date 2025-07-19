import React from "react";
import { Download } from "lucide-react";
import CustomInput from "../calendar/DateInput";

const Arquivos = () => {
  const [dataSelecionada, setDataSelecionada] = React.useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [dataSelecionadaMCalculo, setDataSelecionadaMCalculo] = React.useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [industrias, setIndustrias] = React.useState([]);
  const [categorias, setCategorias] = React.useState([]);
  const [ufs, setUfs] = React.useState(['Todas', 'SP', 'MG', 'RS', 'PR', 'GO', 'MT', 'MS']);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/parametros?obter=parametros`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const result = await response.json();
      setIndustrias(result.industrias || []);
      setCategorias(result.categorias || []);
    } catch (error) {
      console.error('Erro ao carregar dados para o gráfico:', error);
    }
  };

  const postData = async () => {
    const params = {
      dataInicio: dataSelecionada,
      parte: document.querySelector('[name="Parte"]')?.value || '',
      categoria: document.querySelector('[name="Categoria"]')?.value || '',
      ufOrigem: document.querySelector('[name="UF Origem"]')?.value || '',
      ufDestino: document.querySelector('[name="UF Destino"]')?.value || '',
      aprovado: document.querySelector('[name="Aprovado"]')?.value || '',
      operacao: document.querySelector('[name="Operação"]')?.value || '',
      modalidade: document.querySelector('[name="Modalidade"]')?.value || '',
      planta: document.querySelector('[name="Planta"]')?.value || '',
      frete: document.querySelector('[name="Frete"]')?.value || '',
    };
  

    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(
      `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/negocios?acao=listar&${queryParams}`,
        {
        method: 'GET',
        }
      );
      if (!response.ok) throw new Error('Erro ao enviar dados');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Arquivo baixado com sucesso');

      } catch (error) {
      console.error('Erro ao enviar dados:', error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const mockFiles = [
    {
      id: 1,
      title: "Memória de Cálculo",
      date: <CustomInput onDateChange={(date) => setDataSelecionadaMCalculo(formatDate(date))} />,
      url: "#",
    },
    {
      id: 2,
      title: "Relatório de Negociações",
      date: (
        <>
          <CustomInput onDateChange={(date) => setDataSelecionada(formatDate(date))} />
          &nbsp; Até &nbsp;
          <CustomInput onDateChange={(date) => setDataSelecionada(formatDate(date))} />
        </>
      ),
      url: "#",
    },
    {
      id: 3,
      title: "Distribuição",
      date: <CustomInput onDateChange={(date) => setDataSelecionada(formatDate(date))} />,
      url: "",
    },
     {
      id: 4,
      title: "Indústrias",
      url: "",
    },
  ];

  return (
    <div className="min-h-full bg-background text-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-auto">
        {mockFiles.map((file, index) => (
          <div
            key={index}
            className="bg-card-bg rounded-2xl p-4 shadow-lg border border-[#21262D] flex flex-col justify-between min-h-[300px]"
          >
            <div className="overflow-y-auto">
              <p className="text-lg font-semibold text-white truncate">
                {file.title}
              </p>
            <p className={`${file.id === 4 ? 'hidden' : 'text-sm text-white flex flex-nowrap mt-5'} `}>Data: &nbsp;&nbsp;  {file.date}</p>

              {file.title === "Relatório de Negociações" && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "Parte",
                    "Categoria",
                    "UF Origem",
                    "UF Destino",
                    "Aprovado",
                    "Operação",
                    "Modalidade",
                    "Frete",
                  ].map((label, i) => (
                    <div key={i} >
                      <label className="block text-sm text-gray-400 mb-1">{label}</label>
                      <select
                        name={label}
                        className="bg-tertiary border border-[#2D333B] text-sm p-2 rounded text-white w-full"
                      >
                        <option value="">Selecione</option>
                        {label === "Parte" && industrias.map((industria, idx) => (
                          <option key={idx} value={industria.parte}>{industria.nome}</option>
                        ))}
                        {label === "Categoria" && categorias.map((categoria, idx) => (
                          <option key={idx} value={categoria.categoria}>{categoria.nome}</option>
                        ))}
                        {["UF Origem", "UF Destino"].includes(label) && ufs.map((uf, idx) => (
                          <option key={idx}>{uf}</option>
                        ))}
                        {label === "Aprovado" && (
                          <>
                            <option value="1">Sim</option>
                            <option value="0">Não</option>
                          </>
                        )}
                        {label === "Operação" && (
                          <>
                            <option value="Compra">Compra</option>
                            <option value="Venda">Venda</option>
                          </>
                        )}
                        {label === "Modalidade" && (
                          <>
                            <option value="B">B</option>
                            <option value="T">T</option>
                          </>
                        )}
                        {label === "Frete" && (
                          <>
                            <option value="CIF">CIF</option>
                            <option value="FOB">FOB</option>
                          </>
                        )}
                      </select>
                    </div>
                  ))}
                </div>
              )}

               {file.id === 1 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["CategoriaMemoria"].map((label, i) => (
                    <div key={i}>
                      <label className="block text-sm text-gray-400 mb-1">{label}</label>
                      <select
                        name={label}
                        className="bg-tertiary border border-[#2D333B] text-sm p-2 rounded text-white w-full"
                      >
                        <option value="">Selecione</option>
                        {label === "CategoriaMemoria" && ['boi', 'vaca',   'novilha'].map((categoria, idx) => (
                          <option key={idx} value={categoria}>{categoria}</option>
                        ))}                      
                      </select>
                    </div>
                  ))}
                </div>
              )}


              {file.id === 3 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["CategoriaDistribuicao"].map((label, i) => (
                    <div key={i}>
                      <label className="block text-sm text-gray-400 mb-1">{label}</label>
                      <select
                        name={label}
                        className="bg-tertiary border border-[#2D333B] text-sm p-2 rounded text-white w-full"
                      >
                        <option value="">Selecione</option>
                        {label === "CategoriaDistribuicao" && ['boi', 'vaca', 'novilha'].map((categoria, idx) => (
                          <option key={idx} value={categoria}>{categoria}</option>
                        ))}                      
                      </select>
                    </div>
                  ))}
                </div>
              )}

            {file.id === 4 && (
                <h1 className="mt-5"> Relatório de Indústrias </h1>
              )}
            </div>

            <button
              className="mt-4 w-full bg-button-hover-bg hover:bg-[#fce046] text-black flex justify-center items-center gap-2 py-2 rounded"
              onClick={async () => {
                if (file.title === "Relatório de Negociações") {
                  await postData();
                }
                
                if (file.title === "Memória de Cálculo") {
                  const categoria = document.querySelector('[name="CategoriaMemoria"]')?.value || '';
                  const link = document.createElement('a');
                  link.href = `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/arquivos?acao=m_calculo&categoria=${categoria}&data=${dataSelecionadaMCalculo}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }

                if (file.title === "Distribuição") {
                  const categoria = document.querySelector('[name="CategoriaDistribuicao"]')?.value || '';
                  const link = document.createElement('a');
                  link.href = `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/arquivos?acao=distribuicao&categoria=${categoria}&data=${dataSelecionada}&download=true`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
                
                if (file.title === "Indústrias") {
                  const link = document.createElement('a');
                  link.href = `https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/industrias/resultados?obter=listar&file=true`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              <Download className="h-4 w-4" /> Baixar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Arquivos;
