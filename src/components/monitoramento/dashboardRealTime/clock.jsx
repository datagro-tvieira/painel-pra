import React, { useState, useEffect } from 'react';

export const RelogioCard = () => {
  const [horaAtual, setHoraAtual] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-card-bg p-4 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between text-text-bold-color">
      <div className="text-xl font-bold"></div>
      <div className="text-3xl font-mono">{horaAtual.toLocaleTimeString('pt-BR')}</div>
    </div>
  );
};
