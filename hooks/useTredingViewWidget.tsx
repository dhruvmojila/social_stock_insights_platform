"use client";

import { useEffect, useRef } from "react";

const useTredingViewWidget = (
  scripturl: string,
  config: Record<string, unknown>,
  height: number = 600
) => {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current) return;
    if (container.current.dataset.loaded === "true") return;
    container.current.innerHTML = `<div class="tradingview-widget-container__widget" style="height: ${height}px; width: 100%"></div>`;

    const script = document.createElement("script");
    script.src = scripturl;
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    container.current?.appendChild(script);
    container.current.dataset.loaded = "true";

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
        delete container.current.dataset.loaded;
      }
    };
  }, [scripturl, config, height]);

  return container;
};

export default useTredingViewWidget;
