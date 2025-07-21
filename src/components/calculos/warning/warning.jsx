import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Check, Info, RefreshCcw, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Warning = () => {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [corrigidos, setCorrigidos] = useState(0);
  const cardRef = useRef(null);

  // Função separada para reutilização
  const fetchAlerts = async () => {
    try {
      const response = await fetch('https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/alertas?acao=alertas');
      if (!response.ok) throw new Error('Erro ao buscar alertas');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    }
  };

  // Carrega ao montar
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Atualiza a cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000); // 30 segundos

    return () => clearInterval(interval); // Limpa ao desmontar
  }, []);

  const checkCorrigidos = async (id) => {
    const postCorrigidos = await fetch(`https://pecuaria.datagro.com/backoffice-pec/api/v1/dashboard/alertas?acao=alertas&marcar=1&id=${id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ corrigidos }),
      }
    )

    if (!postCorrigidos.ok) {
      console.error('Erro ao marcar alerta como corrigido');
      return;
    }
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    setCorrigidos(prev => prev + 1);
  };

  // Detecta clique fora do card
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && cardRef.current && !cardRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const hasAlert = alerts.length > 0;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          ref={cardRef}
          className="w-[360px] max-h-[400px] overflow-y-auto p-4 rounded-xl bg-white dark:bg-slate-800 shadow-2xl border border-yellow-400 backdrop-blur-md"
        >

          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
              Alertas de Negócios Recusados
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center justify-end mb-4">
            <button className='text-white hover:text-gray-500' onClick={() => {
              fetchAlerts();
            }}>
              <RefreshCcw/>
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="relative p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700"
              >
                <button
                  onClick={() => {
                    checkCorrigidos(alert.id);
                  }}
                  className="absolute top-2 right-2 text-green-600 hover:text-green-800"
                  title="Marcar como corrigido"
                >
                  <Check size={18} />
                </button>

                <div className="text-sm text-gray-700 dark:text-gray-200">
                  <p><strong>ID:</strong> {alert.id}</p>
                  <p><strong>Data:</strong> {alert.data}</p>
                  <p><strong>Negócio:</strong> {alert.idNegocio}</p>
                  <p><strong>Origem:</strong> {alert.origem} ({alert.origemUf})</p>
                  <p><strong>Destino:</strong> {alert.destino} ({alert.destinoUf})</p>
                  <p className="mt-1 text-sm italic text-red-600 dark:text-red-400">
                    {alert.log}
                  </p>

                  <button
                    className="flex items-center justify-end mt-2 text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      const customEvent = new CustomEvent('alertInfoClick', {
                        detail: {
                          id: alert.idNegocio,
                          origem: alert.origem,
                          destino: alert.destino,
                          ufOrigem: alert.ufOrigem,
                          ufDestino: alert.ufDestino,
                          log: alert.log,
                        },
                      });
                      window.dispatchEvent(customEvent);
                    }}
                  >
                    <Info size={18} className="mr-1" />
                    Ver na lista
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        title="Alertas"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'relative flex items-center justify-center w-12 h-12 rounded-full border border-yellow-400 shadow-lg transition-colors',
          hasAlert ? 'bg-yellow-300 text-yellow-900 animate-pulse' : 'bg-gray-100 text-gray-500'
        )}
      >
        <AlertTriangle className="w-6 h-6" />
        {hasAlert && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-white" />
        )}
      </button>
    </div>
  );
};
