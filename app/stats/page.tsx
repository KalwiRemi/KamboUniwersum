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

type TooltipPayloadItem = {
  color?: string;
  name?: string;
  value?: number | null;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const sortedPayload = [...payload].sort((a, b) => {
    const aValue = typeof a.value === "number" ? a.value : -1;
    const bValue = typeof b.value === "number" ? b.value : -1;
    return bValue - aValue;
  });

  return (
    <div className="min-w-[280px] rounded-xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.55)] backdrop-blur-sm">
      <p className="mb-2 border-b border-slate-200 pb-2 text-sm font-bold tracking-wide text-slate-700">
        {label}
      </p>
      <div className="space-y-1.5">
        {sortedPayload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color || "#64748b" }}
              />
              <span className="truncate font-medium text-slate-700">{item.name}</span>
            </div>
            <span className="shrink-0 font-semibold text-slate-900">
              {typeof item.value === "number" ? (
                <>
                  {item.value.toLocaleString("pl-PL")}
                  <span className="ml-1 text-xs font-medium text-slate-500">/ film</span>
                </>
              ) : (
                "Brak danych"
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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
          <h1 className="text-2xl font-extrabold text-[#0f172a]">
            Statystyki wyświetleń kanałów
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
            margin={{ top: 8, right: 24, bottom: 56, left: 56 }}
          >
            <CartesianGrid vertical={false} stroke="#dbeafe" strokeWidth={1.2} />
            <XAxis
              dataKey="month"
              tickMargin={12}
              axisLine={{ stroke: "#cbd5e1", strokeWidth: 2 }}
              tickLine={{ stroke: "#cbd5e1", strokeWidth: 2 }}
              tick={{ fontSize: 15, fill: "#334155", fontWeight: 600 }}
              label={{
                value: "Miesiąc",
                position: "bottom",
                offset: 14,
                style: { fill: "#0f172a", fontSize: 20, fontWeight: 700 },
              }}
            />
            <YAxis
              width={84}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 15, fill: "#334155", fontWeight: 600 }}
              label={{
                value: "Śr. wyświetlenia",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                style: {
                  fill: "#0f172a",
                  fontSize: 20,
                  fontWeight: 700,
                  textAnchor: "middle",
                  dominantBaseline: "middle",
                },
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
              cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4", strokeWidth: 1.5 }}
              wrapperStyle={{ outline: "none" }}
              content={<CustomTooltip />}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
