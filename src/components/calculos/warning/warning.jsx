import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn'

export const Warning = () => {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [corrigidos, setCorrigidos] = useState(0);

  // Dados simulados
  useEffect(() => {
    setTimeout(() => {
      setAlerts([
        {
          id: 1,
          data: '2025-07-17',
          idNegocio: 'ef468835c3636f67758c94fe323bb197',
          origem: 'Planta A',
          destino: 'Planta B',
          ufOrigem: 'BA',
          ufDestino: 'SP',
          log: 'Negócio recusado por divergência de dados',
        },
        {
          id: 2,
          data: '2025-07-16',
          idNegocio: '278915347',
          origem: 'Planta C',
          destino: 'Planta D',
          ufOrigem: 'MT',
          ufDestino: 'GO',
          log: 'Quantidade inválida',
        },
      ]);
    }, 2000);
  }, []);

  const hasAlert = alerts.length > 0;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-[360px] max-h-[400px] overflow-y-auto p-4 rounded-xl bg-white dark:bg-slate-800 shadow-2xl border border-yellow-400 backdrop-blur-md">
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
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700"
              >

              <button onClick={() => {
                setCorrigidos(prev => prev + 1);
                setAlerts(prev => prev.filter(a => a.id !== alert.id));
                }}>
                <Check/>
              </button>
              
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  <p><strong>ID:</strong> {alert.id}</p>
                  <p><strong>Data:</strong> {alert.data}</p>
                  <p><strong>Negócio:</strong> {alert.idNegocio}</p>
                  <p><strong>Origem:</strong> {alert.origem} ({alert.ufOrigem})</p>
                  <p><strong>Destino:</strong> {alert.destino} ({alert.ufDestino})</p>
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
