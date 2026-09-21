"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";

interface HistoryData {
  created_at: string;
  score_percentage: number;
  lesson_title?: string;
}

interface PerformanceChartProps {
  data: HistoryData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.lesson_title || `Aula ${index + 1}`,
    Nota: item.score_percentage,
  }));

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">
            Evolução de Desempenho
          </h3>
          <p className="text-xs text-gray-500">
            Histórico de acertos nos Quizzes por aula
          </p>
        </div>
        <span className="text-xs font-semibold text-[#2F52E0] bg-blue-50 px-2.5 py-1 rounded-full">
          Adaptativo
        </span>
      </div>

      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                borderRadius: "12px",
                color: "#FFF",
                fontSize: "12px",
                border: "none",
              }}
              formatter={(value: any) => [`${value}%`, "Acertos"]}
            />
            <Line
              type="monotone"
              dataKey="Nota"
              stroke="#2F52E0"
              strokeWidth={3}
              dot={{ fill: "#2F52E0", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}