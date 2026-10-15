"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, PieChart as PieChartIcon } from "lucide-react";

interface StatsProps {
  pendentes: number;
  aprovados: number;
  rejeitados: number;
}

export function StatsCards({ pendentes, aprovados, rejeitados }: StatsProps) {
  const total = pendentes + aprovados + rejeitados;

  const pctPendentes = total > 0 ? (pendentes / total) * 100 : 0;
  const pctAprovados = total > 0 ? (aprovados / total) * 100 : 0;
  const pctRejeitados = total > 0 ? (rejeitados / total) * 100 : 0;

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <CardHeader className="pb-2 pl-6">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[11px] tracking-wider text-gray-400">
                Pendentes
              </CardDescription>
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-gray-900 mt-1">
              {pendentes}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <CardHeader className="pb-2 pl-6">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[11px] tracking-wider text-gray-400">
                Aprovados
              </CardDescription>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-emerald-600 mt-1">
              {aprovados}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
          <CardHeader className="pb-2 pl-6">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold uppercase text-[11px] tracking-wider text-gray-400">
                Rejeitados
              </CardDescription>
              <div className="p-2 bg-red-50 rounded-xl text-red-600">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-red-600 mt-1">
              {rejeitados}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {total > 0 && (
        <Card className="border-none shadow-sm rounded-2xl bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-[#FF7A00]" />
              <span className="text-xs font-bold text-gray-700">Visão Geral dos Envio ({total} total)</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">Taxa de Aprovação: {total > 0 ? Math.round((aprovados / total) * 100) : 0}%</span>
          </div>

          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            <div
              className="bg-amber-500 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${pctPendentes}%` }}
              title={`Pendentes: ${Math.round(pctPendentes)}%`}
            />
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${pctAprovados}%` }}
              title={`Aprovados: ${Math.round(pctAprovados)}%`}
            />
            <div
              className="bg-red-500 h-full rounded-r-full transition-all duration-500"
              style={{ width: `${pctRejeitados}%` }}
              title={`Rejeitados: ${Math.round(pctRejeitados)}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 mt-3 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Pendentes ({Math.round(pctPendentes)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Aprovados ({Math.round(pctAprovados)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>Rejeitados ({Math.round(pctRejeitados)}%)</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}