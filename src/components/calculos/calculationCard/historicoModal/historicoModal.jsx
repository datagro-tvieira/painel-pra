import React from 'react';

const HistoricoModal = ({ show, onClose, log }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card-bg  p-6 rounded-lg shadow-lg w-[50%]">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-xl font-bold dark:text-white">Histórico detalhado</h2>
          <button className="px-4 py-2 bg-button-hover-bg text-black font-bold rounded-full hover:bg-slate-400" onClick={onClose}>X</button>
        </div>
        <div className="overflow-y-auto h-96">
          {log?.split('\n').map((line, idx) => (
            <p key={idx} className="text-base text-gray-300 my-1">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoricoModal;
