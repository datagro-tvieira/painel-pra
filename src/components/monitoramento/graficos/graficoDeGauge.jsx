import React, { useEffect, useRef } from "react";
import anychart from "anychart";

export const GraficoDeGauge = ({ data, options }) => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      anychart.licenseKey("datagro-23690706-e6c66f65");

      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      const gauge = anychart.gauges.linear();
      gauge.data(data); // `data` agora é um array de valores [valorArquivos, valorCabeças, valorTotal]
      gauge.background().fill("transparent");
      gauge.animation(true);

      // Configura a lenda dinamicamente baseada nas opções dos tanks
      if (options.tanks && options.tanks.length > 0) {
        const legendItems = options.tanks.map(tank => ({
          text: tank.name, // Usa o nome definido nas options do tank
          iconFill: tank.color
        }));

        gauge.legend()
          .enabled(true)
          .items(legendItems)
          .fontColor("#ffffff")
          .fontWeight(600)
          .fontSize(20)
          .position("right")
          .itemsLayout("vertical")
          .align("center");
      }


      if (options.scales && options.tanks) {
        options.scales.forEach((scaleOpts, i) => {
          const scale = anychart.scales.linear();
          scale.minimum(0).maximum(scaleOpts.maxValue);
          gauge.axis(i).scale(scale);
          gauge.axis(i).offset(scaleOpts.offset);
          gauge.axis(i).orientation("left");
          gauge.axis(i).labels()
            .fontColor("black")
            .fontWeight(600)
            .fontSize(12)
            .background({
              fill: "white",
              stroke: "2 rgba(255, 255, 255, 0.57)",
              corners: 3
            })
            .position("center")
            .format(function() { return this.value.toLocaleString('pt-BR'); });

          const tank = gauge.tank(i);
          tank.color(options.tanks[i].color, 0.7);
          tank.width(options.tanks[i].width); // Usa a largura definida nas options
          tank.scale(scale);
          tank.offset(options.tanks[i].offset);
        });
      }

      gauge.container(chartContainerRef.current);
      gauge.draw();
      chartInstance.current = gauge;
    }

    // Cleanup function: dispose chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data, options]); // Re-run effect if data or options change

  return <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }} />;
};