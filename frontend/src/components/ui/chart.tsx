"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface BarChartProps {
  data: any[];
  xKey: string;
  bars: {
    dataKey: string;
    fill: string;
    name: string;
    formatter?: (value: number) => string;
  }[];
}

export function BarChart({ data, xKey, bars }: BarChartProps) {
  const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          {payload.map((entry: any, index: number) => {
            const bar = bars.find((b) => b.dataKey === entry.dataKey);
            const formattedValue = bar?.formatter
              ? bar.formatter(entry.value)
              : entry.value;
            return (
              <p key={index} style={{ color: entry.fill }}>
                {entry.name}: {formattedValue}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill}
            name={bar.name}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
