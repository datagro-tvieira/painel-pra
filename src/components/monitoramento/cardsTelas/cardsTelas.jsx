import React from "react";
import { ScanEye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import tela1 from '../../../assets/tela1.png'
import tela2 from '../../../assets/tela2.png'

const cards = [
  {
    title: "Dashboard Real Time",
    url: "/realtime", // sem o /backofficev2 porque já está no basename da rota
    img: tela1,
  },
  {
    title: "Dashboard Frigorificos",
    url: "/quantidades",
    img: tela2,
  },
];

const CardsTelas = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background text-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-auto">
        {cards.map((file, index) => (
          <div
            key={index}
            className="bg-card-bg rounded-2xl p-4 shadow-lg border border-[#21262D] flex flex-col justify-between min-h-[300px]"
          >
            <div className="overflow-y-auto">
              <p className="text-lg font-semibold text-white truncate">
                {file.title}
              </p>
              <div className="flex flex-col items-center justify-center mt-4">
                <img
                  src={file.img}
                  alt={file.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>

            <button
              className="mt-4 w-full bg-[#FFD700] hover:bg-[#a7952e] text-black text-xl flex justify-center items-center gap-2 py-2 rounded"
              onClick={() => navigate(file.url)}  // <-- aqui
            >
              <ScanEye className="h-7 w-7" /> Exibir tela
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardsTelas;
