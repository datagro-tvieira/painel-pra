import React, { useEffect, useRef } from "react";
import anychart from "anychart";

export const GraficoDeColunas = ({ data }) => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      anychart.licenseKey("datagro-23690706-e6c66f65");

      if (!chartInstance.current) {
        chartInstance.current = anychart.column();
        chartInstance.current.background().fill("transparent");
        chartInstance.current.labels().enabled(true).format("{%Value}").fontColor("white").fontWeight(600).fontSize(16);
        chartInstance.current.xAxis().labels().fontSize(18).fontColor("white").fontWeight(600);
        chartInstance.current.container(chartContainerRef.current);
        chartInstance.current.palette(["#FFD700", "#FF4500", "#1E90FF", "#32CD32", "#8A2BE2"]);
      }

      chartInstance.current.data(data);
      chartInstance.current.draw();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "250px" }} />;
};

