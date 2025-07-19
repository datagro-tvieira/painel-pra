import React, { useEffect, useRef } from "react";
import anychart from "anychart";

export const GraficoDePizza = ({ data }) => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      anychart.licenseKey("datagro-23690706-e6c66f65");

      if (!chartInstance.current) {
        chartInstance.current = anychart.pie();
        chartInstance.current.innerRadius("70%")
        chartInstance.current.background().fill("transparent");
        chartInstance.current.labels().enabled(true).position("outside").format("{%X}: {%Value}").fontColor("white").fontWeight(600).fontSize(16);
        chartInstance.current.palette(["#007BFF", "#FFD700",  "#C0C0C0"]);
        chartInstance.current.container(chartContainerRef.current);
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

