"use client";

import rawData from '../../public/monthly_average_views.json';

import { useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const channelColorMap: { [_: string]: string } = {
  'UC1v8Pb3mVVhctpado1zkY-Q': "#2563eb", // raport
  'UCyFrUC936RTrwRjE0tEbZCQ': "#f97316", // popas
  'UCSpjys0fmiuKlKq1l_NgvnA': "#10b981", // wloczykij
  'UCgB0Zp12H3cEWnN5kkqXNMw': "#ef4444", // filip
  'UC3CW1FJJM08ux8HF1eVpqvQ': "#8b5cf6", // pod nowym niebem
  'UCfKGYjXohzOKDH0itYRZmgw': "#14b8a6", // waldi
  'UCVwO3pAsl8u88yeHX9zPGqA': "#ec4899", // cebe
  'UCD1K3EhrvgFXb4U8vHBAs8w': "#f59e0b", // spocony
  'UCGt--eiSGtsDim-NxmLIrsw': "#06b6d4"  // maniek
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

  const [selectedRange, setSelectedRange] = useState("12");
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const visibleData =
    selectedRange === "all"
      ? unifiedData
      : unifiedData.slice(Math.max(0, unifiedData.length - Number(selectedRange)));

  const toggleSeries = (seriesKey: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(seriesKey)) {
        next.delete(seriesKey);
      } else {
        next.add(seriesKey);
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#eef4ff] to-[#f7fbff] px-4 py-8 md:px-8">
      <div className="mx-auto h-[80vh] w-full max-w-6xl rounded-md bg-[#f8fbff] p-2 md:p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
          <h1 className="rounded-sm bg-gradient-to-r from-[#0f172a] to-[#1d4ed8] px-4 py-1.5 text-2xl font-semibold text-[#f8fafc] shadow-md">
            Zmiana wyświetleń kanałów
          </h1>
          <label htmlFor="time-range" className="mr-2 text-sm font-semibold text-[#1e3a8a]">
            Zakres czasu:
            <select
              id="time-range"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="ml-2 rounded-md border border-[#bfdbfe] bg-white px-3 py-1.5 text-sm text-[#1e293b] shadow-sm outline-none"
            >
              <option value="6">Ostatnie 6 miesięcy</option>
              <option value="12">Ostatnie 12 miesięcy</option>
              <option value="24">Ostatnie 24 miesiące</option>
              <option value="all">Cały okres</option>
            </select>
          </label>
        </div>
        <ResponsiveContainer>
          <LineChart
            data={visibleData}
            margin={{ top: 8, right: 24, bottom: 24, left: 24 }}
          >
            <CartesianGrid vertical={false} stroke="#dbeafe" strokeWidth={1.2} />
            <XAxis
              dataKey="month"
              tickMargin={8}
              axisLine={{ stroke: "#cbd5e1", strokeWidth: 2 }}
              tickLine={{ stroke: "#cbd5e1", strokeWidth: 2 }}
              tick={{ fontSize: 15, fill: "#334155", fontWeight: 600 }}
              label={{ value: "Miesiąc", position: "insideBottom", offset: -12 }}
            />
            <YAxis
              tickMargin={8}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 15, fill: "#334155", fontWeight: 600 }}
              label={{
                value: "Śr. wyświetlenia",
                angle: -90,
                position: "insideLeft",
                offset: -8,
                style: { fill: "#0f172a", fontSize: 32, fontWeight: 700 },
              }}
            />
            {channels.map((ch, idx) => (
              <Line
                key={ch.channel_id}
                type="monotone"
                dataKey={ch.channel_id}
                name={ch.channel_name}
                stroke={channelColorMap[ch.channel_id] || `hsl(${idx * 60}, 70%, 50%)`}
                strokeWidth={3}
                dot={false}
                connectNulls={false}
                hide={hiddenSeries.has(ch.channel_id)}
                isAnimationActive={false} // 🚫 No animations
              />
            ))}
            <Legend
              verticalAlign="top"
              align="right"
              iconType="plainline"
              content={({ payload }) => {
                if (!payload) return null;
                return (
                  <div className="mb-2 flex flex-wrap justify-end gap-x-4 gap-y-2">
                    {payload.map((entry: any) => {
                      const dataKey = String(entry.dataKey || "");
                      const isHidden = hiddenSeries.has(dataKey);
                      return (
                        <button
                          key={dataKey}
                          type="button"
                          onClick={() => toggleSeries(dataKey)}
                          className={`flex items-center gap-2 text-sm font-semibold transition-opacity ${
                            isHidden ? "opacity-40" : "opacity-100"
                          }`}
                          style={{ color: "#1e293b" }}
                        >
                          <span
                            className="inline-block h-[3px] w-5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className={isHidden ? "line-through" : ""}>
                            {entry.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              }}
              wrapperStyle={{
                paddingBottom: "8px",
                fontWeight: 600,
                color: "#1e293b",
              }}
            />
            <Tooltip
              labelFormatter={(_, payload): string => {
                return payload?.[0]?.payload?.month || ""
              }}
              // @ts-ignore
              formatter={(value: number, _name, payload) => {
                const channel = channels.find(
                  (c) => c.channel_id === payload.dataKey
                );
                return [
                  value ? `${value.toLocaleString()} wyświetleń/film` : "Brak danych",
                  channel?.channel_name || "",
                ];
              }}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #bfdbfe",
                borderRadius: "0.5rem",
                fontSize: "0.9rem",
                boxShadow: "0 8px 24px rgba(37, 99, 235, 0.12)",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
