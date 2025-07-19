import React, { useEffect, useRef } from "react";
import anychart from "anychart";

export const GraficoDeBarras = ({ data }) => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      anychart.licenseKey("datagro-23690706-e6c66f65");

      if (!chartInstance.current) { // Initialize chart only once
        chartInstance.current = anychart.bar();
        chartInstance.current.background().fill("transparent");
        chartInstance.current.labels().enabled(true).format("{%Value}").fontColor("white").fontWeight(600).fontSize(16);
        chartInstance.current.xAxis().labels().fontSize(18).fontColor("white").fontWeight(600);
        chartInstance.current.container(chartContainerRef.current);
        chartInstance.current.palette(["#FFD700", "#00C853"]); 

      }

      chartInstance.current.data(data); // Update data
      chartInstance.current.draw();

    }

    // Cleanup function: dispose chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data]); // Re-run effect if data changes

  return <div ref={chartContainerRef} style={{ width: "100%", height: "250px" }} />;
};

