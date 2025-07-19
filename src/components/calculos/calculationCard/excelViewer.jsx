import { FileDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const ExcelViewer = ({ url, size }) => {
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [sheetData, setSheetData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ columnIndex: null, direction: "asc" });
  const [separarPlantas, setSepararPlantas] = useState(false);
  const [larguraJanela, setLarguraJanela] = useState(window.innerWidth);

   useEffect(() => {
      function handleResize() {
        setLarguraJanela(window.innerWidth);
      }
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }, []);

  const alturaGrafico = larguraJanela < 768 ? 300 : larguraJanela < 1900 ? 400 : 500;

  useEffect(() => {
    if (!url) return;

    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        setSelectedSheet(wb.SheetNames[0]);

        const data = parseSheet(wb.Sheets[wb.SheetNames[0]]);
        setSheetData(data);
      });
  }, [url]);

  const parseSheet = (sheet) => {
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!raw.length) return [];

    // Corrigir header
    const header = raw[0].map((h) => h === "Industria" ? "Indústria" : h);
    return [header, ...raw.slice(1)];
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    const data = parseSheet(workbook.Sheets[sheetName]);
    setSheetData(data);
    setSortConfig({ columnIndex: null, direction: "asc" });
  };

  const sortByColumn = (index) => {
    let direction = "asc";
    if (sortConfig.columnIndex === index && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const header = sheetData[0];
    const rows = [...sheetData.slice(1)];

    rows.sort((a, b) => {
      const aVal = a[index];
      const bVal = b[index];
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      return direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    setSheetData([header, ...rows]);
    setSortConfig({ columnIndex: index, direction });
  };

  return (
    <div className="p-2 overflow-auto text-white">
      {sheetNames.length > 0 && (
        <div className="mb-4">
          <span className="font-semibold mr-2">Estados:</span>
          <div className="flex gap-2 flex-wrap">
            {sheetNames.map((name) => (
              <button
                key={name}
                className={`px-3 py-1 rounded text-sm ${
                  selectedSheet === name
                    ? "bg-[#0B0E1A] text-[#14FFE7]"
                    : "bg-[#394B74] hover:bg-[#0B0E1A]"
                }`}
                onClick={() => handleSheetChange(name)}
              >
                {name}
              </button>
            ))}
            <button
              className="ml-4"
              title="Baixar Memória de cálculo"
              onClick={() => {
                const link = document.createElement("a");
                link.href = `${url}&download=true`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <FileDown className="text-white hover:text-[#14FFE7]" />
            </button>
          </div>

         
        </div>
      )}

  <div
  className={`overflow-auto max-h-[${alturaGrafico}px] border rounded-lg shadow-sm`}>
  <table className="min-w-full border-collapse border border-gray-300 text-sm">
    <thead className="bg-gray-100 sticky top-0 z-10">
      <tr>
        {sheetData[0]?.map((cell, i) => (
          <th
            key={i}
            onClick={() => sortByColumn(i)}
            className="border border-gray-300 px-3 py-2 text-left font-bold text-black bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            {cell}
            {sortConfig.columnIndex === i ? (
              sortConfig.direction === "asc" ? " 🔼" : " 🔽"
            ) : (
              ""
            )}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {sheetData.slice(1).map((row, i) => (
        <tr
          key={i}
          className={`${
            i % 2 === 0 ? "bg-white" : "bg-gray-50"
          } hover:bg-gray-100 transition-colors`}
        >
          {row.map((cell, j) => (
            <td
              key={j}
              className={`border border-gray-300 px-3 py-2 ${
                !isNaN(parseFloat(cell)) ? "text-right" : "text-left"
              } text-gray-800`}
            >
              {(() => {
                const header = sheetData[0][j].toLowerCase();

                if (header === "cap") {
                  return cell === 1 ?  "-" : (cell).toFixed(4);
                }
                if (header.includes("outlier")) {
                  return cell ? `${cell}` : "-";
                }
               
                return cell ?? "-";
              })()}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default ExcelViewer;
