"use client";
import useTredingViewWidget from "@/hooks/useTredingViewWidget";
import { cn } from "@/lib/utils";
import React, { memo } from "react";

interface TradingViewWidgetProps {
  title?: string;
  scripturl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}

const TradingViewWidget = ({
  title,
  scripturl,
  config,
  height = 600,
  className,
}: TradingViewWidgetProps) => {
  const container = useTredingViewWidget(scripturl, config, height);

  return (
    <div className="w-full">
      {title && (
        <h2 className="mb-5 text-2xl font-semibold text-gray-100">{title}</h2>
      )}
      <div
        className={cn("tradingview-widget-container", className)}
        ref={container}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: height, width: "100%" }}
        />
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
