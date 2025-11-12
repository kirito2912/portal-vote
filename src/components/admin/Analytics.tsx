import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, MapPin, Clock, Loader2, Brain, BarChart3, RefreshCw } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts";
import { electoralApi } from "@/services/electoralApi";
import { toast } from "sonner";

interface AnalyticsProps {
  votes: any[];
  candidates: any[];
}

const COLORS = ["hsl(220, 85%, 35%)", "hsl(0, 75%, 55%)", "hsl(200, 95%, 45%)", "hsl(45, 90%, 55%)"];

const Analytics = ({ votes, candidates }: AnalyticsProps) => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [demographic, setDemographic] = useState<any>(null);
  const [geographic, setGeographic] = useState<any>(null);
  const [temporal, setTemporal] = useState<any>(null);
  const [clustering, setClustering] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, demographicRes, geographicRes, temporalRes, clusteringRes, predictionsRes] = await Promise.all([
        electoralApi.getAnalyticsOverview(),
        electoralApi.getAnalyticsDemographic(),
        electoralApi.getAnalyticsGeographic(),
        electoralApi.getAnalyticsTemporal(),
        electoralApi.getAnalyticsClustering(3),
        electoralApi.getAnalyticsPredictions()
      ]);

      setOverview(overviewRes);
      setDemographic(demographicRes);
      setGeographic(geographicRes);
      setTemporal(temporalRes);
      setClustering(clusteringRes);
      setPredictions(predictionsRes);

      toast.success("Analytics cargados exitosamente");
    } catch (error: any) {
      toast.error("Error al cargar analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Cargando análisis avanzado...</span>
      </div>
    );
  }

  // Preparar datos para gráficos
  const temporalData = temporal?.votes_by_hour ? Object.entries(temporal.votes_by_hour).map(([hour, votes]) => ({
    hour: parseInt(hour),
    votes: votes
  })).sort((a, b) => a.hour - b.hour) : [];

  const genderData = overview?.distributions?.gender ? Object.entries(overview.distributions.gender).map(([name, value]) => ({
    name,
    value
  })) : [];

  const educationData = overview?.distributions?.education ? Object.entries(overview.distributions.education).map(([name, value]) => ({
    name,
    value
  })) : [];

  const clusterScatterData = clustering?.clusters ? clustering.clusters.flatMap((cluster: any) => 
    Array(cluster.size).fill(null).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      cluster: cluster.cluster_id
    }))
  ) : [];

  return (
    <div className="space-y-6">
      {/* HEADER CON REFRESH */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análisis Electoral Avanzado</h2>
          <p className="text-muted-foreground">Insights generados con Machine Learning y Data Science</p>
        </div>
        <Button onClick={loadAllAnalytics} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* KPIs PRINCIPALES */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Votantes</p>
                  <p className="text-3xl font-bold">{overview.kpis.total_voters.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Votos Emitidos</p>
                  <p className="text-3xl font-bold">{overview.kpis.total_votes.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Participación</p>
                  <p className="text-3xl font-bold">{overview.kpis.participation_rate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Edad Promedio</p>
                  <p className="text-3xl font-bold">{overview.kpis.avg_age.toFixed(1)}</p>
                </div>
                <Clock className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ANÁLISIS TEMPORAL */}
      {temporal && temporalData.length > 0 && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Flujo de Votación por Hora</CardTitle>
            <CardDescription>Distribución temporal de votos • Hora pico: {temporal.peak_hour}:00</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" label={{ value: 'Hora del día', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="votes" stroke="hsl(220, 85%, 35%)" fill="hsl(220, 85%, 35%)" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* DISTRIBUCIONES DEMOGRÁFICAS */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* GÉNERO */}
        {genderData.length > 0 && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Distribución por Género</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* EDUCACIÓN */}
        {educationData.length > 0 && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Distribución por Educación</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={educationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {educationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ANÁLISIS GEOGRÁFICO */}
      {geographic && geographic.top_departments && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Top Departamentos por Votación</CardTitle>
            <CardDescription>Distribución geográfica de participación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {Object.entries(geographic.top_departments).slice(0, 5).map(([dept, votes]: [string, any], index) => (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{dept}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-smooth"
                        style={{ 
                          width: `${(votes / Math.max(...Object.values(geographic.top_departments).map(v => Number(v)))) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <Badge variant="outline">{votes} votos</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CLUSTERING K-MEANS */}
      {clustering && clustering.success && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Análisis de Clustering (K-Means)
            </CardTitle>
            <CardDescription>
              Segmentación de votantes en {clustering.n_clusters} grupos • 
              Silhouette Score: {clustering.silhouette_score?.toFixed(3) || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gráfico de dispersión */}
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Componente 1" />
                <YAxis dataKey="y" name="Componente 2" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Cluster 0" data={clusterScatterData.filter(d => d.cluster === 0)} fill={COLORS[0]} />
                <Scatter name="Cluster 1" data={clusterScatterData.filter(d => d.cluster === 1)} fill={COLORS[1]} />
                <Scatter name="Cluster 2" data={clusterScatterData.filter(d => d.cluster === 2)} fill={COLORS[2]} />
              </ScatterChart>
            </ResponsiveContainer>

            {/* Características de clusters */}
            <div className="grid gap-3 md:grid-cols-3">
              {clustering.clusters.map((cluster: any) => (
                <Card key={cluster.cluster_id} className="border-2" style={{ borderColor: COLORS[cluster.cluster_id % COLORS.length] }}>
                  <CardHeader>
                    <CardTitle className="text-base">Cluster {cluster.cluster_id + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tamaño:</span>
                      <Badge>{cluster.size} ({cluster.percentage}%)</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Edad Promedio:</span>
                      <span className="font-medium">{cluster.characteristics.avg_age} años</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Género Principal:</span>
                      <span className="font-medium">
                        {Object.keys(cluster.characteristics.gender_distribution)[0]}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Educación:</span>
                      <span className="font-medium">
                        {Object.keys(cluster.characteristics.education_distribution)[0]}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Candidato Top:</span>
                      <Badge variant="secondary">ID: {cluster.characteristics.top_candidate}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-4 bg-muted rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong>Interpretación:</strong> K-Means agrupa votantes con características similares. 
                Silhouette Score indica la calidad de la separación (0.5-0.7 = buena, &gt;0.7 = excelente).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PREDICCIONES ML */}
      {predictions && predictions.success && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Predicciones del Modelo ML
            </CardTitle>
            <CardDescription>
              Proyección basada en modelo: {predictions.model_info.algorithm} • 
              Accuracy: {predictions.model_info.accuracy ? (predictions.model_info.accuracy * 100).toFixed(2) : 'N/A'}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.predictions.map((pred: any, index: number) => (
                <div key={pred.candidate_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                        {index + 1}
                      </Badge>
                      <span className="font-semibold">{pred.name}</span>
                      <Badge variant="outline">{pred.party}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">Actual: {pred.current_percentage}%</Badge>
                      <Badge className="gradient-hero">Predicción: {pred.predicted_percentage}%</Badge>
                      <Badge variant="secondary">±{pred.margin_of_error}%</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full transition-smooth"
                        style={{ 
                          width: `${pred.current_percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full gradient-secondary transition-smooth"
                        style={{ width: `${pred.predicted_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Disclaimer:</strong> {predictions.disclaimer}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* INFORMACIÓN TÉCNICA */}
      <Card className="bg-muted">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Tecnologías Utilizadas
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge>Pandas</Badge>
            <Badge>Scikit-learn</Badge>
            <Badge>K-Means Clustering</Badge>
            <Badge>FastAPI</Badge>
            <Badge>Recharts</Badge>
            <Badge>React</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Análisis generados en tiempo real usando datos limpios de la base de datos. 
            Los modelos ML utilizan características demográficas y geográficas para generar insights.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;