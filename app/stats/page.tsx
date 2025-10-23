"use client";

import rawData from '../../public/monthly_average_views.json';

import { useState, useRef } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

const channelColorMap: { [_: string]: string } = {
  'UC1v8Pb3mVVhctpado1zkY-Q': "#1f77b4", // raport
  'UCyFrUC936RTrwRjE0tEbZCQ': "#ff7f0e", // popas
  'UCSpjys0fmiuKlKq1l_NgvnA': "#2ca02c", // wloczykij
  'UCgB0Zp12H3cEWnN5kkqXNMw': "#d62728", // filip
  'UC3CW1FJJM08ux8HF1eVpqvQ': "#9467bd", // pod nowym niebem
  'UCfKGYjXohzOKDH0itYRZmgw': "#8c564b", // waldi
  'UCVwO3pAsl8u88yeHX9zPGqA': "#e377c2", // cebe
  'UCD1K3EhrvgFXb4U8vHBAs8w': "#7f7f7f", // spocony
  'UCGt--eiSGtsDim-NxmLIrsw': "#17becf"  // maniek
}


// --- Build a unified dataset across all months for all channels
function buildUnifiedData(channels: any[]) {
  const allMonths = Array.from(
    new Set(channels.flatMap((ch) => ch.monthly_stats.map((m: any) => m.month)))
  ).sort();

  return allMonths.map((month) => {
    const entry: any = { month };
    channels.forEach((ch) => {
      const found = ch.monthly_stats.find((m: any) => m.month === month);
      entry[ch.channel_id] = found ? found.avg_views_per_video : null;
    });
    return entry;
  });
}

export default function Page() {
  const channels = rawData.channels;
  const unifiedData = buildUnifiedData(channels);

  // Zoom & pan state
  const [range, setRange] = useState({ start: unifiedData.length - 24, end: unifiedData.length - 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<number | null>(null);

  // Zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const dataLength = unifiedData.length;
    const currentRange = range.end - range.start;
    const zoomAmount = Math.ceil(currentRange * zoomIntensity);

    if (e.deltaY < 0) {
      // zoom in
      if (currentRange > 2) {
        setRange({
          start: range.start + zoomAmount,
          end: range.end - zoomAmount,
        });
      }
    } else {
      // zoom out
      setRange({
        start: Math.max(0, range.start - zoomAmount),
        end: Math.min(dataLength - 1, range.end + zoomAmount),
      });
    }
  };

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = e.clientX;
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartRef.current === null) return;
    const dx = e.clientX - dragStartRef.current;
    const panSpeed = 0.02;
    const shift = Math.round(dx * panSpeed);
    const newStart = Math.max(0, range.start - shift);
    const newEnd = Math.min(unifiedData.length - 1, range.end - shift);
    if (newEnd - newStart >= 2) setRange({ start: newStart, end: newEnd });
    dragStartRef.current = e.clientX;
  };

  const visibleData = unifiedData.slice(range.start, range.end + 1);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center select-none">
      <div
        className="w-full max-w-4xl h-screen"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <ResponsiveContainer>
          <LineChart
            data={visibleData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            {channels.map((ch, idx) => (
              <Line
                key={ch.channel_id}
                type="monotone"
                dataKey={ch.channel_id}
                stroke={channelColorMap[ch.channel_id] || `hsl(${idx * 60}, 70%, 50%)`}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false} // 🚫 No animations
              />
            ))}
            <Tooltip
              labelFormatter={(_, payload): string => {
                return payload?.[0]?.payload?.month || ""
              }}
              formatter={(value: number, _name, payload) => {
                const channel = channels.find(
                  (c) => c.channel_id === payload.dataKey
                );
                return [
                  value ? `${value.toLocaleString()} views/video` : "No data",
                  channel?.channel_name || "",
                ];
              }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
                fontSize: "0.85rem",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
