import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import { Eye, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { electoralApi } from "@/services/electoralApi";

const COLORS = ["hsl(220, 85%, 35%)", "hsl(0, 75%, 55%)", "hsl(200, 95%, 45%)", "hsl(45, 90%, 55%)"];

interface Result {
  candidate_id: number;
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

const ResultsView = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await electoralApi.getResults(); // ← USA TU SERVICIO

      console.log("Datos recibidos:", data); // ← DEBE MOSTRAR TU JSON

      setResults(data.results || []);
      setTotalVotes(data.total_votes || 0);
      setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al cargar resultados");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && results.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Cargando resultados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-6">
        <CardContent className="pt-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchResults}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }

  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Resultados Electorales en Tiempo Real</CardTitle>
              <CardDescription>
                Total de votos: <span className="font-bold text-foreground">{totalVotes.toLocaleString()}</span>
              </CardDescription>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span>Actualizado: {lastUpdate}</span>
              <button
                onClick={fetchResults}
                className="p-1 rounded hover:bg-gray-100 transition"
                title="Actualizar ahora"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* === TARJETAS DE CANDIDATOS === */}
          <div>
            <h3 className="text-2xl font-black mb-8 tracking-tight text-blue-900 drop-shadow">
              Detalles por Candidato
            </h3>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {sortedResults.map((result, index) => (
                <Card
                  key={result.candidate_id}
                  className="relative hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl bg-white/90 border border-slate-100 shadow-lg ring-1 ring-inset ring-blue-100"
                  style={{
                    boxShadow: `0 6px 22px -6px ${COLORS[index % COLORS.length]}33, 0 1.5px 8.5px -4px ${COLORS[index % COLORS.length]}22`,
                  }}
                >
                  {/* Header */}
                  <div
                    className="h-24 relative overflow-hidden flex items-center px-6 pt-4"
                    style={{
                      background: `linear-gradient(120deg, ${COLORS[index % COLORS.length]}22 0%, ${COLORS[index % COLORS.length]}55 100%)`,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <span
                        className="rounded-xl shadow font-bold text-lg px-4 py-2 border-2 border-white"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                          color: "#fff",
                        }}
                      >
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-grow"></div>
                    <div>
                      <span
                        className="inline-block text-2xl font-extrabold px-4 py-1.5 rounded-lg shadow shadow-blue-200 bg-white/80 ring-1 ring-inset ring-blue-100"
                        style={{ color: COLORS[index % COLORS.length] }}
                      >
                        {result.percentage}%
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex flex-col items-center mb-3">
                      <h4 className="text-lg font-extrabold tracking-tight text-blue-950 mb-0.5 text-center">
                        {result.name}
                      </h4>
                      <span
                        className="px-3 py-1 my-1 rounded-full text-xs font-bold text-white shadow-md tracking-wide"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {result.party}
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center mb-4">
                      <span className="text-[13px] text-slate-500">Total Votos</span>
                      <span
                        className="text-3xl mt-1 font-extrabold drop-shadow"
                        style={{ color: COLORS[index % COLORS.length] }}
                      >
                        {result.votes.toLocaleString()}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">Participación</span>
                        <span className="font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                          {result.percentage}%
                        </span>
                      </div>
                      <div className="relative w-full h-3 bg-slate-200/80 rounded-xl shadow-inner overflow-hidden">
                        <div
                          className="h-full rounded-xl transition-all duration-1000 ease-out relative"
                          style={{
                            width: `${result.percentage}%`,
                            background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}cc 0%, ${COLORS[index % COLORS.length]}99 100%)`,
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-around items-center p-2 gap-3 rounded-xl bg-slate-100/60">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">Votos</span>
                        <span className="text-base font-bold text-blue-950">{result.votes}</span>
                      </div>
                      <div className="border-l border-r border-slate-200 px-4 flex flex-col items-center">
                        <span className="text-xs text-slate-500">%</span>
                        <span className="text-base font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                          {result.percentage}%
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">Posición</span>
                        <span className="text-base font-bold text-blue-950">#{index + 1}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* === GRÁFICO COMBINADO === */}
          <div>
            <h3 className="text-2xl font-black mb-6 tracking-tight text-blue-900 drop-shadow text-center">
              Votos totales por partido político
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={sortedResults}
                margin={{ top: 20, right: 60, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="party" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  label={{ value: 'Votos', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[0, 20]}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  label={{ value: 'Participación %', angle: 90, position: 'insideRight', style: { fill: 'hsl(var(--foreground))' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Votos') return [value.toLocaleString(), name];
                    if (name === 'Participación %') return [`${value}%`, name];
                    return [value, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="votes" 
                  name="Votos"
                  radius={[8, 8, 0, 0]}
                >
                  {sortedResults.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="percentage" 
                  name="Participación %"
                  stroke="hsl(25, 95%, 53%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(25, 95%, 53%)', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsView;